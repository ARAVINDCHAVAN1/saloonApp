// app/barber/BarberDashboard.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Animated,
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import BarberHeader from "./BarberHeader";
import BarberBottomNav from "./BarberBottomNav";
import LeftMenu from "./LeftMenu";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";

/* ---------------- DATE PARSER ---------------- */
function parseDate(value: any): Date | null {
  if (!value) return null;

  if (value?.toDate) return value.toDate();

  if (typeof value === "string") {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

export default function BarberDashboard() {
  /* Drawer */
  const [visible, setVisible] = useState(false);
  const slide = useRef(new Animated.Value(-270)).current;

  const openMenu = () => {
    setVisible(true);
    Animated.timing(slide, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const closeMenu = () => {
    Animated.timing(slide, { toValue: -270, duration: 200, useNativeDriver: false })
      .start(() => setVisible(false));
  };

  /* States */
  const [loading, setLoading] = useState(true);

  const [payments, setPayments] = useState([]);   // 🟢 CHANGED
  const [slots, setSlots] = useState([]);
  const [barberId, setBarberId] = useState("");

  const [revFilter, setRevFilter] = useState<"today" | "month" | "year">("today");
  const [bookFilter, setBookFilter] = useState<"today" | "month" | "year">("today");
  const [slotFilter, setSlotFilter] = useState<"today" | "month" | "year">("today");

  const [revenue, setRevenue] = useState({ today: 0, month: 0, year: 0 });
  const [bookingStats, setBookingStats] = useState({ today: 0, month: 0, year: 0 });
  const [slotStats, setSlotStats] = useState({ today: 0, month: 0, year: 0 });

  /* Load Barber ID */
  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem("barberId");
      if (id) setBarberId(id);
    })();
  }, []);

  /* Fetch Bookings from PAYMENTS TABLE (LIVE) */
  useEffect(() => {
    if (!barberId) return;

    const qy = query(
      collection(db, "payments"),
      where("barberId", "==", barberId),
      where("status", "==", "paid")  // 🟢 ONLY PAID BOOKINGS
    );

    const unsub = onSnapshot(qy, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setPayments(list);
      calculateRevenue(list);
      calculateBookingStats(list);
      setLoading(false);
    });

    return () => unsub();
  }, [barberId]);

  /* Fetch Slots */
  useEffect(() => {
    if (!barberId) return;

    (async () => {
      const qSlots = query(
        collection(db, "slots"),
        where("barberId", "==", barberId)
      );
      const snap = await getDocs(qSlots);
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setSlots(list);
      calculateSlotStats(list);
    })();
  }, [barberId]);

  /* Revenue Calculation from PAYMENTS */
  function calculateRevenue(list: any[]) {
    const now = new Date();
    const CM = now.getMonth();
    const CY = now.getFullYear();

    let today = 0, month = 0, year = 0;

    list.forEach((p) => {
      const d = parseDate(p.createdAt);
      const amt = Number(p.amount ?? 0);
      if (!d) return;

      if (d.toDateString() === now.toDateString()) today += amt;
      if (d.getMonth() === CM && d.getFullYear() === CY) month += amt;
      if (d.getFullYear() === CY) year += amt;
    });

    setRevenue({ today, month, year });
  }

  /* Booking Breakdown from PAYMENTS */
  function calculateBookingStats(list: any[]) {
    const now = new Date();
    const CM = now.getMonth();
    const CY = now.getFullYear();

    let today = 0, month = 0, year = 0;

    list.forEach((p) => {
      const d = parseDate(p.createdAt);
      if (!d) return;

      if (d.toDateString() === now.toDateString()) today++;
      if (d.getMonth() === CM && d.getFullYear() === CY) month++;
      if (d.getFullYear() === CY) year++;
    });

    setBookingStats({ today, month, year });
  }

  /* Slot Breakdown */
  function calculateSlotStats(list: any[]) {
    const now = new Date();
    const CM = now.getMonth();
    const CY = now.getFullYear();

    let today = 0, month = 0, year = 0;

    list.forEach((s) => {
      const d = parseDate(s.date);
      if (!d) return;

      if (d.toDateString() === now.toDateString()) today++;
      if (d.getMonth() === CM && d.getFullYear() === CY) month++;
      if (d.getFullYear() === CY) year++;
    });

    setSlotStats({ today, month, year });
  }

  /* Single Filter Card Component */
  const FilterCard = ({ title, filter, setFilter, value }: any) => (
    <View style={styles.revenueCard}>
      <Text style={styles.revenueTitle}>{title}</Text>

      <Text style={styles.revenueValue}>
        {filter === "today"
          ? value.today
          : filter === "month"
          ? value.month
          : value.year}
      </Text>

      <View style={styles.filterWrapper}>
        {(["today", "month", "year"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === "today"
                ? "Today"
                : f === "month"
                ? "This Month"
                : "This Year"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <BarberHeader openMenu={openMenu} />

      <ScrollView style={styles.container}>

        {/* TOP SUMMARY CARDS */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={styles.topCard}>
            <Text style={styles.topCardTitle}>My Slots</Text>
            <Text style={styles.topCardValue}>{slots.length}</Text>
          </View>

          <View style={styles.topCard}>
            <Text style={styles.topCardTitle}>My Bookings</Text>
            <Text style={styles.topCardValue}>{payments.length}</Text>
          </View>
        </View>

        {/* FILTER CARDS */}
        <FilterCard
          title="My Revenue (₹)"
          filter={revFilter}
          setFilter={setRevFilter}
          value={revenue}
        />

        <FilterCard
          title="My Bookings"
          filter={bookFilter}
          setFilter={setBookFilter}
          value={bookingStats}
        />

        <FilterCard
          title="My Slots"
          filter={slotFilter}
          setFilter={setSlotFilter}
          value={slotStats}
        />

      </ScrollView>

      <BarberBottomNav />
      <LeftMenu visible={visible} slide={slide} closeMenu={closeMenu} />
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  container: { flex: 1, padding: 16, paddingBottom: 90 },

  /* TOP CARDS */
  topCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    margin: 6,
    elevation: 2,
  },
  topCardTitle: { color: "#777", fontSize: 13 },
  topCardValue: { fontSize: 26, fontWeight: "900", color: colors.primary },

  /* FILTER CARDS */
  revenueCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    elevation: 4,
  },
  revenueTitle: { fontSize: 18, fontWeight: "700" },
  revenueValue: { fontSize: 32, fontWeight: "900", color: colors.primary, marginTop: 10 },

  filterWrapper: { flexDirection: "row", marginTop: 12 },
  filterChip: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  filterChipActive: { backgroundColor: colors.primary },
  filterText: { textAlign: "center", fontWeight: "700", color: "#444" },
  filterTextActive: { color: "#fff" },
});
