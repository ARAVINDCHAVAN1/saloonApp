import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../styles/theme";

export default function BarberFooter({ active }: { active?: "home" | "slots" | "appointments" | "profile" }) {
  const router = useRouter();
  const path = usePathname();

  const Item = ({ label, icon, onPress, focused }: any) => (
    <TouchableOpacity
      onPress={onPress}
      style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8 }}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={22} color={focused ? colors.primary : "#888"} />
      <Text style={{ marginTop: 4, fontSize: 12, color: focused ? colors.primary : "#888" }}>{label}</Text>
    </TouchableOpacity>
  );

  const isFocused = (route: string) => {
    if (active) return false; // using explicit prop wins
    return path?.toLowerCase().includes(route.toLowerCase());
  };

  return (
    <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: "#222", backgroundColor: "#0b0b0b" }}>
      <Item
        label="Home"
        icon="home-outline"
        focused={active === "home" || isFocused("BarberDashboard")}
        onPress={() => router.replace("/staff/BarberDashboard")}
      />
      <Item
        label="Slots"
        icon="time-outline"
        focused={active === "slots" || isFocused("MySlots")}
        onPress={() => router.replace("/staff/MySlots")}
      />
      <Item
        label="Appointments"
        icon="calendar-outline"
        focused={active === "appointments" || isFocused("Appointments")}
        onPress={() => router.replace("/staff/Appointments")}
      />
      <Item
        label="Profile"
        icon="person-circle-outline"
        focused={active === "profile" || isFocused("BarberProfile")}
        onPress={() => router.replace("/staff/BarberProfile")}
      />
    </View>
  );
}
