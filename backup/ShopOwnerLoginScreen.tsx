import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
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

export default function ShopOwnerLoginScreen() {
  const [input, setInput] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ Check if shop owner is already logged in
  useEffect(() => {
    const checkLogin = async () => {
      const isShopOwnerLoggedIn = await AsyncStorage.getItem("isShopOwnerLoggedIn");
      if (isShopOwnerLoggedIn === "true") {
        router.replace("/ShopOwnerDashboard"); // Skip login
      } else {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

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
      await AsyncStorage.setItem("isShopOwnerLoggedIn", "true"); // ✅ persistent login key

      Alert.alert("✅ Login successful!");
      router.replace("/ShopOwnerDashboard");
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("❌ Login Failed", "Something went wrong. Please try again.");
    }
  };

  // ✅ Loading screen to prevent flicker
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#000" }}
      contentContainerStyle={{
        padding: 24,
        paddingTop: 150, // same spacing as BarberLogin
      }}
    >
      {/* 🔹 Title Section */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: "800",
          textAlign: "center",
          color: colors.primary,
          marginBottom: 6,
        }}
      >
        🏪 Shop Owner Login
      </Text>

      <Text
        style={{
          fontSize: 15,
          textAlign: "center",
          color: "#aaa",
          marginBottom: 30,
        }}
      >
        Enter your registered shop details to access your dashboard
      </Text>

      {/* 🔹 Input Fields */}
      <TextInput
        style={{
          width: "100%",
          backgroundColor: "#fff",
          color: "#000",
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 14,
          marginBottom: 12,
          fontSize: 15,
        }}
        placeholder="Shop Name / Email / Phone"
        placeholderTextColor="#777"
        value={input}
        onChangeText={setInput}
        autoCapitalize="none"
      />

      <TextInput
        style={{
          width: "100%",
          backgroundColor: "#fff",
          color: "#000",
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 14,
          marginBottom: 20,
          fontSize: 15,
        }}
        placeholder="Password"
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

      {/* 🔹 Register Link */}
      <TouchableOpacity
        style={{ marginTop: 20 }}
        onPress={() => router.push("/shop-owner-register")}
      >
        <Text
          style={{
            color: colors.primary,
            fontSize: 16,
            textAlign: "center",
          }}
        >
          📝 New here? Register your shop
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
        <TouchableOpacity
          onPress={() => router.replace("/Selectcustomerorbarbar")}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            ⬅
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
