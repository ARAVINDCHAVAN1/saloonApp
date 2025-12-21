// app/shop-owner/ShopOwnerSpotBookingList.tsx

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

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";
import ShopOwnerBottomNav from "./ShopOwnerBottomNav";
import ShopOwnerHeader from "./ShopOwnerHeader";

export default function ShopOwnerSpotBookingList() {
  const [data, setData] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBarber, setSelectedBarber] = useState("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    loadSpotPayments();
  }, []);

  const loadSpotPayments = async () => {
    try {
      const sid = await AsyncStorage.getItem("shopId");
      if (!sid) return;

      // Load all barbers
      const barberSnap = await getDocs(
        query(collection(db, "barbers"), where("salonId", "==", sid))
      );
      setBarbers(barberSnap.docs.map((b) => ({ id: b.id, ...b.data() })));

      // Load spot payments
      const snap = await getDocs(
        query(collection(db, "spotpayment"), where("salonId", "==", sid))
      );

      const list = await Promise.all(
        snap.docs.map(async (d) => {
          const a = d.data() as any;
          const row: any = { id: d.id, ...a };

          row.slotdate = a.date;
          row.slotTime = `${a.fromTime} - ${a.toTime}`;
          row.status = a.status || "paid";

          // barber name
          if (a.barberId) {
            const b = await getDoc(doc(db, "barbers", a.barberId));
            row.barberName = b.exists() ? b.data().name : "General";
          } else {
            row.barberName = "General";
          }

          return row;
        })
      );

      setData(list);
      setFiltered(list);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let list = [...data];

    if (selectedBarber !== "all")
      list = list.filter((p) => p.barberId === selectedBarber);

    if (startDate && endDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);

      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);

      list = list.filter((p) => {
        const d = new Date(p.slotdate);
        return d >= s && d <= e;
      });
    }

    setFiltered(list);
  };

  useEffect(() => {
    applyFilters();
  }, [selectedBarber, startDate, endDate]);

  const renderRow = ({ item, index }: any) => (
    <View style={[styles.row, index % 2 ? styles.rowOdd : styles.rowEven]}>
      <Text style={[styles.cell, styles.col1]}>{item.barberName}</Text>
      <Text style={[styles.cell, styles.col2]}>{item.slotTime}</Text>
      <Text style={[styles.cell, styles.col3]}>{item.slotdate}</Text>
      <Text style={[styles.cell, styles.col5, { color: "#4CAF50" }]}>Paid</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ShopOwnerHeader title="Spot Bookings" />

      {/* ---------------- FILTERS ---------------- */}
      <View style={styles.filterRow}>
        <View style={styles.filterBox}>
          <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
          <Picker
            selectedValue={selectedBarber}
            style={styles.picker}
            onValueChange={setSelectedBarber}
          >
            <Picker.Item value="all" label="All Barbers" />
            {barbers.map((b) => (
              <Picker.Item key={b.id} label={b.name} value={b.id} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          style={styles.filterBox}
          onPress={() => setShowStartPicker(true)}
        >
          <Ionicons name="calendar-outline" size={22} color={colors.primary} />
          <Text style={styles.filterText}>
            {startDate ? startDate.toDateString() : "Start Date"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterBox}
          onPress={() => setShowEndPicker(true)}
        >
          <Ionicons name="calendar-outline" size={22} color={colors.primary} />
          <Text style={styles.filterText}>
            {endDate ? endDate.toDateString() : "End Date"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ▶ TOTAL COUNT BELOW END DATE */}
      <Text
        style={{
          color: "#fff",
          fontSize: 16,
          fontWeight: "700",
          marginLeft: 14,
          marginTop: 6,
        }}
      >
        Total Bookings: {filtered.length}
      </Text>

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

      {/* ---------------- TABLE ---------------- */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView horizontal>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.col1]}>Barber</Text>
              <Text style={[styles.headerCell, styles.col2]}>Time</Text>
              <Text style={[styles.headerCell, styles.col3]}>Date</Text>
              {/* Amount column removed */}
              <Text style={[styles.headerCell, styles.col5]}>Status</Text>
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(i) => i.id}
              renderItem={renderRow}
            />
          </View>
        </ScrollView>
      )}

      <ShopOwnerBottomNav />
    </View>
  );
}

/* ---------------- STYLES ---------------- */
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
  filterText: { color: "#fff", marginLeft: 8, fontSize: 14 },

  headerRow: { flexDirection: "row", backgroundColor: colors.primary },
  headerCell: {
    color: "#000",
    fontWeight: "800",
    paddingVertical: 12,
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#222",
    alignItems: "center",
    minHeight: 56,
  },
  rowOdd: { backgroundColor: "#181818" },
  rowEven: { backgroundColor: "#111" },

  cell: { color: "#fff", paddingVertical: 12, textAlign: "center", fontSize: 13 },

  col1: { width: 160 },
  col2: { width: 160 },
  col3: { width: 160 },
  col5: { width: 120 }, // Status only
});
