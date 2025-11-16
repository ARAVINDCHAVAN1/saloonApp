import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../styles/theme";
import CustomerBottomNav from "./CustomerBottomNav";

export default function Shop() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", alignItems: "center" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.primary,
          paddingHorizontal: 15,
          paddingTop: 45,
          paddingBottom: 12,
          width: "100%",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#000",
            marginLeft: 15,
          }}
        >
          Shop
        </Text>
      </View>

      {/* Coming Soon Section */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <Ionicons
          name="cart-outline"
          size={80}
          color={colors.primary}
          style={{ marginBottom: 20 }}
        />
        <Text
          style={{
            fontSize: 22,
            fontWeight: "700",
            color: colors.primary,
            marginBottom: 10,
          }}
        >
          Coming Soon!
        </Text>
        <Text
          style={{
            color: "#666",
            fontSize: 15,
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          We’re working hard to bring you the best shopping experience for
          salon products and accessories. Stay tuned!
        </Text>
      </View>

      <CustomerBottomNav />
    </View>
  );
}
