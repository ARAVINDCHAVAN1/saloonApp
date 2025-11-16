import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../styles/theme";

export default function EarnWithBeauty() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 🔹 Header like Profile */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.primary,
          paddingHorizontal: 15,
          paddingTop: 45,
          paddingBottom: 15,
          elevation: 3,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 20,
            fontWeight: "700",
            color: "#000",
            marginRight: 34,
          }}
        >
          
        </Text>
      </View>

      {/* 🔹 Content */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <Ionicons name="briefcase-outline" size={80} color={colors.primary} />
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#333",
            marginTop: 15,
            textAlign: "center",
          }}
        >
          Partnership Program Coming Soon
        </Text>
        <Text
          style={{
            color: "#777",
            textAlign: "center",
            fontSize: 14,
            marginTop: 10,
            lineHeight: 20,
          }}
        >
          We're working on an exclusive opportunity for beauty professionals and
          partners. Stay tuned to collaborate and grow with Beauty Centre.
        </Text>
      </View>
    </View>
  );
}
