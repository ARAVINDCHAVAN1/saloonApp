// app/staff/BarberAppointments.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  DocumentData,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";

import BarberHeader from "./BarberHeader";
import BarberBottomNav from "./BarberBottomNav";
import LeftMenu from "./LeftMenu";

// ================================================
// TYPES
// ================================================
type Booking = DocumentData & {
  id: string;
  salonId?: string;
  salonName?: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  barberId?: string;
  barberName?: string;
  date?: string;
  slotTime?: string;
  amount?: number;
  serviceName?: string;
  paymentId?: string;
  status?: string;
};

const FILTERS = [
  "Today",
  "Upcoming",
  "Completed",
  "This Month",
  "Last 3 Months",
  "Last 6 Months",
] as const;

// ================================================
// DATE PARSER
// ================================================
const parseBookingDate = (d: any): Date | null => {
  if (!d) return null;
  try {
    const converted = new Date(d);
    if (!isNaN(converted.getTime())) return converted;
    return null;
  } catch {
    return null;
  }
};

// ================================================
// AM/PM TIME PARSER
// ================================================
const parseAMPM = (timeString: string) => {
  try {
    const cleaned = timeString.replace(/\./g, "").replace(/\s+/g, " ").trim();
    const [time, modifier] = cleaned.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;

    return { hours, minutes };
  } catch (err) {
    console.log("parseAMPM error:", timeString, err);
    return null;
  }
};

// ================================================
// BOOKING STATUS LOGIC (DATE + TIME)
// ================================================
const getFullStatus = (dateStr?: string, slotTime?: string) => {
  if (!dateStr) return "Completed";

  const now = new Date();
  const bookingDate = new Date(dateStr);
  const today = new Date(now.toDateString());

  // Past Date → Completed
  if (bookingDate < today) return "Completed";

  // Future Date → Upcoming
  if (bookingDate > today) return "Upcoming";

  // Same Date → Compare Time
  if (!slotTime) return "Today";

  const start = slotTime.split("-")[0].trim();
  const parsed = parseAMPM(start);
  if (!parsed) return "Today";

  const slotDateTime = new Date();
  slotDateTime.setHours(parsed.hours, parsed.minutes, 0, 0);

  if (slotDateTime < now) return "Completed"; // time passed
  if (slotDateTime > now) return "Today";     // upcoming today

  return "Today";
};

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case "Today":
      return "#f39c12";
    case "Upcoming":
      return "#28a745";
    case "Completed":
      return "#888";
    default:
      return "#888";
  }
};

// ================================================
// FETCH HELPERS
// ================================================
const fetchSalonName = async (id?: string) => {
  if (!id) return "Salon";
  try {
    const snap = await getDoc(doc(db, "salons", id));
    if (snap.exists()) {
      const d: any = snap.data();
      return d.shopName || d.name || "Salon";
    }
  } catch {}
  return "Salon";
};

const fetchCustomer = async (uid?: string) => {
  if (!uid) return { name: "Customer", phone: "" };
  try {
    const snap = await getDoc(doc(db, "customers", uid));
    if (snap.exists()) {
      const d: any = snap.data();
      return { name: d.name || d.fullName || "Customer", phone: d.phone || "" };
    }
  } catch {}
  return { name: "Customer", phone: "" };
};

