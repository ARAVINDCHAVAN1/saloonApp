import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { dashboardStyles } from "../../styles/theme";
import BarberHeader from "./BarberHeader";

export default function BarberDashboard() {
  const router = useRouter();
  const [barberName, setBarberName] = useState("");
  const [salonName, setSalonName] = useState("");

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
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* ✅ Custom Header */}
      <BarberHeader barberName={barberName} />

      <ScrollView contentContainerStyle={{  }}>
        

        {/* Dashboard Cards */}
        <TouchableOpacity
          style={dashboardStyles.card}
          onPress={() => router.push("/staff/Services")}
        >
          <View style={dashboardStyles.iconBox}>
            <Text>💇</Text>
          </View>
          <View style={dashboardStyles.textContainer}>
            <Text style={dashboardStyles.cardTitle}>My Services</Text>
            <Text style={dashboardStyles.cardValue}>Check assigned tasks</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={dashboardStyles.card}
          onPress={() => router.push("/staff/Appointments")}
        >
          <View style={dashboardStyles.iconBox}>
            <Text>📅</Text>
          </View>
          <View style={dashboardStyles.textContainer}>
            <Text style={dashboardStyles.cardTitle}>My Appointments</Text>
            <Text style={dashboardStyles.cardValue}>Upcoming bookings</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={dashboardStyles.card}
          onPress={() => router.push("/staff/Profile")}
        >
          <View style={dashboardStyles.iconBox}>
            <Text>👤</Text>
          </View>
          <View style={dashboardStyles.textContainer}>
            <Text style={dashboardStyles.cardTitle}>Profile</Text>
            <Text style={dashboardStyles.cardValue}>Update details</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
