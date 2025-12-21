import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "../../styles/theme"; // ✅ Correct import path

export default function CustomerHeader({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (text: string) => void;
}) {
  const router = useRouter();

  // 🧭 Auto-detect user city on mount
  useEffect(() => {
    const fetchCity = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Location permission not granted");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const address = await Location.reverseGeocodeAsync(location.coords);

        if (address.length > 0) {
          const city =
            address[0].city ||
            address[0].district ||
            address[0].subregion ||
            "";
          if (city) {
            console.log("📍 Auto-detected city:", city);
            setSearch(city);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching location:", error);
      }
    };

    fetchCity();
  }, []);

  return (
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
      {/* 🔍 Search Input */}
      <Ionicons name="search-outline" size={20} color="#000" />
      <TextInput
        style={{
          flex: 1,
          backgroundColor: "#fff",
          borderRadius: 8,
          marginHorizontal: 10,
          paddingHorizontal: 10,
          height: 40,
          color: "#000",
        }}
        placeholder="Search by city or salon name..."
        placeholderTextColor="#666"
        value={search}
        onChangeText={(text) => setSearch(text)}
      />

      {/* 🛒 Cart Button */}
      <TouchableOpacity onPress={() => router.push("/customer/cart")}>
        <Ionicons
          name="cart-outline"
          size={26}
          color="#000"
          style={{ marginRight: 5 }}
        />
      </TouchableOpacity>
    </View>
  );
}
