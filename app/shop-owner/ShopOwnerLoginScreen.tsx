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

  /* --------------------------------------------------
      CHECK IF ALREADY LOGGED IN
  -------------------------------------------------- */
  useEffect(() => {
    (async () => {
      const isLogged = await AsyncStorage.getItem("isShopOwnerLoggedIn");
      if (isLogged === "true") {
        router.replace("/shop-owner/ShopOwnerDashboard");
      } else {
        setLoading(false);
      }
    })();
  }, []);

  /* --------------------------------------------------
      LOGIN HANDLER
  -------------------------------------------------- */
  const handleLogin = async () => {
    if (!input.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please enter login credentials",
      });
      return;
    }

    try {
      const cleanInput = input.trim().toLowerCase();
      const snapshot = await getDocs(collection(db, "salons"));

      const docMatch = snapshot.docs.find((doc) => {
        const data = doc.data();
        return (
          cleanInput === (data.shopName || "").toLowerCase() ||
          cleanInput === (data.email || "").toLowerCase() ||
          cleanInput === (data.phone || "").toLowerCase()
        );
      });

      if (!docMatch) {
        Toast.show({
          type: "error",
          text1: "Not Found",
          text2: "Invalid shop details",
        });
        return;
      }

      const salon = docMatch.data();

      // 🔒 Password check
      if (salon.password !== password) {
        Toast.show({ type: "error", text1: "Wrong Password" });
        return;
      }

      // 🔍 STATUS CHECK
      if (salon.status === "pending") {
        Toast.show({
          type: "info",
          text1: "Pending Approval",
          text2: "Admin has not approved your shop yet.",
        });
        return; // ❌ STOP LOGIN
      }

      if (salon.status === "rejected") {
        Toast.show({
          type: "error",
          text1: "Rejected",
          text2: "Your shop was rejected. Please contact support.",
        });
        return; // ❌ STOP LOGIN
      }

      // ✅ APPROVED → ALLOW LOGIN
      await AsyncStorage.setItem("isShopOwnerLoggedIn", "true");
      await AsyncStorage.setItem("shopOwnerName", salon.ownerName);
      await AsyncStorage.setItem("shopId", docMatch.id);

      Toast.show({ type: "success", text1: "Login Success" });

      router.replace("/shop-owner/ShopOwnerDashboard");
    } catch (e) {
      console.log(e);
      Toast.show({ type: "error", text1: "Login Failed" });
    }
  };

  /* --------------------------------------------------
      LOADING SCREEN
  -------------------------------------------------- */
  if (loading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", backgroundColor: "#000" }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  /* --------------------------------------------------
      UI
  -------------------------------------------------- */
  return (
    <>
      <ScrollView contentContainerStyle={commonStyles.scrollContainer}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: "800",
            textAlign: "center",
            color: colors.primary,
            marginBottom: 25,
          }}
        >
          💈 Shop Owner Login
        </Text>

        <TextInput
          style={commonStyles.input}
          placeholder="Shop Name / Email / Phone"
          value={input}
          onChangeText={setInput}
        />
        <TextInput
          style={commonStyles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        /><TouchableOpacity
  style={{ marginTop: 10, alignSelf: "flex-end" }}
  onPress={() => router.push("/shop-owner/forgot-password")}
>
  <Text style={{ color: colors.primary, fontWeight: "600" }}>
    Forgot Password?
  </Text>
</TouchableOpacity>


        <TouchableOpacity style={commonStyles.button} onPress={handleLogin}>
          <Text style={commonStyles.buttonText}>Login</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={{ fontSize: 15, color: "#444" }}>New here?</Text>
          <TouchableOpacity
            onPress={() => router.push("/shop-owner/shop-owner-register")}
          >
            <Text
              style={{
                color: colors.primary,
                fontSize: 16,
                fontWeight: "600",
                marginTop: 5,
                textDecorationLine: "underline",
              }}
            >
              Register your shop
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 35, alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text
              style={{
                color: colors.primary,
                fontSize: 28,
                fontWeight: "700",
              }}
            >
              ⬅
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Toast />
    </>
  );
}
