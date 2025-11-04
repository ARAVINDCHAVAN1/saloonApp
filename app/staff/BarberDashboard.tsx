// app/staff/BarberDashboard.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { colors, dashboardStyles } from "../../styles/theme";
import BarberHeader from "./BarberHeader";

export default function BarberDashboard() {
  const router = useRouter();
  const [barberName, setBarberName] = useState("");
  const [salonName, setSalonName] = useState("");

  // 🔹 Load barber session data
  useEffect(() => {
    const load = async () => {
      try {
        const name = await AsyncStorage.getItem("barberName");
        const shop = await AsyncStorage.getItem("shopName");

        if (!name) {
          router.replace("/BarberLogin"); // redirect if no session
          return;
        }

        setBarberName(name);
        setSalonName(shop || "Salon");
      } catch (e) {
        console.error("Error loading barber session:", e);
      }
    };
    load();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ✅ Top Header */}
      <BarberHeader />

      {/* ✅ Dashboard Content */}
      <ScrollView
        contentContainerStyle={{
          paddingVertical: 20,
          paddingHorizontal: 16,
        }}
      >
   

      
        {/* --- My Appointments --- */}
        <TouchableOpacity
          style={dashboardStyles.card}
          onPress={() => router.push("/staff/Appointments")}
        >
          <View style={dashboardStyles.iconBox}>
            <Text style={{ fontSize: 22 }}>📅</Text>
          </View>
          <View style={dashboardStyles.textContainer}>
            <Text style={dashboardStyles.cardTitle}>My Appointments</Text>
            <Text style={dashboardStyles.cardValue}>
              Check your upcoming bookings
            </Text>
          </View>
        </TouchableOpacity>

        {/* --- My Profile --- */}
        <TouchableOpacity
          style={dashboardStyles.card}
          onPress={() => router.push("/staff/BarberProfile")}
        >
          <View style={dashboardStyles.iconBox}>
            <Text style={{ fontSize: 22 }}>👤</Text>
          </View>
          <View style={dashboardStyles.textContainer}>
            <Text style={dashboardStyles.cardTitle}>My Profile</Text>
            <Text style={dashboardStyles.cardValue}>
              Edit your personal details
            </Text>
          </View>
        </TouchableOpacity>

        {/* --- My Slots --- */}
        <TouchableOpacity
          style={dashboardStyles.card}
          onPress={() => router.push("/staff/MySlots")}
        >
          <View style={dashboardStyles.iconBox}>
            <Text style={{ fontSize: 22 }}>🕒</Text>
          </View>
          <View style={dashboardStyles.textContainer}>
            <Text style={dashboardStyles.cardTitle}>My Slots</Text>
            <Text style={dashboardStyles.cardValue}>
              View your assigned time slots
            </Text>
          </View>
        </TouchableOpacity>

      
      </ScrollView>
    </View>
  );
}
