import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Stack, useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebaseConfig";
import { colors, customerDashboardStyles } from "../../styles/theme";

type SalonInfo = {
  id: string;
  shopName: string;
  city?: string;
  state?: string;
  shopPic?: string;
};

export default function SalonList() {
  const [salons, setSalons] = useState<SalonInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [settingsVisible, setSettingsVisible] = useState(false);
  const router = useRouter();

  // 🔹 Auto-detect city on mount
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

  // 🔹 Load salons (filter by search)
  useEffect(() => {
    const loadSalons = async () => {
      try {
        setLoading(true);
        const salonsSnap = await getDocs(collection(db, "salons"));
        const allSalons: SalonInfo[] = [];

        for (const docSnap of salonsSnap.docs) {
          const data = docSnap.data();
          const salonId = docSnap.id;

          // optional gallery image
          const galSnap = await getDocs(
            query(collection(db, "galleries"), where("salonId", "==", salonId))
          );
          let shopPic = "";
          if (!galSnap.empty) {
            const g = galSnap.docs[0].data();
            shopPic = g.shopPic || "";
          }

          allSalons.push({
            id: salonId,
            shopName: data.shopName || "Unnamed Salon",
            city: data.city || "",
            state: data.state || "",
            shopPic,
          });
        }

        // 🔹 Case-insensitive filtering
        const queryText = (search || "").trim().toLowerCase();
        const filtered = queryText
          ? allSalons.filter((s) => {
              const name = (s.shopName || "").toLowerCase();
              const city = (s.city || "").toLowerCase();
              const state = (s.state || "").toLowerCase();
              return (
                name.includes(queryText) ||
                city.includes(queryText) ||
                state.includes(queryText)
              );
            })
          : allSalons;

        setSalons(filtered);
      } catch (e) {
        console.error("❌ Error loading salons:", e);
      } finally {
        setLoading(false);
      }
    };

    loadSalons();
  }, [search]);

  // 🔹 Instant Logout + Redirect
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("isLoggedIn");
      await AsyncStorage.removeItem("customer");
      setSettingsVisible(false);
      router.replace("./customer-login"); // ✅ Instant redirect
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Error", "Something went wrong while logging out.");
    }
  };

  // ---------------- UI -----------------
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ✅ Yellow Header (Search + Cart + Settings) */}
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
        {/* Search box */}
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
            placeholder="Search salons..."
            placeholderTextColor="#666"
            value={search}
            onChangeText={(text) => setSearch(text)}
            style={{ flex: 1, color: "#000", marginLeft: 8 }}
          />
        </View>

        {/* 🛒 Cart button */}
        <TouchableOpacity onPress={() => router.push("/customer/cart-empty")}>
          <Ionicons
            name="cart-outline"
            size={24}
            color="#000"
            style={{ marginRight: 15 }}
          />
        </TouchableOpacity>

        {/* ⚙️ Settings button */}
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* ⚙️ Settings Modal */}
      <Modal
        visible={settingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setSettingsVisible(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              width: 250,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 10,
              }}
            >
              <Ionicons name="log-out-outline" size={22} color="red" />
              <Text style={{ marginLeft: 10, fontSize: 16, color: "red" }}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 🔹 Salon List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 30 }}
        />
      ) : salons.length === 0 ? (
        <Text style={{ textAlign: "center", color: "#777", marginTop: 20 }}>
          No salons found for “{search}”.
        </Text>
      ) : (
        <ScrollView
          contentContainerStyle={[customerDashboardStyles.content, { paddingBottom: 90 }]}
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
