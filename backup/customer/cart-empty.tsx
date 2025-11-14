import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../styles/theme";

export default function CartEmpty() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 20,
      }}
    >
      <Ionicons name="cart-outline" size={80} color="#ccc" />
      <Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          color: "#555",
          marginTop: 20,
        }}
      >
        Your cart is empty
      </Text>
      <Text style={{ color: "#888", marginTop: 8, textAlign: "center" }}>
        Looks like you haven’t added anything yet.
      </Text>

      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          marginTop: 25,
          backgroundColor: colors.primary,
          paddingVertical: 12,
          paddingHorizontal: 25,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#000", fontWeight: "700", fontSize: 16 }}>
          Go Back
        </Text>
      </TouchableOpacity>
    </View>
  );
}
