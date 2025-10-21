import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../firebaseConfig";
import { commonStyles } from "../styles/theme";

export default function ShopOwnerLoginScreen() {
  const [input, setInput] = useState<string>("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!input) {
      Alert.alert("⚠️ Please enter Shop Name, Email, or Phone");
      return;
    }

    const cleanInput = input.trim().toLowerCase();

    try {
      const snapshot = await getDocs(collection(db, "salons"));

      let salon: any = null;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const shopName = (data.shopName || "").trim().toLowerCase();
        const email = (data.email || "").trim().toLowerCase();
        const phone = (data.phone || "").trim().toLowerCase();

        if (shopName === cleanInput || email === cleanInput || phone === cleanInput) {
          salon = data;
        }
      });

      if (salon) {
        const status = (salon.status || "").trim().toLowerCase();

        if (status === "approved") {
          await AsyncStorage.setItem("shopOwnerName", salon.ownerName || "");
          await AsyncStorage.setItem("shopId", salon.shopName || "");

          Alert.alert("✅ Login successful! Redirecting...");
          router.push("/ShopOwnerDashboard");
        } else if (status === "pending") {
          Alert.alert("⏳ Your registration is still pending admin approval.");
        } else if (status === "rejected") {
          Alert.alert("❌ Your registration was rejected by the admin.");
        } else {
          Alert.alert("⚠️ Unknown status. Please contact support.");
        }
      } else {
        Alert.alert("❌ No record found. Please register first.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("❌ Login failed. Try again.");
    }
  };

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.title}>🔑 Shop Owner Login</Text>
      <Text style={commonStyles.subtitle}>
        Enter Shop Name, Email, or Phone to continue
      </Text>

      <TextInput
        placeholder="Shop Name / Email / Phone"
        value={input}
        onChangeText={setInput}
        style={commonStyles.input}
        autoCapitalize="none"
      />

      <TouchableOpacity style={commonStyles.button} onPress={handleLogin}>
        <Text style={commonStyles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={commonStyles.backButton}
        onPress={() => router.back()}
      >
        <Text style={commonStyles.backText}>⬅ Back</Text>
      </TouchableOpacity>
    </View>
  );
}
