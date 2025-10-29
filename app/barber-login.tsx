import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../firebaseConfig";
import { commonStyles, loginStyles } from "../styles/theme";

export default function BarberLogin() {
  const router = useRouter();
  const [barberName, setBarberName] = useState("");
  const [password, setPassword] = useState("");

  const validateAndLogin = async () => {
    if (!barberName || !password) {
      Alert.alert("❌ Missing Fields", "Please enter name and password");
      return;
    }

    try {
      const cleanPassword = password.trim();

      // 1️⃣ Find barber by name
      const barbersRef = collection(db, "barbers");
      const barberSnap = await getDocs(
        query(barbersRef, where("name", "==", barberName))
      );

      if (barberSnap.empty) {
        Alert.alert("❌ Invalid Barber", "No barber found with this name");
        return;
      }

      const barberDoc = barberSnap.docs[0];
      const barberData = barberDoc.data();

      // 2️⃣ Validate password
      if (!barberData.password || barberData.password !== cleanPassword) {
        Alert.alert("❌ Wrong Password", "Password does not match");
        return;
      }

      // 3️⃣ Save barber session
      await AsyncStorage.setItem("barberName", barberData.name);
      await AsyncStorage.setItem("barberId", barberDoc.id);

      // 👉 Ensure salonId is saved
      if (barberData.salonId) {
        await AsyncStorage.setItem("salonId", barberData.salonId);

        // Optional: also get salonName
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
      Alert.alert("❌ Error", "Something went wrong during login");
    }
  };

  return (
    <View style={loginStyles.container}>
      <Text style={loginStyles.title}>💈 Barber Login</Text>
      <Text style={loginStyles.subtitle}>
        Enter your name and password to access dashboard
      </Text>

      <TextInput
        style={commonStyles.input}
        placeholder="Enter Barber Name"
        placeholderTextColor="#777"
        value={barberName}
        onChangeText={setBarberName}
      />

      <TextInput
        style={commonStyles.input}
        placeholder="Enter Password"
        placeholderTextColor="#777"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={commonStyles.button} onPress={validateAndLogin}>
        <Text style={commonStyles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={loginStyles.backButton}
        onPress={() => router.back()}
      >
        <Text style={loginStyles.backText}>⬅ Back</Text>
      </TouchableOpacity>
    </View>
  );
}
