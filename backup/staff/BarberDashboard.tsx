import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, dashboardStyles } from "../../styles/theme";
import BarberHeader from "./BarberHeader";

export default function BarberDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [barberName, setBarberName] = useState("");
  const [salonName, setSalonName] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 Safe session check
  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      try {
        const loggedIn = await AsyncStorage.getItem("isBarberLoggedIn");
        const name = await AsyncStorage.getItem("barberName");
        const shop = await AsyncStorage.getItem("shopName");

        // Not logged in → redirect once
        if (loggedIn !== "true" || !name) {
          if (mounted && pathname === "/staff/BarberDashboard") {
            setLoading(false);
            // Small timeout prevents multiple navigation triggers
            setTimeout(() => {
              if (pathname === "/staff/BarberDashboard") {
                router.replace("/barber-login");
              }
            }, 150);
          }
          return;
        }

        // Logged in → set info
        if (mounted) {
          setBarberName(name);
          setSalonName(shop || "Salon");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error checking session:", err);
        if (mounted) setLoading(false);
      }
    };

    verifySession();
    return () => {
      mounted = false;
    };
  }, [pathname]);

  // 🔹 Logout function
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove([
            "isBarberLoggedIn",
            "barberId",
            "barberName",
            "salonId",
            "shopName",
          ]);
          router.replace("/barber-login");
        },
      },
    ]);
  };

  // 🔹 Loader while checking session
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: "#fff", marginTop: 10 }}>Loading dashboard...</Text>
      </View>
    );
  }

  // ✅ Dashboard content
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BarberHeader />
      <ScrollView
        contentContainerStyle={{
          paddingVertical: 20,
          paddingHorizontal: 16,
        }}
      >
        {/* Welcome Section */}
        <View style={{ marginBottom: 20, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 20,
              color: colors.primary,
              fontWeight: "700",
              marginBottom: 5,
            }}
          >
            Welcome, {barberName || "Barber"} 👋
          </Text>
          <Text style={{ color: "#aaa" }}>Salon: {salonName}</Text>
        </View>

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

        {/* --- Logout --- */}
        <TouchableOpacity
          style={[
            dashboardStyles.card,
            {
              borderColor: "red",
              borderWidth: 1,
              marginTop: 25,
              backgroundColor: "rgba(255,0,0,0.1)",
            },
          ]}
          onPress={handleLogout}
        >
          <View style={dashboardStyles.iconBox}>
            <Text style={{ fontSize: 22 }}>🚪</Text>
          </View>
          <View style={dashboardStyles.textContainer}>
            <Text
              style={[dashboardStyles.cardTitle, { color: "red", fontWeight: "700" }]}
            >
              Logout
            </Text>
            <Text style={[dashboardStyles.cardValue, { color: "#ffaaaa" }]}>
              Tap to end your session
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
