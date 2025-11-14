import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { db } from "../../src/firebase/firebaseConfig";
import { colors, salonDetailsStyles as styles } from "../../styles/theme";
import CustomerBottomNav from "./CustomerBottomNav";

export default function SalonDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [salon, setSalon] = useState<any>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ✅ Fetch salon details
  useEffect(() => {
    const fetchSalonDetails = async () => {
      try {
        if (!id) return;

        const salonRef = doc(collection(db, "salons"), id as string);
        const salonSnap = await getDoc(salonRef);
        let salonData: any = null;
        if (salonSnap.exists()) salonData = { id: salonSnap.id, ...salonSnap.data() };

        // 🔹 Fetch gallery & location
        const galSnap = await getDocs(
          query(collection(db, "galleries"), where("salonId", "==", id))
        );

        const galleryList: string[] = [];
        let mainShopPic: string | null = null;
        let loc: any = null;

        galSnap.forEach((g) => {
          const data = g.data();
          if (Array.isArray(data.gallery)) galleryList.push(...data.gallery);
          if (data.shopPic) mainShopPic = data.shopPic;
          if (data.location) loc = data.location;
        });

        if (mainShopPic) salonData = { ...salonData, shopPic: mainShopPic };
        if (loc) setLocation(loc);

        setSalon(salonData);
        setGallery(galleryList);

        // 🔹 Fetch barbers
        const barberSnap = await getDocs(
          query(collection(db, "barbers"), where("salonId", "==", id))
        );
        const barbersList: any[] = [];
        barberSnap.forEach((b) => {
          const data = b.data();
          const imageUrl =
            data.photoUrl ||
            data.profilePic ||
            data.image ||
            "https://cdn-icons-png.flaticon.com/512/194/194938.png";
          barbersList.push({
            id: b.id,
            name: data.name || "Unnamed Barber",
            experience: data.experience
              ? `${data.experience} years experience`
              : "Experience not specified",
            specialization: data.specialization || "General",
            profilePic: imageUrl,
          });
        });
        setBarbers(barbersList);

        // 🔹 Fetch services
        const menuSnap = await getDocs(
          query(collection(db, "services"), where("salonId", "==", id))
        );
        const menus: any[] = [];
        menuSnap.forEach((m) => {
          const data = m.data();
          menus.push({
            id: m.id,
            name: data.name || "Unnamed Service",
            price: data.price || "N/A",
          });
        });
        setMenuItems(menus);
      } catch (error) {
        console.error("❌ Error fetching salon details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSalonDetails();
  }, [id]);

  // ✅ Filters (Search only)
  const filteredBarbers = useMemo(() => {
    let list = barbers;
    if (search)
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.specialization.toLowerCase().includes(search.toLowerCase())
      );
    return list;
  }, [search, barbers]);

  const filteredServices = useMemo(() => {
    let list = menuItems;
    if (search)
      list = list.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );
    return list;
  }, [search, menuItems]);

  // ✅ Google Maps
  const openInGoogleMaps = () => {
    if (!location) return;
    const { latitude, longitude } = location;
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    );
  };

  // ✅ Booking
  const goToBookingPage = async () => {
    const storedCustomer = await AsyncStorage.getItem("customer");
    if (!storedCustomer) {
      alert("Please log in first!");
      router.push("/CustomerLogin");
      return;
    }
    const customer = JSON.parse(storedCustomer);
    router.push(`/customer/salon-booking?salonId=${salon.id}&userId=${customer.id}`);
  };

  if (loading)
    return (
      <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 🔹 Header */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 15,
          paddingTop: 45,
          paddingBottom: 12,
        }}
      >
        {/* 🔍 Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 8,
            paddingHorizontal: 10,
          }}
        >
          <Ionicons name="search-outline" size={20} color="#000" />
          <TextInput
            placeholder="Search barbers or services..."
            placeholderTextColor="#666"
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, color: "#000", marginLeft: 8 }}
          />
        </View>
      </View>

      {/* 🔹 Main Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri:
                salon.shopPic ||
                "https://img.freepik.com/free-vector/barber-shop-template_1284-15988.jpg",
            }}
            style={styles.heroImage}
          />
          <View style={styles.overlay} />
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>{salon.shopName}</Text>
            <Text style={styles.heroSubtitle}>
              Experience the art of grooming and style with professionals.
            </Text>
            <TouchableOpacity style={styles.bookButton} onPress={goToBookingPage}>
              <Ionicons name="calendar-outline" size={20} color="#fff" />
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 📸 Gallery Section */}
        {gallery.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gallery</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {gallery.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 10,
                    marginRight: 10,
                  }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* 💈 Barbers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Barbers</Text>
          {filteredBarbers.length === 0 ? (
            <Text style={styles.emptyText}>No barbers found.</Text>
          ) : (
            <View style={styles.barberGrid}>
              {filteredBarbers.map((barber) => (
                <View key={barber.id} style={styles.barberProfileCard}>
                  <LinearGradient colors={["#fff", "#f7f7f7"]} style={styles.barberGradient}>
                    <Image source={{ uri: barber.profilePic }} style={styles.barberProfileImg} />
                    <Text style={styles.barberProfileName}>{barber.name}</Text>
                    <Text style={{ color: "#777", fontSize: 12, marginBottom: 4, textAlign: "center" }}>
                      {barber.specialization}
                    </Text>
                    <View style={styles.barberChipRow}>
                      <Text style={styles.barberChip}>{barber.experience}</Text>
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 💇 Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          {filteredServices.length === 0 ? (
            <Text style={styles.emptyText}>No services found.</Text>
          ) : (
            filteredServices.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>₹{service.price}</Text>
              </View>
            ))
          )}
        </View>

        {/* 🗺️ Map */}
        {location && (
          <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
            <Text style={styles.sectionTitle}>Find Us on Map</Text>
            <TouchableOpacity activeOpacity={0.9} onPress={openInGoogleMaps}>
              <MapView
                style={{
                  height: 250,
                  borderRadius: 12,
                  overflow: "hidden",
                  marginTop: 10,
                }}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title={salon.shopName}
                  description="Tap to open Google Maps"
                />
              </MapView>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <CustomerBottomNav />
    </View>
  );
}
