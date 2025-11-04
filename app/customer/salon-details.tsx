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
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebaseConfig";
import { colors, salonDetailsStyles as styles } from "../../styles/theme";
import CustomerBottomNav from "./CustomerBottomNav";

export default function SalonDetails() {
  const { id } = useLocalSearchParams(); // salonId
  const router = useRouter();

  const [salon, setSalon] = useState<any>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [menuCard, setMenuCard] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ✅ Fetch salon data
  useEffect(() => {
    const fetchSalonDetails = async () => {
      try {
        if (!id) return;

        // 🔹 Fetch salon
        const salonRef = doc(collection(db, "salons"), id as string);
        const salonSnap = await getDoc(salonRef);
        let salonData: any = null;
        if (salonSnap.exists())
          salonData = { id: salonSnap.id, ...salonSnap.data() };

        // 🔹 Fetch gallery and menu cards
        const galSnap = await getDocs(
          query(collection(db, "galleries"), where("salonId", "==", id))
        );

        const galleryList: string[] = [];
        let mainShopPic: string | null = null;
        let menuCardImages: string[] = [];

        galSnap.forEach((g) => {
          const data = g.data();
          if (Array.isArray(data.gallery)) galleryList.push(...data.gallery);
          if (data.shopPic) mainShopPic = data.shopPic;
          if (Array.isArray(data.menuCards)) menuCardImages.push(...data.menuCards);
        });

        if (mainShopPic) salonData = { ...salonData, shopPic: mainShopPic };

        setSalon(salonData);
        setGallery(galleryList);
        setMenuCard(menuCardImages);

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

  // ✅ Search filters
  const filteredBarbers = useMemo(() => {
    if (!search) return barbers;
    const term = search.toLowerCase();
    return barbers.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        b.specialization.toLowerCase().includes(term)
    );
  }, [search, barbers]);

  const filteredServices = useMemo(() => {
    if (!search) return menuItems;
    const term = search.toLowerCase();
    return menuItems.filter((s) => s.name.toLowerCase().includes(term));
  }, [search, menuItems]);

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={{ marginTop: 50 }}
      />
    );

  if (!salon)
    return (
      <Text style={{ textAlign: "center", color: "#777", marginTop: 20 }}>
        Salon not found.
      </Text>
    );

  // ✅ Go to booking page and pass userId + salonId
  const goToBookingPage = async () => {
    try {
      const storedCustomer = await AsyncStorage.getItem("customer");
      if (!storedCustomer) {
        alert("Please log in first!");
        router.push("/CustomerLogin");
        return;
      }

      const customer = JSON.parse(storedCustomer);
      const userId = customer.id;

      router.push(`/customer/salon-booking?salonId=${salon.id}&userId=${userId}`);
    } catch (err) {
      console.error("❌ Navigation Error:", err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 🔹 Header with search */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.primary,
          paddingHorizontal: 15,
          paddingTop: 45,
          paddingBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 8,
            flex: 1,
            marginRight: 10,
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

        <TouchableOpacity onPress={() => router.push("/customer/cart")}>
          <Ionicons
            name="cart-outline"
            size={24}
            color="#000"
            style={{ marginRight: 15 }}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/customer/profile")}>
          <Ionicons name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* 🔹 Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* 🌟 Hero Section */}
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

        {/* 📸 Gallery */}
        {gallery.length > 0 && (
          <>
            <View style={{ height: 25 }} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {gallery.map((img, index) => (
                  <Image
                    key={index}
                    source={{ uri: img }}
                    style={styles.galleryImage}
                  />
                ))}
              </ScrollView>
            </View>
          </>
        )}

        {/* 💈 Barbers */}
        <View style={[styles.section, { marginTop: 15 }]}>
          <Text style={styles.sectionTitle}>Our Barbers</Text>
          {filteredBarbers.length === 0 ? (
            <Text style={styles.emptyText}>No matching barbers found.</Text>
          ) : (
            <View style={styles.barberGrid}>
              {filteredBarbers.map((barber) => (
                <TouchableOpacity
                  key={barber.id}
                  style={styles.barberProfileCard}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={["#fff", "#f7f7f7"]}
                    style={styles.barberGradient}
                  >
                    <Image
                      source={{ uri: barber.profilePic }}
                      style={styles.barberProfileImg}
                    />
                    <Text style={styles.barberProfileName}>{barber.name}</Text>
                    <Text
                      style={{
                        color: "#777",
                        fontSize: 12,
                        marginBottom: 4,
                        textAlign: "center",
                      }}
                    >
                      {barber.specialization}
                    </Text>
                    <View style={styles.barberChipRow}>
                      <Text style={styles.barberChip}>{barber.experience}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 💇 Services */}
        <View style={[styles.section, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          {filteredServices.length === 0 ? (
            <Text style={styles.emptyText}>No matching services found.</Text>
          ) : (
            filteredServices.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>₹{service.price}</Text>
              </View>
            ))
          )}
        </View>

        {/* 📜 Menu Card */}
        {menuCard.length > 0 && (
          <View style={[styles.section, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>Menu Card</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {menuCard.map((img, index) => (
                <View key={index} style={styles.menuCardContainer}>
                  <Image
                    source={{ uri: img }}
                    style={styles.menuCardImage}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 🟡 Bottom Book Button */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 12,
            borderRadius: 10,
            marginHorizontal: 20,
            alignItems: "center",
            marginTop: 25,
            marginBottom: 30,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
          onPress={goToBookingPage}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "600",
              fontSize: 15,
              marginTop: 4,
            }}
          >
            Book Appointment
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ✅ Bottom Navigation */}
      <CustomerBottomNav />
    </View>
  );
}
