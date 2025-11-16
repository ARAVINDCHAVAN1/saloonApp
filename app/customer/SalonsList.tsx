import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Stack, useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../src/firebase/firebaseConfig";
import { colors, customerDashboardStyles } from "../../styles/theme";

// ✅ Local category images
import menImg from "../assets/men.jpg";
import spaImg from "../assets/spa.jpg";
import womenImg from "../assets/women.jpg";

type SalonInfo = {
  id: string;
  shopName: string;
  city?: string;
  state?: string;
  shopPic?: string;
  category?: string;
};

export default function SalonList() {
  const [salons, setSalons] = useState<SalonInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  // 🔹 Categories
  const categories = [
    { name: "Men", image: menImg },
    { name: "Women", image: womenImg },
    { name: "Spa", image: spaImg },
  ];

  // 🔹 Detect city on mount
  useEffect(() => {
    const fetchCity = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const location = await Location.getCurrentPositionAsync({});
        const address = await Location.reverseGeocodeAsync(location.coords);

        if (address.length > 0) {
          const city =
            address[0].city ||
            address[0].district ||
            address[0].subregion ||
            "";
          if (city) {
            console.log("📍 Detected city:", city);
            setSearch(city);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching city:", error);
      }
    };

    fetchCity();
  }, []);

  // 🔹 Load salons
  useEffect(() => {
    const loadSalons = async () => {
      try {
        setLoading(true);
        const salonsSnap = await getDocs(collection(db, "salons"));
        const allSalons: SalonInfo[] = [];

        for (const docSnap of salonsSnap.docs) {
          const data = docSnap.data();
          const salonId = docSnap.id;

          // Fetch gallery data for category & image
          const galSnap = await getDocs(
            query(collection(db, "galleries"), where("salonId", "==", salonId))
          );
          let shopPic = "";
          let category = "General";
          if (!galSnap.empty) {
            const g = galSnap.docs[0].data();
            shopPic = g.shopPic || "";
            category = g.category || "General";
          }

          allSalons.push({
            id: salonId,
            shopName: data.shopName || "Unnamed Salon",
            city: data.city || "",
            state: data.state || "",
            shopPic,
            category,
          });
        }

        // 🔹 Filter logic
        const queryText = (search || "").trim().toLowerCase();
        let filtered = allSalons;

        if (selectedCategory) {
          filtered = filtered.filter(
            (s) =>
              s.category?.toLowerCase() === selectedCategory.toLowerCase()
          );
        }

        if (queryText) {
          filtered = filtered.filter((s) => {
            const name = (s.shopName || "").toLowerCase();
            const city = (s.city || "").toLowerCase();
            const state = (s.state || "").toLowerCase();
            return (
              name.includes(queryText) ||
              city.includes(queryText) ||
              state.includes(queryText)
            );
          });
        }

        setSalons(filtered);
      } catch (e) {
        console.error("❌ Error loading salons:", e);
      } finally {
        setLoading(false);
      }
    };

    loadSalons();
  }, [search, selectedCategory]);

  // ---------------- UI -----------------
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ✅ Header (Search + Cart) */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingTop: 45,
          paddingBottom: 10,
          paddingHorizontal: 15,
        }}
      >
        {/* 🔍 Search Box */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <Ionicons name="search-outline" size={20} color="#000" />
          <TextInput
            placeholder="Search salons..."
            placeholderTextColor="#666"
            value={search}
            onChangeText={(text) => setSearch(text)}
            style={{
              flex: 1,
              color: "#000",
              marginLeft: 8,
            }}
          />
          <TouchableOpacity onPress={() => router.push("/customer/cart-empty")}>
            <Ionicons name="cart-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* 🔹 Centered Category Section with Yellow Background */}
        <View
          style={{
            marginTop: 12,
            backgroundColor: colors.primary,
            borderRadius: 10,
            paddingVertical: 10,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 10,
            }}
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  onPress={() =>
                    setSelectedCategory(isActive ? null : cat.name)
                  }
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginHorizontal: 12,
                  }}
                >
                  <View
                    style={{
                      width: 55,
                      height: 55,
                      borderRadius: 50,
                      overflow: "hidden",
                      borderWidth: 2,
                      borderColor: isActive ? "#000" : "#fff",
                      backgroundColor: "#fff",
                    }}
                  >
                    <Image
                      source={cat.image}
                      style={{
                        width: "100%",
                        height: "100%",
                        opacity: isActive ? 1 : 0.9,
                      }}
                      resizeMode="cover"
                    />
                  </View>
                  <Text
                    style={{
                      color: "#000",
                      fontWeight: isActive ? "700" : "600",
                      fontSize: 12,
                      marginTop: 4,
                      textAlign: "center",
                    }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* 🔹 Salon List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 30 }}
        />
      ) : salons.length === 0 ? (
        <Text
          style={{
            textAlign: "center",
            color: "#777",
            marginTop: 20,
          }}
        >
          No salons found.
        </Text>
      ) : (
        <ScrollView
          contentContainerStyle={[
            customerDashboardStyles.content,
            { paddingBottom: 90 },
          ]}
        >
          {salons.map((salon) => (
            <View
              key={salon.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: 10,
                marginVertical: 8,
                padding: 10,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              {salon.shopPic ? (
                <Image
                  source={{ uri: salon.shopPic }}
                  style={{
                    width: "100%",
                    height: 180,
                    borderRadius: 8,
                    backgroundColor: "#eee",
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: 180,
                    borderRadius: 8,
                    backgroundColor: "#eee",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="image-outline" size={40} color="#aaa" />
                  <Text>No Image</Text>
                </View>
              )}

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  marginTop: 10,
                  color: colors.primary,
                }}
              >
                {salon.shopName}
              </Text>

              <Text style={{ color: "#777", marginBottom: 10 }}>
                📍 {salon.city || "Unknown"}, {salon.state || "Unknown"}
              </Text>

              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  padding: 10,
                  borderRadius: 6,
                  alignItems: "center",
                }}
                onPress={() =>
                  router.push(`/customer/salon-details?id=${salon.id}`)
                }
              >
                <Text style={{ color: "#000", fontWeight: "600" }}>View</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
