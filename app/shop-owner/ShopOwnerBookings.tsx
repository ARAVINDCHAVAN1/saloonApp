// app/shop-owner/ShopOwnerBookings.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";

import LeftMenu from "./LeftMenu";
import ShopOwnerBottomNav from "./ShopOwnerBottomNav";
import ShopOwnerHeader from "./ShopOwnerHeader";

export default function ShopOwnerBookings() {
  const [payments, setPayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [selectedBarber, setSelectedBarber] = useState("all");
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");

  // MENU
  const [menuVisible, setMenuVisible] = useState(false);
  const slide = useRef(new Animated.Value(-270)).current;

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slide, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  const closeMenu = () => {
    Animated.timing(slide, {
      toValue: -270,
      duration: 200,
      useNativeDriver: false,
    }).start(() => setMenuVisible(false));
  };

  const formatSlotDate = (d: Date) => {
    const day = d.getDate();
    const month = d.toLocaleString("default", { month: "long" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  /* ---------------- LOAD NORMAL PAYMENTS ONLY ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const sid = await AsyncStorage.getItem("shopId");
        if (!sid) return;

        // BARBERS
        const barberSnap = await getDocs(
          query(collection(db, "barbers"), where("salonId", "==", sid))
        );
        setBarbers(
          barberSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        );

        // PAYMENTS ONLY (NO ADVANCE BOOKINGS)
        const paySnap = await getDocs(
          query(collection(db, "payments"), where("salonId", "==", sid))
        );

        const list = await Promise.all(
          paySnap.docs.map(async (pdoc) => {
            const p = pdoc.data() as any;
            const item: any = { id: pdoc.id, ...p };

            item.status = p.status || "paid";
            item.slotdate = p.date || "";
            item.slotTime = p.slotTime || "—";

            // Barber
            if (p.barberId) {
              const b = await getDoc(doc(db, "barbers", p.barberId));
              item.barberName = b.exists() ? b.data().name : "—";
            } else item.barberName = "General";

            // Customer
            if (p.userId) {
              const u = await getDoc(doc(db, "customers", p.userId));
              if (u.exists()) {
                const c = u.data() as any;
                item.userEmail = c.email || "—";
                item.userPhone = c.phone || "—";
              }
            }

            item._createdAt = p.createdAt?.toDate?.()
              ? p.createdAt.toDate().getTime()
              : Date.now();

            return item;
          })
        );

        list.sort((a, b) => b._createdAt - a._createdAt);

        setPayments(list);
        setFilteredPayments(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const parseSlotDate = (slotdate: string) => {
    const d = new Date(slotdate);
    return isNaN(d.getTime()) ? null : d;
  };

  /* ---------------- APPLY FILTERS ---------------- */
  const applyFilters = () => {
    let list = payments.slice();

    if (selectedBarber !== "all") {
      list = list.filter((p) => p.barberId === selectedBarber);
    }

    if (startDate && endDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);

      list = list.filter((p) => {
        const d = parseSlotDate(p.slotdate);
        if (!d) return false;
        return d >= s && d <= e;
      });
    }

    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }

    setFilteredPayments(list);
  };

  useEffect(() => {
    applyFilters();
  }, [selectedBarber, startDate, endDate, statusFilter]);

  const renderRow = ({ item, index }: any) => (
    <View
      style={[
        styles.row,
        index % 2 === 0 ? styles.rowEven : styles.rowOdd,
      ]}
    >
      <Text style={[styles.cell, styles.col1]}>{item.barberName}</Text>
      <Text style={[styles.cell, styles.col2]}>{item.slotTime}</Text>
      <Text style={[styles.cell, styles.col3]}>{item.slotdate}</Text>
      <Text style={[styles.cell, styles.col4]}>{item.userEmail}</Text>
      <Text style={[styles.cell, styles.col5]}>{item.userPhone}</Text>
      <Text
        style={[
          styles.cell,
          styles.col6,
          {
            color:
              item.status === "paid"
                ? "#4CAF50"
                : "#FF3D00",
          },
        ]}
      >
        {item.status}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ShopOwnerHeader openMenu={openMenu} title="Bookings" />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <>
          {/* FILTERS */}
          <View style={styles.filterRow}>
            <View style={styles.filterBox}>
              <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
              <Picker
                selectedValue={selectedBarber}
                style={styles.picker}
                onValueChange={(v) => setSelectedBarber(v)}
              >
                <Picker.Item value="all" label="All Barbers" />
                {barbers.map((b) => (
                  <Picker.Item value={b.id} label={b.name} key={b.id} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity style={styles.filterBox} onPress={() => setShowStartPicker(true)}>
              <Ionicons name="calendar-outline" size={22} color={colors.primary} />
              <Text style={styles.filterDateText}>
                {startDate ? formatSlotDate(startDate) : "Start Date"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.filterBox} onPress={() => setShowEndPicker(true)}>
              <Ionicons name="calendar-outline" size={22} color={colors.primary} />
              <Text style={styles.filterDateText}>
                {endDate ? formatSlotDate(endDate) : "End Date"}
              </Text>
            </TouchableOpacity>

            <View style={styles.filterBox}>
              <Ionicons name="checkmark-circle-outline" size={22} color={colors.primary} />
              <Picker
                selectedValue={statusFilter}
                style={styles.picker}
                onValueChange={(v) => setStatusFilter(v)}
              >
                <Picker.Item value="all" label="All Status" />
                <Picker.Item value="paid" label="Paid" />
              </Picker>
            </View>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              onChange={(e, d) => {
                setShowStartPicker(false);
                if (d) setStartDate(d);
              }}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              onChange={(e, d) => {
                setShowEndPicker(false);
                if (d) setEndDate(d);
              }}
            />
          )}

          {/* TABLE */}
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <View style={styles.headerRow}>
                <Text style={[styles.headerCell, styles.col1]}>Barber</Text>
                <Text style={[styles.headerCell, styles.col2]}>Slot Time</Text>
                <Text style={[styles.headerCell, styles.col3]}>Date</Text>
                <Text style={[styles.headerCell, styles.col4]}>Email</Text>
                <Text style={[styles.headerCell, styles.col5]}>Phone</Text>
                <Text style={[styles.headerCell, styles.col6]}>Status</Text>
              </View>

              <FlatList
                data={filteredPayments}
                keyExtractor={(i) => i.id}
                renderItem={renderRow}
              />
            </View>
          </ScrollView>
        </>
      )}

      <ShopOwnerBottomNav />
      <LeftMenu visible={menuVisible} slide={slide} closeMenu={closeMenu} />
    </View>
  );
}

// ========================= STYLES =========================
const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "#101010",
  },

  filterBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 10,
    borderRadius: 8,
    height: 44,
    flex: 0.48,
  },

  picker: { flex: 1, color: "#fff", marginLeft: 6 },

  filterDateText: { color: "#fff", marginLeft: 8, fontSize: 14 },

  headerRow: { flexDirection: "row", backgroundColor: colors.primary },

  headerCell: {
    color: "#000",
    fontWeight: "800",
    paddingVertical: 12,
    textAlign: "center",
    fontSize: 14,
  },

  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#222" },

  rowEven: { backgroundColor: "#111" },
  rowOdd: { backgroundColor: "#181818" },

  cell: { color: "#fff", paddingVertical: 12, textAlign: "center", fontSize: 13 },

  col1: { width: 140 },
  col2: { width: 140 },
  col3: { width: 160 },
  col4: { width: 220 },
  col5: { width: 140 },
  col6: { width: 120 },
});
