import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { colors } from "../../styles/theme";

export default function CustomerHeader({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (text: string) => void;
}) {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const router = useRouter();

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
    <View>
      {/* 🔹 Header Bar */}
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
        {/* 🔍 Search */}
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
          onChangeText={(text) => setSearch(text)} // 👈 instant updates
        />

        <TouchableOpacity onPress={() => router.push("/customer/cart")}>
          <Ionicons name="cart-outline" size={24} color="#000" style={{ marginRight: 15 }} />
        </TouchableOpacity>

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
              onPress={() => {
                setSettingsVisible(false);
                router.push("/customer/profile");
              }}
              style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}
            >
              <Ionicons name="person-outline" size={22} color={colors.primary} />
              <Text style={{ marginLeft: 10, fontSize: 16 }}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSettingsVisible(false);
                router.push("/customer-login");
              }}
              style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}
            >
              <Ionicons name="log-out-outline" size={22} color="red" />
              <Text style={{ marginLeft: 10, fontSize: 16, color: "red" }}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
