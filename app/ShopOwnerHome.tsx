import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { db } from "../firebaseConfig";
import { colors, dashboardStyles, homeStyles, serviceStyles } from "../styles/theme";

type AnyRec = Record<string, any>;

export default function ShopOwnerHome() {
  const [shop, setShop] = useState<AnyRec>({});
  const [gallery, setGallery] = useState<AnyRec>({});

  useEffect(() => {
    const load = async () => {
      const shopId = await AsyncStorage.getItem("shopId");
      if (!shopId) return;

      try {
        // fetch shop details
        const shopRef = doc(db, "salons", shopId);
        const shopSnap = await getDoc(shopRef);
        if (shopSnap.exists()) setShop(shopSnap.data() as AnyRec);

        // fetch gallery details
        const galRef = doc(db, "galleries", shopId);
        const galSnap = await getDoc(galRef);
        if (galSnap.exists()) setGallery(galSnap.data() as AnyRec);
      } catch (e) {
        console.error("Load data error:", e);
      }
    };
    load();
  }, []);

  // ---- helpers ----
  const tsToString = (v: any) => {
    try {
      if (!v) return "-";
      if (v instanceof Timestamp) return v.toDate().toLocaleString();
      if (typeof v?.toDate === "function") return v.toDate().toLocaleString();
      if (typeof v?.seconds === "number") return new Date(v.seconds * 1000).toLocaleString();
      if (typeof v === "number") return new Date(v).toLocaleString();
      return String(v);
    } catch {
      return "-";
    }
  };

  const safe = (v: any) => {
    if (v === null || v === undefined) return "-";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  };
  // -----------------

  return (
    <ScrollView style={homeStyles.container}>
      <Text style={homeStyles.title}>🏠 Shop Dashboard</Text>

      {/* --- Shop Details --- */}
      <View style={homeStyles.infoCard}>
        <Text style={homeStyles.sectionTitle}>Shop Details</Text>
        <Text style={homeStyles.detail}>Shop: {safe(shop.shopName)}</Text>
        <Text style={homeStyles.detail}>Owner: {safe(shop.ownerName)}</Text>
        <Text style={homeStyles.detail}>Email: {safe(shop.email ?? shop.shopEmail)}</Text>
        <Text style={homeStyles.detail}>Phone: {safe(shop.phone ?? shop.shopPhone)}</Text>
        <Text style={homeStyles.detail}>Address: {safe(shop.address)}</Text>
        <Text style={homeStyles.detail}>City: {safe(shop.city)}</Text>
        <Text style={homeStyles.detail}>Pincode: {safe(shop.pincode)}</Text>
        <Text style={homeStyles.detail}>Registered: {tsToString(shop.createdAt)}</Text>
      </View>

      {/* --- Gallery Section --- */}
      {gallery && (
        <View style={homeStyles.infoCard}>
          <Text style={homeStyles.sectionTitle}>Gallery</Text>

          {/* Shop Pic */}
         {gallery.shopPic && (
          <>
            <Text style={homeStyles.detail}>🏪 Shop Picture</Text>
            <Image
              source={{ uri: gallery.shopPic }}
              style={{
                width: "100%",      // full width
                height: 200,        // banner height
                borderRadius: 8,
                marginTop: 8,
                marginBottom: 12,
              }}
              resizeMode="cover"    // scale properly
            />
          </>
        )}

          {/* Shop Gallery */}
          {gallery.gallery?.length > 0 && (
            <>
              <Text style={[homeStyles.detail, { marginTop: 10 }]}>🖼️ Shop Gallery</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
                {gallery.gallery.map((uri: string, idx: number) => (
                  <Image
                    key={idx}
                    source={{ uri }}
                    style={[serviceStyles.previewImage, { margin: 4 }]}
                  />
                ))}
              </View>
            </>
          )}

          {/* Menu Cards */}
          {gallery.menuCards?.length > 0 && (
            <>
              <Text style={[homeStyles.detail, { marginTop: 10 }]}>📋 Menu Cards</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
                {gallery.menuCards.map((uri: string, idx: number) => (
                  <Image
                    key={idx}
                    source={{ uri }}
                    style={[serviceStyles.previewImage, { margin: 4 }]}
                  />
                ))}
              </View>
            </>
          )}

          {/* Address & Location */}
          <Text style={[homeStyles.detail, { marginTop: 10 }]}>
            📍 Address: {safe(gallery.address)}
          </Text>
          {gallery.location && (
            <Text style={homeStyles.detail}>
              🌍 Coordinates: {gallery.location.latitude}, {gallery.location.longitude}
            </Text>
          )}

          {/* Slot Booking Amount */}
          {gallery.slotBookingAmount !== undefined && (
            <Text style={homeStyles.detail}>
              💰 Slot Booking Amount: ₹{gallery.slotBookingAmount}
            </Text>
          )}
        </View>
      )}

      {/* --- Quick Stats --- */}
      <Text style={homeStyles.sectionTitle}>Quick Stats</Text>

      <View style={dashboardStyles.card}>
        <View style={dashboardStyles.iconBox}>
          <Ionicons name="calendar-outline" size={24} color={colors.background} />
        </View>
        <View style={dashboardStyles.textContainer}>
          <Text style={dashboardStyles.cardTitle}>Bookings</Text>
          <Text style={dashboardStyles.cardValue}>120</Text>
        </View>
      </View>

      <View style={dashboardStyles.card}>
        <View style={dashboardStyles.iconBox}>
          <Ionicons name="people-outline" size={24} color={colors.background} />
        </View>
        <View style={dashboardStyles.textContainer}>
          <Text style={dashboardStyles.cardTitle}>Staff Members</Text>
          <Text style={dashboardStyles.cardValue}>8</Text>
        </View>
      </View>

      <View style={dashboardStyles.card}>
        <View style={dashboardStyles.iconBox}>
          <Ionicons name="cash-outline" size={24} color={colors.background} />
        </View>
        <View style={dashboardStyles.textContainer}>
          <Text style={dashboardStyles.cardTitle}>Revenue</Text>
          <Text style={dashboardStyles.cardValue}>₹ 50,000</Text>
        </View>
      </View>

      <View style={dashboardStyles.card}>
        <View style={dashboardStyles.iconBox}>
          <Ionicons name="time-outline" size={24} color={colors.background} />
        </View>
        <View style={dashboardStyles.textContainer}>
          <Text style={dashboardStyles.cardTitle}>Available Slots</Text>
          <Text style={dashboardStyles.cardValue}>25</Text>
        </View>
      </View>
    </ScrollView>
  );
}
