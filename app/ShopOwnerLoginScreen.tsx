import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";
import { db } from "../firebaseConfig";
import { colors, commonStyles, images, layout } from "../styles/theme";

export default function ShopOwnerLoginScreen() {
  const [input, setInput] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!input.trim()) {
      Alert.alert("⚠️ Missing Field", "Please enter Shop Name, Email, or Phone");
      return;
    }
    if (!password.trim()) {
      Alert.alert("⚠️ Missing Field", "Please enter your password");
      return;
    }

    const cleanInput = input.trim().toLowerCase();

    try {
      const snapshot = await getDocs(collection(db, "salons"));

      // Find matching salon by shopName, email, or phone
      const matchedDoc = snapshot.docs.find((doc) => {
        const data = doc.data();
        const shopName = (data.shopName || "").trim().toLowerCase();
        const email = (data.email || "").trim().toLowerCase();
        const phone = (data.phone || "").trim().toLowerCase();

        return (
          shopName === cleanInput ||
          email === cleanInput ||
          phone === cleanInput
        );
      });

      if (!matchedDoc) {
        Alert.alert("❌ Not Found", "No record found. Please register first.");
        return;
      }

      const salon = matchedDoc.data();
      const salonDocId = matchedDoc.id;

      // ✅ Check status
      const status = (salon.status || "").trim().toLowerCase();
      if (status === "pending") {
        Alert.alert("⏳ Pending", "Your registration is pending admin approval.");
        return;
      }
      if (status === "rejected") {
        Alert.alert("❌ Rejected", "Your registration was rejected.");
        return;
      }
      if (status !== "approved") {
        Alert.alert("⚠️ Unknown Status", "Please contact support.");
        return;
      }

      // ✅ Check password
      if ((salon.password || "") !== password) {
        Alert.alert("❌ Invalid Password", "The password you entered is incorrect.");
        return;
      }

      // ✅ Save session details
      await AsyncStorage.setItem("shopId", salonDocId);
      await AsyncStorage.setItem("shopName", salon.shopName || "");
      await AsyncStorage.setItem("shopOwnerName", salon.ownerName || "");
      await AsyncStorage.setItem("shopEmail", salon.email || "");
      await AsyncStorage.setItem("shopPhone", salon.phone || "");

      Alert.alert("✅ Login successful!");

      // ✅ Navigate to Dashboard and replace history so user can't go back
      router.replace("/ShopOwnerDashboard");
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("❌ Login Failed", "Something went wrong. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={commonStyles.scrollContainer}>
      {/* Logo */}
      {/* ✅ moved resizeMode here instead of styles */}
      <Image source={images.logo} style={layout.logo} resizeMode="contain" />

      {/* Title */}
      <Text style={commonStyles.title}>🔑 Shop Owner Login</Text>

      {/* Username input */}
      <TextInput
        placeholder="Shop Name / Email / Phone"
        value={input}
        onChangeText={setInput}
        style={commonStyles.input}
        autoCapitalize="none"
      />

      {/* Password input */}
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={commonStyles.input}
      />

      {/* Login button */}
      <TouchableOpacity style={commonStyles.button} onPress={handleLogin}>
        <Text style={commonStyles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Register link */}
      <TouchableOpacity
        style={{ marginTop: 20 }}
        onPress={() => router.push("/shop-owner-register")}
      >
        <Text style={{ color: colors.primary, fontSize: 16 }}>
          New here? Register from the home screen.
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
