// app/shop-owner/ShopOwnerDashboard.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../src/firebase/firebaseConfig";

import { colors } from "../../styles/theme";
import LeftMenu from "./LeftMenu";
import ShopOwnerBottomNav from "./ShopOwnerBottomNav";
import ShopOwnerHeader from "./ShopOwnerHeader";

type BarberSummary = {
  barberId: string;
  barberName: string;
  bookings: number;
  revenue: number;
  slotsToday: number;
  slotsBooked: number;
  slotsAvailable: number;
};

export default function ShopOwnerDashboard() {
  const [visible, setVisible] = useState(false);
  const slide = useRef(new Animated.Value(-270)).current;

  const openMenu = () => {
    setVisible(true);
    Animated.timing(slide, {
      toValue: 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slide, {
      toValue: -270,
      duration: 220,
      useNativeDriver: false,
    }).start(() => setVisible(false));
  };

  const [loading, setLoading] = useState(true);
  const [salonId, setSalonId] = useState<string | null>(null);

  const [counts, setCounts] = useState({ barbers: 0, bookings: 0 });

  const [revenue, setRevenue] = useState({ today: 0, month: 0, year: 0 });
  const [filter, setFilter] = useState<"today" | "month" | "year">("today");

  const [slotSummary, setSlotSummary] = useState({
    total: 0,
    booked: 0,
    available: 0,
  });

  const [barberSummaries, setBarberSummaries] = useState<BarberSummary[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  /* -------------------------- ANIMATION STATE -------------------------- */
  const animatedScale = {
    today: useRef(new Animated.Value(1)).current,
    month: useRef(new Animated.Value(1)).current,
    year: useRef(new Animated.Value(1)).current,
  };

  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem("shopId");
      if (!id) return setLoading(false);
      setSalonId(id);
    })();
  }, []);

  useEffect(() => {
    if (!salonId) return;
    setLoading(true);
    loadAll().finally(() => setLoading(false));
  }, [salonId]);

  useEffect(() => {
    if (!salonId) return;
    calculateRevenue();
  }, [filter]);

  async function loadAll() {
    await Promise.all([
      loadCounts(),
      calculateRevenue(),
      loadSlotSummary(),
      loadBarberSummaries(),
    ]);
  }

  async function loadCounts() {
    const barberSnap = await getDocs(
      query(collection(db, "barbers"), where("salonId", "==", salonId))
    );

    const bookingSnap = await getDocs(
      query(collection(db, "payments"), where("salonId", "==", salonId))
    );

    setCounts({
      barbers: barberSnap.size,
      bookings: bookingSnap.size,
    });
  }

  function parseTimestamp(v: any): Date | null {
    if (!v) return null;
    if (v?.toDate) return v.toDate();
    return new Date(v);
  }

  async function calculateRevenue() {
    const snap = await getDocs(
      query(collection(db, "payments"), where("salonId", "==", salonId))
    );

    const now = new Date();
    let today = 0,
      month = 0,
      year = 0;

    snap.forEach((d) => {
      const data: any = d.data();
      const amount = Number(data.amount || 0);
      const dt = parseTimestamp(data.createdAt);
      if (!dt) return;

      if (
        dt.getDate() === now.getDate() &&
        dt.getMonth() === now.getMonth() &&
        dt.getFullYear() === now.getFullYear()
      )
        today += amount;

      if (dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear())
        month += amount;

      if (dt.getFullYear() === now.getFullYear()) year += amount;
    });

    setRevenue({ today, month, year });
  }

  async function loadSlotSummary() {
    const today = new Date().toDateString();

    const snap = await getDocs(
      query(
        collection(db, "slots"),
        where("salonId", "==", salonId),
        where("date", "==", today)
      )
    );

    if (snap.empty) {
      setSlotSummary({ total: 0, booked: 0, available: 0 });
      return;
    }

    let total = 0,
      booked = 0,
      available = 0;

    snap.forEach((d) => {
      total++;
      const data: any = d.data();
      if (data.status === "booked") booked++;
      else available++;
    });

    setSlotSummary({ total, booked, available });
  }

  async function loadBarberSummaries() {
    try {
      const barberSnap = await getDocs(
        query(collection(db, "barbers"), where("salonId", "==", salonId))
      );

      const barbers: { id: string; name: string }[] = [];
      barberSnap.forEach((d) => {
        const dat: any = d.data();
        barbers.push({ id: d.id, name: dat.name || "Barber" });
      });

      const validIDs = new Set(barbers.map((b) => b.id));

      const paymentSnap = await getDocs(
        query(collection(db, "payments"), where("salonId", "==", salonId))
      );

      const payMap: Record<string, { count: number; revenue: number }> = {};

      paymentSnap.forEach((d) => {
        const data: any = d.data();
        const bId = data.barberId;
        if (!bId || !validIDs.has(bId)) return;

        if (!payMap[bId]) payMap[bId] = { count: 0, revenue: 0 };
        payMap[bId].count++;
        payMap[bId].revenue += Number(data.amount || 0);
      });

      const today = new Date().toDateString();
      const slotSnap = await getDocs(
        query(
          collection(db, "slots"),
          where("salonId", "==", salonId),
          where("date", "==", today)
        )
      );

      const slotMap: any = {};

      slotSnap.forEach((s) => {
        const slot: any = s.data();
        const bId = slot.barberId || "unassigned";

        if (!slotMap[bId]) slotMap[bId] = { total: 0, booked: 0, available: 0 };

        slotMap[bId].total++;
        if (slot.status === "booked") slotMap[bId].booked++;
        else slotMap[bId].available++;
      });

      const summary: BarberSummary[] = barbers.map((b) => ({
        barberId: b.id,
        barberName: b.name,
        bookings: payMap[b.id]?.count || 0,
        revenue: payMap[b.id]?.revenue || 0,
        slotsToday: slotMap[b.id]?.total || 0,
        slotsBooked: slotMap[b.id]?.booked || 0,
        slotsAvailable: slotMap[b.id]?.available || 0,
      }));

      setBarberSummaries(summary);
    } catch (err) {
      console.warn("Barber Summary Error:", err);
    }
  }

  const totalSlots = slotSummary.total || 0;
  const bookedPercent =
    totalSlots === 0 ? 0 : Math.round((slotSummary.booked / totalSlots) * 100);
  const notBookedPercent =
    totalSlots === 0 ? 0 : Math.round((slotSummary.available / totalSlots) * 100);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f5f9" }}>
      <ShopOwnerHeader openMenu={openMenu} />

      <ScrollView style={styles.container}>
        {/* TOP METRICS */}
        <View style={styles.topRow}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Total Barbers</Text>
            <Text style={styles.statValue}>{counts.barbers}</Text>
            <Text style={styles.statSubtitle}>Active in this salon</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Total Bookings</Text>
            <Text style={styles.statValue}>{counts.bookings}</Text>
            <Text style={styles.statSubtitle}>All time completed</Text>
          </View>
        </View>

        {/* ------------------ REVENUE ANALYTICS ------------------ */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeaderRow}>
            <Text style={styles.revenueTitle}>Revenue Analytics</Text>
          </View>
          {/* FILTER CHIPS BELOW */}

            <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 14,
            }}
          >
            {(["today", "month", "year"] as const).map((f) => {
              const label =
                f === "today"
                  ? "Today"
                  : f === "month"
                  ? "This Month"
                  : "This Year";

              return (
                <Animated.View
                  key={f}
                  style={{
                    transform: [{ scale: animatedScale[f] }],
                    marginHorizontal: 4,
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filter === f && styles.filterChipActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      Animated.sequence([
                        Animated.timing(animatedScale[f], {
                          toValue: 0.85,
                          duration: 80,
                          useNativeDriver: true,
                        }),
                        Animated.timing(animatedScale[f], {
                          toValue: 1,
                          duration: 120,
                          useNativeDriver: true,
                        }),
                      ]).start();

                      setFilter(f);
                    }}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        filter === f && styles.filterTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>


          <Text style={styles.revenueValue}>
            {filter === "today"
              ? `₹${revenue.today}`
              : filter === "month"
              ? `₹${revenue.month}`
              : `₹${revenue.year}`}
          </Text>

        

          <Text style={styles.revenueHint}>
            Showing{" "}
            {filter === "today"
              ? "today's"
              : filter === "month"
              ? "this month's"
              : "this year's"}{" "}
            collected revenue
          </Text>
        </View>

        {/* ------------------ SLOT SUMMARY ------------------ */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Today's Slot Summary</Text>

          {totalSlots === 0 ? (
            <View style={styles.emptyStateBox}>
              <Text style={styles.emptyStateText}>No slots created for today.</Text>
            </View>
          ) : (
            <>
              <View style={styles.summaryRow}>
                <View style={styles.summaryPill}>
                  <Text style={styles.summaryPillLabel}>Total Slots</Text>
                  <Text style={styles.summaryPillValue}>{totalSlots}</Text>
                </View>
                <View style={styles.summaryPill}>
                  <Text style={[styles.summaryPillLabel, { color: "#d9534f" }]}>
                    Booked
                  </Text>
                  <Text style={styles.summaryPillValue}>{slotSummary.booked}</Text>
                </View>
                <View style={styles.summaryPill}>
                  <Text style={[styles.summaryPillLabel, { color: "#28a745" }]}>
                    Not Booked
                  </Text>
                  <Text style={styles.summaryPillValue}>{slotSummary.available}</Text>
                </View>
              </View>

              <View style={styles.barLegendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#d9534f" }]} />
                  <Text style={styles.legendText}>Booked ({bookedPercent}%)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#28a745" }]} />
                  <Text style={styles.legendText}>
                    Not Booked ({notBookedPercent}%)
                  </Text>
                </View>
              </View>

              <View style={styles.barBackground}>
                <View
                  style={[styles.barFillBooked, { width: `${bookedPercent}%` }]}
                />
                <View
                  style={[styles.barFillNotBooked, { width: `${notBookedPercent}%` }]}
                />
              </View>
            </>
          )}
        </View>

        {/* ------------------ BARBER SUMMARY ------------------ */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Barber Booking Summary</Text>

          {barberSummaries.length === 0 ? (
            <View style={styles.emptyStateBox}>
              <Text style={styles.emptyStateText}>
                No barbers found for this salon.
              </Text>
            </View>
          ) : (
            barberSummaries.map((b) => {
              const isOpen = expanded[b.barberId];
              const totalSlotsForBarber = b.slotsToday || 0;
              const bookedPct =
                totalSlotsForBarber === 0
                  ? 0
                  : Math.round((b.slotsBooked / totalSlotsForBarber) * 100);

              return (
                <View key={b.barberId} style={styles.barberCard}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => toggleExpand(b.barberId)}
                    style={styles.barberHeaderRow}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.barberName}>{b.barberName}</Text>
                      <Text style={styles.barberSubText}>
                        {b.bookings} bookings • ₹{b.revenue} earned
                      </Text>
                    </View>

                    <View style={styles.barberHeaderRight}>
                      <Text style={styles.barberPctText}>{bookedPct}% filled</Text>
                      <Text style={styles.barberArrow}>{isOpen ? "▲" : "▼"}</Text>
                    </View>
                  </TouchableOpacity>

                  {isOpen && (
                    <View style={styles.barberBody}>
                      <View style={styles.breakdownContainer}>
                        <Text style={styles.breakdownTitle}>Today's Breakdown</Text>

                        <View style={styles.breakdownBox}>
                          <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Total Slots</Text>
                            <Text style={styles.breakdownValue}>
                              {b.slotsToday}
                            </Text>
                          </View>

                          <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Booked</Text>
                            <Text style={styles.breakdownValue}>
                              {b.slotsBooked}
                            </Text>
                          </View>

                          <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Not Booked</Text>
                            <Text style={styles.breakdownValue}>
                              {b.slotsAvailable}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      <ShopOwnerBottomNav />
      <LeftMenu visible={visible} slide={slide} closeMenu={closeMenu} />
    </View>
  );
}

/* -------------------------- STYLES -------------------------- */

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  container: { flex: 1, padding: 16, paddingBottom: 260 },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 14,
    marginHorizontal: 4,
    elevation: 2,
  },
  statTitle: { color: "#6b7280", fontSize: 13, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: "800", color: colors.primary },
  statSubtitle: { fontSize: 11, color: "#9ca3af", marginTop: 4 },

  revenueCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    marginBottom: 16,
  },
  revenueHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  revenueTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  revenueValue: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.primary,
    marginTop: 10,
  },
  revenueHint: { marginTop: 4, fontSize: 12, color: "#9ca3af" },

  filterWrapper: { flexDirection: "row" },
  filterChip: {
    marginLeft: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  filterChipActive: { backgroundColor: colors.primary },
  filterText: { fontSize: 11, fontWeight: "700", color: "#374151" },
  filterTextActive: { color: "#ffffff" },

  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },

  emptyStateBox: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9ca3af",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 10,
  },
  summaryPill: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  summaryPillLabel: { fontSize: 11, color: "#6b7280" },
  summaryPillValue: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
    color: "#111827",
  },

  barLegendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 4,
  },
  legendItem: { flexDirection: "row", alignItems: "center" },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 6,
  },
  legendText: { fontSize: 11, color: "#6b7280" },

  barBackground: {
    flexDirection: "row",
    width: "100%",
    height: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
  },
  barFillBooked: { height: "100%", backgroundColor: "#d9534f" },
  barFillNotBooked: { height: "100%", backgroundColor: "#28a745" },

  barberCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    elevation: 2,
  },

  barberHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },

  barberName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0e0d0dff",
  },
  barberSubText: {
    fontSize: 12,
    color: "#131314ff",
  },

  barberHeaderRight: { alignItems: "flex-end" },
  barberPctText: { fontSize: 12, fontWeight: "600", color: "#151515ff" },
  barberArrow: { fontSize: 12, color: "#0e0f0fff" },

  barberBody: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 6,
  },

  breakdownContainer: { marginTop: 6 },
  breakdownTitle: { fontSize: 13, color: "#111827", marginBottom: 4 },

  breakdownBox: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
  },

  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  breakdownLabel: { fontSize: 12, color: "#4b5563" },
  breakdownValue: { fontSize: 12, color: "#4b5563" },
});
