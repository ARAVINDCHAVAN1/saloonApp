import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";

export default function BarberLogin() {
  const router = useRouter();
  const [barberName, setBarberName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
      const role = await AsyncStorage.getItem("role");
      const barberId = await AsyncStorage.getItem("barberId");
      if (isLoggedIn === "true" && role === "barber" && barberId) {
        router.replace("/staff/BarberDashboard");
      } else {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogin = async () => {
    if (!barberName.trim() || !password.trim()) {
      Toast.show({ type: "error", text1: "Missing fields" });
      return;
    }

    try {
      const snap = await getDocs(
        query(collection(db, "barbers"), where("name", "==", barberName.trim()))
      );

      if (snap.empty) {
        Toast.show({ type: "error", text1: "Barber not found" });
        return;
      }

      const barberDoc = snap.docs[0];
      const data: any = barberDoc.data();

      if ((data.password || "").trim() !== password.trim()) {
        Toast.show({ type: "error", text1: "Wrong password" });
        return;
      }

      await AsyncStorage.multiSet([
        ["isLoggedIn", "true"],
        ["role", "barber"],
        ["barberId", barberDoc.id],
        ["barberName", data.name || ""],
      ]);

      if (data.salonId) {
        await AsyncStorage.setItem("salonId", data.salonId);
        const salonSnap = await getDoc(doc(db, "salons", data.salonId));
        if (salonSnap.exists()) {
          await AsyncStorage.setItem("shopName", (salonSnap.data() as any).shopName || "");
        }
      }

      Toast.show({ type: "success", text1: "Login Success" });
      router.replace("/staff/BarberDashboard");
    } catch (e) {
      console.error(e);
      Toast.show({ type: "error", text1: "Login failed" });
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#000" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 28, paddingTop: 350 }}>
          <Text style={{ textAlign: "center", fontSize: 28, color: colors.primary, fontWeight: "800", marginBottom: 8 }}>
            💈 Barber Login
          </Text>
        
          <TextInput
            placeholder="Barber Name"
            placeholderTextColor="#777"
            style={{ backgroundColor: "#fff", color: "#000", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 12 }}
            value={barberName}
            onChangeText={setBarberName}
            autoCapitalize="words"
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#777"
            secureTextEntry
            style={{ backgroundColor: "#fff", color: "#000", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 18 }}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            onPress={handleLogin}
            style={{ backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 10 }}
          >
            <Text style={{ textAlign: "center", fontSize: 18, fontWeight: "700", color: "#000" }}>Login</Text>
          </TouchableOpacity>
<View style={{ marginTop: 30, alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text style={{ color: colors.primary, fontSize: 22, fontWeight: "700" }}>⬅</Text>
          </TouchableOpacity>
        </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <Toast />
    </>
  );
}
