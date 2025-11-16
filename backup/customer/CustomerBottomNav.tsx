import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../styles/theme";

export default function CustomerBottomNav() {
  const router = useRouter();
  const path = usePathname();

  const isActive = (route: string) => path === route;

  return (
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
        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 5,
      }}
    >
      {/* Home */}
      <TouchableOpacity
        onPress={() => router.push("/customer")}
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: 70,
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name="home-outline"
          size={24}
          color={isActive("/customer") ? colors.primary : "#777"}
        />
        <Text
          style={{
            textAlign: "center",
            fontSize: 12,
            marginTop: 2,
            color: isActive("/customer") ? colors.primary : "#777",
          }}
        >
          Home
        </Text>
      </TouchableOpacity>

      {/* Bookings */}
      <TouchableOpacity
        onPress={() => router.push("/customer/booking-history")}
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: 70,
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name="book-outline"
          size={24}
          color={
            isActive("/customer/booking-history") ? colors.primary : "#777"
          }
        />
        <Text
          style={{
            textAlign: "center",
            fontSize: 12,
            marginTop: 2,
            color: isActive("/customer/booking-history")
              ? colors.primary
              : "#777",
          }}
        >
          Bookings
        </Text>
      </TouchableOpacity>

      {/* Shop */}
      <TouchableOpacity
        onPress={() => router.push("/customer/shop")}
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: 70,
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name="cart-outline"
          size={24}
          color={isActive("/customer/shop") ? colors.primary : "#777"}
        />
        <Text
          style={{
            textAlign: "center",
            fontSize: 12,
            marginTop: 2,
            color: isActive("/customer/shop") ? colors.primary : "#777",
          }}
        >
          Shop
        </Text>
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity
        onPress={() => router.push("/customer/profile")}
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: 70,
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name="person-outline"
          size={24}
          color={isActive("/customer/profile") ? colors.primary : "#777"}
        />
        <Text
          style={{
            textAlign: "center",
            fontSize: 12,
            marginTop: 2,
            color: isActive("/customer/profile") ? colors.primary : "#777",
          }}
        >
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}
