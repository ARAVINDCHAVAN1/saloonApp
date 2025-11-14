// app/staff/BarberHome.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  DocumentData,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";

interface Booking extends DocumentData {
  id: string;
  date: string;
  slotTime: string;
  amount: number;
  barberId: string;
  status: string;
  paymentStatus: string;
}

const monthMap: any = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parseDate(dateStr: string): Date | null {
  try {
    const parts = dateStr.split(" ");
    return new Date(Number(parts[3]), monthMap[parts[1]], Number(parts[2]));
  } catch {
    return null;
  }
}

export default function BarberHome() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [barberId, setBarberId] = useState("");

  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem("barberId");
      if (id) setBarberId(id);
    })();
  }, []);

  useEffect(() => {
    if (!barberId) return;

    const qy = query(
      collection(db, "userBookings"),
      where("barberId", "==", barberId)
    );

    const unsub = onSnapshot(qy, (snap) => {
      setBookings(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      setLoading(false);
    });

    return () => unsub();
  }, [barberId]);

  const paid = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.status?.toLowerCase() === "paid" ||
          b.paymentStatus?.toLowerCase() === "success"
      ),
    [bookings]
  );

  const now = new Date();
  const CM = now.getMonth();
  const CY = now.getFullYear();

  const sixMonthAgo = new Date(now);
  sixMonthAgo.setMonth(CM - 6);

  const stats = useMemo(() => {
    const s = {
      thisMonth: { count: 0, amount: 0 },
      lastMonth: { count: 0, amount: 0 },
      sixMonths: { count: 0, amount: 0 },
      thisYear: { count: 0, amount: 0 },
    };

    paid.forEach((b) => {
      const d = parseDate(b.date);
      if (!d) return;

      const amt = b.amount || 0;

      if (d.getMonth() === CM && d.getFullYear() === CY) {
        s.thisMonth.count++;
        s.thisMonth.amount += amt;
      }

      if (d.getMonth() === CM - 1 && d.getFullYear() === CY) {
        s.lastMonth.count++;
        s.lastMonth.amount += amt;
      }

      if (d >= sixMonthAgo) {
        s.sixMonths.count++;
        s.sixMonths.amount += amt;
      }

      if (d.getFullYear() === CY) {
        s.thisYear.count++;
        s.thisYear.amount += amt;
      }
    });

    return s;
  }, [paid]);

  if (loading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const StatBox = ({ icon, label, count, amount }) => (
    <View
      style={{
        backgroundColor: "#f9f9f9",
        padding: 20,
        borderRadius: 14,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#eaeaea",
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
        <Ionicons name={icon} size={22} color={colors.primary} />
        <Text
          style={{
            marginLeft: 10,
            fontSize: 16,
            color: "#333",
            fontWeight: "600",
          }}
        >
          {label}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 28,
          fontWeight: "700",
          color: "#111",
          marginBottom: 5,
        }}
      >
        {count} slots
      </Text>

      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: colors.primary,
        }}
      >
        ₹{amount}
      </Text>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ padding: 20 }}>
     

        <StatBox
          icon="calendar-outline"
          label="This Month"
          count={stats.thisMonth.count}
          amount={stats.thisMonth.amount}
        />

        <StatBox
          icon="calendar"
          label="Last Month"
          count={stats.lastMonth.count}
          amount={stats.lastMonth.amount}
        />

        <StatBox
          icon="time-outline"
          label="Past 6 Months"
          count={stats.sixMonths.count}
          amount={stats.sixMonths.amount}
        />

        <StatBox
          icon="bar-chart-outline"
          label="This Year"
          count={stats.thisYear.count}
          amount={stats.thisYear.amount}
        />
      </View>
    </ScrollView>
  );
}
