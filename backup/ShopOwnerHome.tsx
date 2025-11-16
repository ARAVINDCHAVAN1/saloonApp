import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { db } from "../firebaseConfig";
import { colors, dashboardStyles, homeStyles } from "../styles/theme";

type AnyRec = Record<string, any>;

export default function ShopOwnerHome() {
  const [shop, setShop] = useState<AnyRec>({});
  const [gallery, setGallery] = useState<AnyRec>({});
  const [stats, setStats] = useState({
    bookings: 0,
    staff: 0,
    revenue: 0,
    slots: 0,
  });

  // ------------------- Load Shop + Gallery -------------------
  useEffect(() => {
    let unsubShop: any;
    let unsubGallery: any;

    const loadData = async () => {
      const shopId = await AsyncStorage.getItem("shopId");
      if (!shopId) return;

      try {
        // ✅ Real-time listener for shop details
        const shopRef = doc(db, "salons", shopId);
        unsubShop = onSnapshot(shopRef, (snap) => {
          if (snap.exists()) setShop(snap.data());
        });

        // ✅ Real-time listener for gallery
        const galRef = doc(db, "galleries", shopId);
        unsubGallery = onSnapshot(galRef, (snap) => {
          if (snap.exists()) setGallery(snap.data());
        });

        // Load stats once initially
        await loadStats(shopId);
      } catch (e) {
        console.error("Error loading data:", e);
      }
    };

    loadData();

    // ✅ Cleanup listeners on unmount
    return () => {
      if (unsubShop) unsubShop();
      if (unsubGallery) unsubGallery();
    };
  }, []);

  // ------------------- Load Dynamic Stats -------------------
  const loadStats = async (shopId: string) => {
    try {
      // 🔹 1. Count Bookings
      const bookingsSnap = await getDocs(
        query(collection(db, "bookings"), where("salonId", "==", shopId))
      );
      const totalBookings = bookingsSnap.size;

      // 🔹 2. Count Staff Members
      const staffSnap = await getDocs(
        query(collection(db, "barbers"), where("salonId", "==", shopId))
      );
      const totalStaff = staffSnap.size;

      // 🔹 3. Revenue (sum of booking amounts)
      let totalRevenue = 0;
      bookingsSnap.forEach((doc) => {
        const data = doc.data();
        if (data.status === "completed" && data.amount) {
          totalRevenue += Number(data.amount);
        }
      });

      // 🔹 4. Available Slots
      const slotsSnap = await getDocs(
        query(collection(db, "slots"), where("salonId", "==", shopId))
      );
      const availableSlots = slotsSnap.docs.filter(
        (d) => d.data().status === "available"
      ).length;

      setStats({
        bookings: totalBookings,
        staff: totalStaff,
        revenue: totalRevenue,
        slots: availableSlots,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  // ------------------- Helpers -------------------
  const safe = (v: any) => {
    if (v === null || v === undefined) return "-";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  };

  return (
    <ScrollView style={homeStyles.container}>
      <Text style={homeStyles.title}>🏠 Shop Dashboard</Text>

      {/* --- Shop Details --- */}
      <View style={homeStyles.infoCard}>
        <Text style={homeStyles.sectionTitle}>Shop Details</Text>
        <Text style={homeStyles.detail}>Shop: {safe(shop.shopName)}</Text>
        <Text style={homeStyles.detail}>Owner: {safe(shop.ownerName)}</Text>
        <Text style={homeStyles.detail}>
          Email: {safe(shop.email ?? shop.shopEmail)}
        </Text>
        <Text style={homeStyles.detail}>
          Phone: {safe(shop.phone ?? shop.shopPhone)}
        </Text>
        <Text style={homeStyles.detail}>Address: {safe(shop.address)}</Text>
        <Text style={homeStyles.detail}>City: {safe(shop.city)}</Text>
        <Text style={homeStyles.detail}>Pincode: {safe(shop.pincode)}</Text>
      </View>

      {/* --- Gallery --- */}
      {gallery && (
        <View style={homeStyles.infoCard}>
          <Text style={homeStyles.sectionTitle}>Gallery</Text>
          {gallery.shopPic && (
            <>
              <Text style={homeStyles.detail}>🏪 Shop Picture</Text>
              <Image
                source={{ uri: gallery.shopPic }}
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 8,
                  marginTop: 8,
                }}
                resizeMode="cover"
              />
            </>
          )}
        </View>
      )}

      {/* --- Dynamic Quick Stats --- */}
      <Text style={homeStyles.sectionTitle}>Quick Stats</Text>

      {/* Bookings */}
      <View style={dashboardStyles.card}>
        <View style={dashboardStyles.iconBox}>
          <Ionicons name="calendar-outline" size={24} color={colors.background} />
        </View>
        <View style={dashboardStyles.textContainer}>
          <Text style={dashboardStyles.cardTitle}>Bookings</Text>
          <Text style={dashboardStyles.cardValue}>{stats.bookings}</Text>
        </View>
      </View>

      {/* Staff Members */}
      <View style={dashboardStyles.card}>
        <View style={dashboardStyles.iconBox}>
          <Ionicons name="people-outline" size={24} color={colors.background} />
        </View>
        <View style={dashboardStyles.textContainer}>
          <Text style={dashboardStyles.cardTitle}>Staff Members</Text>
          <Text style={dashboardStyles.cardValue}>{stats.staff}</Text>
        </View>
      </View>

      {/* Revenue */}
      <View style={dashboardStyles.card}>
        <View style={dashboardStyles.iconBox}>
          <Ionicons name="cash-outline" size={24} color={colors.background} />
        </View>
        <View style={dashboardStyles.textContainer}>
          <Text style={dashboardStyles.cardTitle}>Revenue</Text>
          <Text style={dashboardStyles.cardValue}>
            ₹ {stats.revenue.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Available Slots */}
      <View style={dashboardStyles.card}>
        <View style={dashboardStyles.iconBox}>
          <Ionicons name="time-outline" size={24} color={colors.background} />
        </View>
        <View style={dashboardStyles.textContainer}>
          <Text style={dashboardStyles.cardTitle}>Available Slots</Text>
          <Text style={dashboardStyles.cardValue}>{stats.slots}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
