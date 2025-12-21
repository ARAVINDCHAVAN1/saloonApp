import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../styles/theme";
import CustomerBottomNav from "./CustomerBottomNav";

export default function EmptyCart() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
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
          Cart
        </Text>
      </View>

      {/* Coming Soon */}
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
          Your cart feature is under development.  
          You’ll be able to add and purchase products very soon!
        </Text>
      </View>

      <CustomerBottomNav />
    </View>
  );
}