// ================================================
// MAIN COMPONENT
// ================================================
export default function BarberAppointments() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filtered, setFiltered] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedFilter, setSelectedFilter] =
    useState<typeof FILTERS[number]>("Today");
  const [showFilter, setShowFilter] = useState(false);

  const [ticketVisible, setTicketVisible] = useState(false);
  const [ticket, setTicket] = useState<Booking | null>(null);

  // Left menu
  const [menuVisible, setMenuVisible] = useState(false);
  const slide = useRef(new (require("react-native").Animated).Value(-270)).current;

  // LOAD PAYMENTS
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);

      try {
        const barberId = await AsyncStorage.getItem("barberId");
        if (!barberId) {
          setBookings([]);
          setFiltered([]);
          setLoading(false);
          return;
        }

        const qPayments = query(
          collection(db, "payments"),
          where("barberId", "==", barberId),
          where("status", "==", "paid")
        );

        const snap = await getDocs(qPayments);
        const list: Booking[] = [];

        for (const d of snap.docs) {
          const data = d.data() as any;

          const [salonName, customer] = await Promise.all([
            fetchSalonName(data.salonId),
            fetchCustomer(data.userId),
          ]);

          list.push({
            id: d.id,
            ...data,
            salonName,
            userName: customer.name,
            userPhone: customer.phone,
          });
        }

        list.sort((a, b) => {
          const da = parseBookingDate(a.date) ?? new Date(0);
          const db = parseBookingDate(b.date) ?? new Date(0);
          return db.getTime() - da.getTime();
        });

        if (!mounted) return;

        setBookings(list);
        applyFilter("Today", list);
      } catch (e) {
        console.log("Load payments error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // FILTER HANDLER
  const applyFilter = (type: typeof FILTERS[number], list = bookings) => {
    setSelectedFilter(type);
    const now = new Date();
    let result = [...list];

    if (type === "Today") {
      result = list.filter((b) => {
        const status = getFullStatus(b.date, b.slotTime);
        return status === "Today";
      });
    }

    if (type === "Upcoming") {
      result = list.filter((b) => {
        const status = getFullStatus(b.date, b.slotTime);
        return status === "Upcoming";
      });
    }

    if (type === "Completed") {
      result = list.filter((b) => {
        const status = getFullStatus(b.date, b.slotTime);
        return status === "Completed";
      });
    }

    // Date-based filters remain same
    if (type === "This Month") {
      result = list.filter((b) => {
        const d = parseBookingDate(b.date);
        return (
          d &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });
    }

    if (type === "Last 3 Months") {
      const dt = new Date();
      dt.setMonth(dt.getMonth() - 3);
      result = list.filter((b) => {
        const d = parseBookingDate(b.date);
        return d && d >= dt;
      });
    }

    if (type === "Last 6 Months") {
      const dt = new Date();
      dt.setMonth(dt.getMonth() - 6);
      result = list.filter((b) => {
        const d = parseBookingDate(b.date);
        return d && d >= dt;
      });
    }

    setFiltered(result);
  };

  const openTicket = (item: Booking) => {
    setTicket(item);
    setTicketVisible(true);
  };

  // RENDER BOOKING
  const renderBooking = ({ item }: { item: Booking }) => {
    const dt = parseBookingDate(item.date) || new Date();
    const status = getFullStatus(item.date, item.slotTime);
    const statusColor = getStatusColor(status);

    return (
      <View style={styles.bookingCard}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>
              {item.userName}
            </Text>
            <Text style={{ color: "#555" }}>{item.userPhone}</Text>
          </View>

          <TouchableOpacity onPress={() => openTicket(item)}>
            <Ionicons name="ticket-outline" size={28} color={colors.primary} />
            <Text style={{ fontSize: 10 }}>Ticket</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ marginTop: 6 }}>{dt.toDateString()}</Text>
        <Text>{item.slotTime}</Text>

        {/* STATUS FIXED */}
        <Text
          style={{ marginTop: 6, color: statusColor, fontWeight: "700" }}
        >
          {status}
        </Text>

        <Text style={{ marginTop: 6, color: "green", fontWeight: "700" }}>
          ₹{item.amount}
        </Text>
      </View>
    );
  };

  // LEFT MENU
  const openMenu = () => {
    setMenuVisible(true);
    require("react-native").Animated.timing(slide, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const closeMenu = () => {
    require("react-native").Animated.timing(slide, {
      toValue: -270,
      duration: 200,
      useNativeDriver: false,
    }).start(() => setMenuVisible(false));
  };

  // UI
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <BarberHeader openMenu={openMenu} />

      {/* FILTER AREA */}
      <View style={{ backgroundColor: "#fff", padding: 12 }}>
        <TouchableOpacity
          onPress={() => setShowFilter((s) => !s)}
          style={{
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: 10,
            padding: 12,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: colors.primary, fontWeight: "700" }}>
            {selectedFilter}
          </Text>
          <Ionicons
            name={showFilter ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>

        {showFilter && (
          <View
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              marginTop: 8,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => {
                  applyFilter(f);
                  setShowFilter(false);
                }}
                style={{
                  padding: 12,
                  backgroundColor:
                    selectedFilter === f ? "#eef7ff" : "#fff",
                }}
              >
                <Text style={{ color: colors.primary, fontWeight: "600" }}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderBooking}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 15, paddingBottom: 120 }}
        />
      )}

      {/* TICKET MODAL */}
      <Modal visible={ticketVisible} transparent animationType="fade">
        <View style={modalStyles.overlay}>
          <View style={modalStyles.card}>
            <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 15 }}>
              🎫 Booking Ticket
            </Text>

            {ticket && (
              <>
                <Text style={{ fontSize: 18, fontWeight: "700" }}>
                  {ticket.salonName}
                </Text>

                <View
                  style={{
                    height: 1,
                    backgroundColor: "#ccc",
                    width: "100%",
                    marginVertical: 10,
                  }}
                />

                <Text>Customer: {ticket.userName}</Text>
                <Text>Phone: {ticket.userPhone}</Text>
                <Text>Date: {ticket.date}</Text>
                <Text>Slot: {ticket.slotTime}</Text>
                <Text>Paid: ₹{ticket.amount}</Text>

                <View style={{ marginTop: 20, alignItems: "center" }}>
                  <QRCode value={JSON.stringify(ticket)} size={120} />
                </View>
              </>
            )}

            <TouchableOpacity
              onPress={() => setTicketVisible(false)}
              style={{
                backgroundColor: "#ccc",
                padding: 12,
                marginTop: 18,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "700" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BarberBottomNav />
      <LeftMenu visible={menuVisible} slide={slide} closeMenu={closeMenu} />
    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================
const styles = StyleSheet.create({
  bookingCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#ddd",
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
  },
});
