import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebaseConfig";
import { colors } from "../styles/theme";

export default function BarberLogin() {
  const router = useRouter();
  const [barberName, setBarberName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Automatically redirect if already logged in
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem("isBarberLoggedIn");
        if (isLoggedIn === "true") {
          router.replace("/staff/BarberDashboard"); // skip login if session exists
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Login check failed:", error);
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  // ✅ Validate and handle login
  const handleLogin = async () => {
    if (!barberName.trim() || !password.trim()) {
      Alert.alert("⚠️ Missing Fields", "Please enter both name and password.");
      return;
    }

    try {
      const cleanName = barberName.trim();
      const cleanPassword = password.trim();

      const barbersRef = collection(db, "barbers");
      const barberSnap = await getDocs(query(barbersRef, where("name", "==", cleanName)));

      if (barberSnap.empty) {
        Alert.alert("❌ Invalid Barber", "No barber found with this name.");
        return;
      }

      const barberDoc = barberSnap.docs[0];
      const barberData = barberDoc.data();

      if (barberData.password !== cleanPassword) {
        Alert.alert("❌ Wrong Password", "Password does not match.");
        return;
      }

      // ✅ Save barber session
      await AsyncStorage.multiSet([
        ["isBarberLoggedIn", "true"],
        ["barberId", barberDoc.id],
        ["barberName", barberData.name],
      ]);

      // ✅ Save salon info if available
      if (barberData.salonId) {
        await AsyncStorage.setItem("salonId", barberData.salonId);
        const salonRef = doc(db, "salons", barberData.salonId);
        const salonSnap = await getDoc(salonRef);

        if (salonSnap.exists()) {
          const salonData = salonSnap.data();
          await AsyncStorage.setItem("shopName", salonData.shopName || "");
        }
      }

      Alert.alert("✅ Login Successful", `Welcome ${barberData.name}!`);
      router.replace("/staff/BarberDashboard");
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert("❌ Error", "Something went wrong during login.");
    }
  };

  // ✅ Handle logout (for use in header/dashboard)
  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "isBarberLoggedIn",
        "barberId",
        "barberName",
        "salonId",
        "shopName",
      ]);
      router.replace("/barber-login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // ✅ Show loading spinner during session check
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
      </View>
    );
  }

  // ✅ UI
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#000" }}
      contentContainerStyle={{
        padding: 24,
        paddingTop: 150,
      }}
    >
      {/* 🔹 Title */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: "800",
          textAlign: "center",
          color: colors.primary,
          marginBottom: 6,
        }}
      >
        💈 Barber Login
      </Text>

      <Text
        style={{
          fontSize: 15,
          textAlign: "center",
          color: "#aaa",
          marginBottom: 30,
        }}
      >
        Enter your name and password to access your dashboard
      </Text>

      {/* 🔹 Inputs */}
      <TextInput
        style={{
          backgroundColor: "#fff",
          color: "#000",
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 14,
          marginBottom: 12,
          fontSize: 15,
        }}
        placeholder="Enter Barber Name"
        placeholderTextColor="#777"
        value={barberName}
        onChangeText={setBarberName}
      />

      <TextInput
        style={{
          backgroundColor: "#fff",
          color: "#000",
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 14,
          marginBottom: 20,
          fontSize: 15,
        }}
        placeholder="Enter Password"
        placeholderTextColor="#777"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* 🔹 Login Button */}
      <TouchableOpacity
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 10,
          marginTop: 10,
        }}
        onPress={handleLogin}
      >
        <Text
          style={{
            color: "#000",
            textAlign: "center",
            fontSize: 18,
            fontWeight: "700",
          }}
        >
          Login
        </Text>
      </TouchableOpacity>

      {/* 🔹 Back Button */}
      <View
        style={{
          marginTop: 40,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 40,
        }}
      >
        <TouchableOpacity onPress={() => router.replace("/Selectcustomerorbarbar")}>
          <Text
            style={{
              color: colors.primary,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            ⬅ Back
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
