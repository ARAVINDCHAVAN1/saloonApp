import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";

export default function MyCoins() {
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
const salonId = await AsyncStorage.getItem("shopId");
        console.log("SALON_ID:", salonId);

        if (!salonId) {
          console.log("No SALON_ID found");
          setLoading(false);
          return;
        }

        // ✅ Query correct collection & fields
        const q = query(
          collection(db, "userBookings"),
          where("salonId", "==", salonId),
          where("status", "==", "paid")
        );

        const snap = await getDocs(q);

        const paidCount = snap.size;
        setCount(paidCount);
        setCoins(paidCount * 5);
      } catch (e) {
        console.log("ERROR:", e);
      }
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  return (
    <LinearGradient
      colors={[colors.primary, "#6c5ce7"]}
      style={{ flex: 1, padding: 20 }}
    >
      <Text
        style={{
          fontSize: 26,
          fontWeight: "800",
          color: "#fff",
          marginTop: 20,
        }}
      >
        My Coins
      </Text>

      {/* ✅ Coin Card */}
      <View
        style={{
          marginTop: 40,
          backgroundColor: "white",
          padding: 30,
          borderRadius: 20,
          alignItems: "center",
          elevation: 10,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 10 }}>
          Total Coins
        </Text>

        <Text
          style={{
            fontSize: 48,
            fontWeight: "900",
            color: colors.primary,
          }}
        >
          🪙 {coins}
        </Text>
      </View>

      {/* ✅ List details */}
      <View style={{ marginTop: 30 }}>
        <Text style={{ fontSize: 18, color: "#fff" }}>
          ✅ Paid Bookings: {count}
        </Text>

        <Text style={{ fontSize: 18, color: "#fff", marginTop: 10 }}>
          ✅ Coins Earned: {coins}
        </Text>
      </View>
    </LinearGradient>
  );
}
