import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { db } from "../../src/firebase/firebaseConfig";
import { colors, commonStyles } from "../../styles/theme";

export default function ShopOwnerLoginScreen() {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const isLoggedIn = await AsyncStorage.getItem("isShopOwnerLoggedIn");
      if (isLoggedIn === "true") {
        router.replace("/shop-owner/ShopOwnerDashboard");
      } else {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  const handleLogin = async () => {
    if (!input.trim()) {
      Toast.show({ type: "error", text1: "Missing Field ⚠️", text2: "Enter shop name, email, or phone" });
      return;
    }
    if (!password.trim()) {
      Toast.show({ type: "error", text1: "Missing Password ⚠️", text2: "Please enter your password" });
      return;
    }

    const cleanInput = input.trim().toLowerCase();

    try {
      const snapshot = await getDocs(collection(db, "salons"));
      const matchedDoc = snapshot.docs.find((doc) => {
        const data: any = doc.data();
        const shopName = (data.shopName || "").toLowerCase().trim();
        const email = (data.email || "").toLowerCase().trim();
        const phone = (data.phone || "").toLowerCase().trim();
        return cleanInput === shopName || cleanInput === email || cleanInput === phone;
      });

      if (!matchedDoc) {
        Toast.show({ type: "error", text1: "Not Found ❌", text2: "No record found. Please register." });
        return;
      }

      const salon: any = matchedDoc.data();
      const salonId = matchedDoc.id;
      const status = (salon.status || "").toLowerCase().trim();

      if (status === "pending") {
        Toast.show({ type: "info", text1: "Pending ⏳", text2: "Waiting for admin approval" });
        return;
      }
      if (status === "rejected") {
        Toast.show({ type: "error", text1: "Rejected ❌", text2: "Your registration was rejected" });
        return;
      }
      if (status !== "approved") {
        Toast.show({ type: "error", text1: "Unknown Status ⚠️", text2: "Contact support" });
        return;
      }

      if ((salon.password || "") !== password) {
        Toast.show({ type: "error", text1: "Invalid Password ❌", text2: "Please enter correct password" });
        return;
      }

      await AsyncStorage.setItem("isShopOwnerLoggedIn", "true");
      await AsyncStorage.setItem("shopId", salonId);
      await AsyncStorage.setItem("shopName", salon.shopName || "");
      await AsyncStorage.setItem("shopOwnerName", salon.ownerName || "");
      await AsyncStorage.setItem("shopEmail", salon.email || "");
      await AsyncStorage.setItem("shopPhone", salon.phone || "");
      // convenience
      await AsyncStorage.setItem("isLoggedIn", "true");
      await AsyncStorage.setItem("role", "shopOwner");

      Toast.show({ type: "success", text1: "Login Successful ✅", text2: "Welcome back!" });
      setTimeout(() => router.replace("/shop-owner/ShopOwnerDashboard"), 700);
    } catch (error) {
      console.error(error);
      Toast.show({ type: "error", text1: "Login Failed ❌", text2: "Something went wrong." });
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={commonStyles.scrollContainer}>
        <Text style={{ fontSize: 26, fontWeight: "800", textAlign: "center", color: colors.primary, marginBottom: 20 }}>
          🏪 Shop Owner Login
        </Text>

        <TextInput
          style={commonStyles.input}
          placeholder="Shop Name / Email / Phone"
          placeholderTextColor="#999"
          value={input}
          onChangeText={setInput}
          autoCapitalize="none"
        />
        <TextInput
          style={commonStyles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={commonStyles.button} onPress={handleLogin}>
          <Text style={commonStyles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 18 }} onPress={() => router.push("/shop-owner/shop-owner-register")}>
          <Text style={{ color: colors.primary, fontSize: 16, textAlign: "center" }}>
            📝 New here? Register your shop
          </Text>
        </TouchableOpacity>

        <View style={{ marginTop: 30, alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text style={{ color: colors.primary, fontSize: 22, fontWeight: "700" }}>⬅</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast />
    </>
  );
}
