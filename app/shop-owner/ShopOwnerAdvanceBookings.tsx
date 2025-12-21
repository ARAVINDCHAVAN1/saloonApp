// app/shop-owner/ShopOwnerAdvanceBookings.tsx

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
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";

import ShopOwnerBottomNav from "./ShopOwnerBottomNav";
import ShopOwnerHeader from "./ShopOwnerHeader";

export default function ShopOwnerAdvanceBookings() {
  const [data, setData] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBarber, setSelectedBarber] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    loadAdvance();
  }, []);

  /* ------------------ LOAD DATA ------------------ */
  const loadAdvance = async () => {
    try {
      const sid = await AsyncStorage.getItem("shopId");
      if (!sid) return;

      const barberSnap = await getDocs(
        query(collection(db, "barbers"), where("salonId", "==", sid))
      );
      setBarbers(barberSnap.docs.map((b) => ({ id: b.id, ...b.data() })));

      const snap = await getDocs(
        query(collection(db, "advanceBookings"), where("salonId", "==", sid))
      );

      const list = await Promise.all(
        snap.docs.map(async (d) => {
          const a = d.data() as any;
          const row: any = { id: d.id, ...a };

          row.slotdate = a.date;
          row.slotTime = `${a.fromTime} - ${a.toTime}`;
          row.status = a.status || "pending";

          if (a.barberId) {
            const b = await getDoc(doc(db, "barbers", a.barberId));
            row.barberName = b.exists() ? b.data().name : "General";
          } else row.barberName = "General";

          if (a.userId) {
            const u = await getDoc(doc(db, "customers", a.userId));
            if (u.exists()) {
              const c = u.data() as any;
              row.userEmail = c.email || "—";
              row.userPhone = c.phone || "—";
            }
          }

          if (checkExpired(row)) row.status = "expired";

          return row;
        })
      );

      setData(list);
      setFiltered(list);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ EXPIRE CHECK ------------------ */
  const checkExpired = (item: any) => {
    try {
      const today = new Date();
      const bookingDate = new Date(item.slotdate);
      if (bookingDate < new Date(today.toDateString())) return true;

      const [_, to] = item.slotTime.split("-");
      const endTime = parseTime(bookingDate, to.trim());

      if (bookingDate.toDateString() === today.toDateString() && new Date() > endTime)
        return true;

      return false;
    } catch {
      return false;
    }
  };

  const parseTime = (date: Date, time: string) => {
    const [t, mer] = time.split(" ");
    const [hh, mm] = t.split(":").map(Number);
    let h = hh;

    if (mer?.toUpperCase() === "PM" && hh !== 12) h += 12;
    if (mer?.toUpperCase() === "AM" && hh === 12) h = 0;

    const d = new Date(date);
    d.setHours(h, mm, 0, 0);
    return d;
  };

  /* ------------------ APPROVE ------------------ */
  const approve = async (item: any) => {
    await updateDoc(doc(db, "advanceBookings", item.id), {
      status: "approved",
      approvedAt: new Date(),
    });
    loadAdvance();
  };

  /* ------------------ CANCEL ------------------ */
  const openCancel = (item: any) => {
    setSelectedBooking(item);
    setCancelReason("");
    setCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      Alert.alert("Reason required", "Please enter cancellation reason.");
      return;
    }

    await updateDoc(doc(db, "advanceBookings", selectedBooking.id), {
      status: "cancelled",
      cancelledAt: new Date(),
      cancelReason,
    });

    setCancelModal(false);
    loadAdvance();
  };

  /* ------------------ FILTER ------------------ */
  const applyFilters = () => {
    let list = data.slice();

    if (selectedBarber !== "all") list = list.filter((p) => p.barberId === selectedBarber);
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);

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
  }, [selectedBarber, statusFilter, startDate, endDate]);

  /* ------------------ ROW UI ------------------ */
  const renderRow = ({ item, index }: any) => (
    <View style={[styles.row, index % 2 ? styles.rowOdd : styles.rowEven]}>
      <Text style={[styles.cell, styles.col1]}>{item.barberName}</Text>
      <Text style={[styles.cell, styles.col2]}>{item.slotTime}</Text>
      <Text style={[styles.cell, styles.col3]}>{item.slotdate}</Text>
      <Text style={[styles.cell, styles.col4]}>{item.userEmail}</Text>
      <Text style={[styles.cell, styles.col5]}>{item.userPhone}</Text>

      <Text style={[
        styles.cell,
        styles.col6,
        { color: item.status === "approved" ? "#4CAF50" :
                 item.status === "pending" ? "#FFC107" :
                 item.status === "expired" ? "#FF5722" : "#FF3D00" }
      ]}>
        {item.status}
      </Text>

      {item.status === "pending" ? (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity onPress={() => approve(item)} style={styles.approveBtn}>
            <Text style={{ color: "#000", fontWeight: "700" }}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openCancel(item)} style={styles.cancelBtn}>
            <Text style={{ color: "#000", fontWeight: "700" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={[styles.cell, styles.col7]}>
          {item.status === "cancelled" ? "Cancelled" : "—"}
        </Text>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ShopOwnerHeader title="Advance Bookings" />

      {/* FILTERS */}
      <View style={styles.filterRow}>
        <View style={styles.filterBox}>
          <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
          <Picker selectedValue={selectedBarber} style={styles.picker} onValueChange={setSelectedBarber}>
            <Picker.Item value="all" label="All Barbers" />
            {barbers.map((b) => (
              <Picker.Item key={b.id} label={b.name} value={b.id} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.filterBox} onPress={() => setShowStartPicker(true)}>
          <Ionicons name="calendar-outline" size={22} color={colors.primary} />
          <Text style={styles.filterText}>{startDate ? startDate.toDateString() : "Start Date"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterBox} onPress={() => setShowEndPicker(true)}>
          <Ionicons name="calendar-outline" size={22} color={colors.primary} />
          <Text style={styles.filterText}>{endDate ? endDate.toDateString() : "End Date"}</Text>
        </TouchableOpacity>

        <View style={styles.filterBox}>
          <Ionicons name="checkmark-circle-outline" size={22} color={colors.primary} />
          <Picker selectedValue={statusFilter} style={styles.picker} onValueChange={setStatusFilter}>
            <Picker.Item value="all" label="All" />
            <Picker.Item value="pending" label="Pending" />
            <Picker.Item value="approved" label="Approved" />
            <Picker.Item value="expired" label="Expired" />
            <Picker.Item value="cancelled" label="Cancelled" />
          </Picker>
        </View>
      </View>

      {showStartPicker && (
        <DateTimePicker value={startDate || new Date()} mode="date"
          onChange={(e, d) => { setShowStartPicker(false); if (d) setStartDate(d); }} />
      )}

      {showEndPicker && (
        <DateTimePicker value={endDate || new Date()} mode="date"
          onChange={(e, d) => { setShowEndPicker(false); if (d) setEndDate(d); }} />
      )}

      {/* TABLE */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView horizontal>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.col1]}>Barber</Text>
              <Text style={[styles.headerCell, styles.col2]}>Time</Text>
              <Text style={[styles.headerCell, styles.col3]}>Date</Text>
              <Text style={[styles.headerCell, styles.col4]}>Email</Text>
              <Text style={[styles.headerCell, styles.col5]}>Phone</Text>
              <Text style={[styles.headerCell, styles.col6]}>Status</Text>
              <Text style={[styles.headerCell, styles.col7]}>Action</Text>
            </View>
            <FlatList data={filtered} keyExtractor={(i) => i.id} renderItem={renderRow} />
          </View>
        </ScrollView>
      )}

      <ShopOwnerBottomNav />

      {/* CANCEL MODAL */}
      <Modal visible={cancelModal} transparent animationType="fade" onRequestClose={() => null}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center" }}>
          <View style={{ margin: 20, backgroundColor: "#fff", padding: 20, borderRadius: 10 }}>

            {/* TOP RIGHT CLOSE ICON */}
            <TouchableOpacity
              onPress={() => setCancelModal(false)}
              style={{ position: "absolute", right: 10, top: 10 }}
            >
              <Ionicons name="close-circle" size={26} color="#ff4d00" />
            </TouchableOpacity>

            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
              Cancel Booking
            </Text>

            <TextInput
              placeholder="Enter cancellation reason"
              placeholderTextColor="#999"
              value={cancelReason}
              onChangeText={setCancelReason}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 12,
                color: "#000",
                marginBottom: 15,
              }}
              multiline
            />

            <TouchableOpacity
              onPress={confirmCancel}
              style={{
                backgroundColor: "#ff4d00",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "700" }}>Confirm Cancel</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
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
  headerCell: { color: "#000", fontWeight: "800", paddingVertical: 12, textAlign: "center" },

  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#222", alignItems: "center", minHeight: 56 },
  rowOdd: { backgroundColor: "#181818" },
  rowEven: { backgroundColor: "#111" },

  cell: { color: "#fff", paddingVertical: 12, textAlign: "center", fontSize: 13 },

  col1: { width: 140 },
  col2: { width: 140 },
  col3: { width: 160 },
  col4: { width: 220 },
  col5: { width: 140 },
  col6: { width: 120 },
  col7: { width: 200 },

  approveBtn: {
    backgroundColor: "#1c7f19ff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  cancelBtn: {
    backgroundColor: "#ff4d00",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
});
