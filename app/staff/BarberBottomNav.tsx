// app/staff/BarberBottomNav.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function BarberBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        borderTopWidth: 1,
        backgroundColor: "#fff",
        borderColor: "#ddd",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        elevation: 10,
      }}
    >
      {/* HOME */}
      <TouchableOpacity
        style={{ width: 80, alignItems: "center" }}
        onPress={() => router.replace("/staff/BarberDashboard")}
      >
        <Ionicons
          name="home-outline"
          size={26}
          color={isActive("/staff/BarberDashboard") ? "#000" : "#777"}
        />
        <Text style={{ fontSize: 12 }}>Home</Text>
      </TouchableOpacity>

      {/* MY SLOTS */}
      <TouchableOpacity
        style={{ width: 80, alignItems: "center" }}
        onPress={() => router.replace("/staff/MySlots")}
      >
        <Ionicons
          name="time-outline"
          size={26}
          color={isActive("/staff/MySlots") ? "#000" : "#777"}
        />
        <Text style={{ fontSize: 12 }}>Slots</Text>
      </TouchableOpacity>

      {/* APPOINTMENTS */}
      <TouchableOpacity
        style={{ width: 80, alignItems: "center" }}
        onPress={() => router.replace("/staff/Appointments")}
      >
        <Ionicons
          name="calendar-outline"
          size={26}
          color={isActive("/staff/Appointments") ? "#000" : "#777"}
        />
        <Text style={{ fontSize: 12 }}>Appointments</Text>
      </TouchableOpacity>

      {/* PROFILE */}
      <TouchableOpacity
        style={{ width: 80, alignItems: "center" }}
        onPress={() => router.replace("/staff/BarberProfile")}
      >
        <Ionicons
          name="person-outline"
          size={26}
          color={isActive("/staff/BarberProfile") ? "#000" : "#777"}
        />
        <Text style={{ fontSize: 12 }}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}
