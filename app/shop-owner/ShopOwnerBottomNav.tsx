// app/shop-owner/ShopOwnerBottomNav.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../styles/theme";
import MyCoins from "./MyCoins";

export default function ShopOwnerBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  // ⭐ Popup animation
  const [showCoins, setShowCoins] = useState(false);
  const scaleAnim = useState(new Animated.Value(0))[0]; // Zoom scale

  const openSheet = () => {
    setShowCoins(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setShowCoins(false));
  };

  return (
    <>
      {/* ⭐ Bottom Navigation */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          paddingVertical: 8,
          borderTopWidth: 1,
          borderColor: "#eee",
          backgroundColor: "#fff",
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 70,
          elevation: 20,
        }}
      >
        {/* HOME */}
        <TouchableOpacity
          style={{ width: 80, alignItems: "center" }}
          onPress={() => router.replace("/shop-owner/ShopOwnerDashboard")}
        >
          <Ionicons
            name="home-outline"
            size={26}
            color={isActive("/shop-owner/ShopOwnerDashboard") ? colors.primary : "#777"}
          />
          <Text style={{ fontSize: 12 }}>Home</Text>
        </TouchableOpacity>

        {/* BOOKINGS */}
        <TouchableOpacity
          style={{ width: 80, alignItems: "center" }}
          onPress={() => router.replace("/shop-owner/ShopOwnerBookings")}
        >
          <Ionicons
            name="book-outline"
            size={26}
            color={isActive("/shop-owner/ShopOwnerBookings") ? colors.primary : "#777"}
          />
          <Text style={{ fontSize: 12 }}>Bookings</Text>
        </TouchableOpacity>

        {/* SLOTS */}
        <TouchableOpacity
          style={{ width: 80, alignItems: "center" }}
          onPress={() => router.replace("/shop-owner/ShopOwnerSlotTabs")}
        >
          <Ionicons
            name="time-outline"
            size={26}
            color={isActive("/shop-owner/ShopOwnerSlot") ? colors.primary : "#777"}
          />
          <Text style={{ fontSize: 12 }}>Slots</Text>
        </TouchableOpacity>

        {/* COINS */}
        <TouchableOpacity
          style={{ width: 80, alignItems: "center" }}
          onPress={openSheet}
        >
          <Ionicons name="wallet-outline" size={26} color={colors.primary} />
          <Text style={{ fontSize: 12, color: colors.primary }}>Coins</Text>
        </TouchableOpacity>
      </View>

      {/* ⭐ Popup Modal for Coins */}
      <Modal visible={showCoins} transparent animationType="none">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Animated.View
            style={{
              width: "90%",
              height: "60%",
              backgroundColor: "#fff",
              borderRadius: 20,
              overflow: "hidden",
              transform: [{ scale: scaleAnim }],
              elevation: 20,
            }}
          >
            {/* ❌ Close Button */}
            <TouchableOpacity
              onPress={closeSheet}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 10,
                backgroundColor: "#fff",
                padding: 6,
                borderRadius: 20,
                elevation: 6,
              }}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            {/* Coins Component */}
            <MyCoins />
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}
