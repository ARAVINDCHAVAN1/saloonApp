import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
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
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";
import CustomerBottomNav from "./CustomerBottomNav";

export default function BookingHistory() {
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedFilter, setSelectedFilter] = useState("Today");
  const [showFilter, setShowFilter] = useState(false);

  const filterOptions = [
    "Today",
    "Upcoming",
    "This Month",
    "Last 3 Months",
    "Last 6 Months",
  ];

  const [ticketVisible, setTicketVisible] = useState(false);
  const [ticket, setTicket] = useState<any>(null);

  const viewShotRef = useRef(null);

  const getStatus = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);

    if (date.toDateString() === now.toDateString()) return "Today";
    return date > now ? "Upcoming" : "Completed";
  };

  // ✅ Fetch Salon Name
  const fetchSalonName = async (salonId: string) => {
    try {
      const salonRef = doc(db, "salons", salonId);
      const snap = await getDoc(salonRef);

      if (snap.exists()) {
        const d: any = snap.data();
        return d.shopName || d.name || "Salon";
      }
      return "Salon";
    } catch {
      return "Salon";
    }
  };

  // ✅ Load bookings
  useEffect(() => {
    const load = async () => {
      try {
        const customerData = await AsyncStorage.getItem("customer");
        if (!customerData) return;

        const customer = JSON.parse(customerData);

        const q = query(
          collection(db, "userBookings"),
          where("userId", "==", customer.id),
          where("status", "==", "paid")
        );

        const snap = await getDocs(q);
        const list: any[] = [];

        for (const docu of snap.docs) {
          const data = docu.data();
          const salonName = await fetchSalonName(data.salonId);

          list.push({
            id: docu.id,
            ...data,
            salonName,
          });
        }

        list.sort((a, b) => new Date(b.date) - new Date(a.date));

        setBookings(list);
        applyFilter("Today", list);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ✅ Filter logic
  const applyFilter = (type: string, list = bookings) => {
    setSelectedFilter(type);
    const now = new Date();

    let result = [...list];

    if (type === "Today") {
      result = list.filter(
        (b) => new Date(b.date).toDateString() === now.toDateString()
      );
    } else if (type === "Upcoming") {
      result = list.filter((b) => new Date(b.date) > now);
    } else if (type === "This Month") {
      result = list.filter((b) => {
        const d = new Date(b.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (type === "Last 3 Months") {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);

      result = list.filter((b) => new Date(b.date) >= threeMonthsAgo);
    } else if (type === "Last 6 Months") {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);

      result = list.filter((b) => new Date(b.date) >= sixMonthsAgo);
    }

    setFiltered(result);
  };

  // ✅ Open Ticket Popup
  const openTicket = (item: any) => {
    setTicket(item);
    setTicketVisible(true);
  };

  // ✅ Booking card UI
  const renderBooking = ({ item }: { item: any }) => {
    const status = getStatus(item.date);
    const statusColor =
      status === "Today" ? "#f39c12" : status === "Upcoming" ? "#28a745" : "#888";

    return (
      <View
        style={{
          backgroundColor: "#fff",
          padding: 15,
          borderRadius: 12,
          marginBottom: 12,
          elevation: 2,
          borderLeftWidth: 5,
          borderLeftColor: statusColor,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>
              {item.salonName}
            </Text>
            <Text style={{ color: "#555" }}>{item.barberName}</Text>
          </View>

          <TouchableOpacity onPress={() => openTicket(item)}>
            <Ionicons name="ticket-outline" size={26} color={colors.primary} />
            <Text style={{ fontSize: 10 }}>Ticket</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ marginTop: 6 }}>{new Date(item.date).toDateString()}</Text>
        <Text>{item.slotTime}</Text>

        <Text
          style={{ marginTop: 4, color: statusColor, fontWeight: "700" }}
        >
          {status}
        </Text>

        <Text style={{ marginTop: 5, color: "green", fontWeight: "700" }}>
          ₹{item.amount} Paid
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      {/* ✅ HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.primary,
          paddingTop: 45,
          paddingBottom: 12,
          paddingHorizontal: 15,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: "700", marginLeft: 15 }}>
          My Bookings
        </Text>
      </View>

      {/* ✅ FILTER */}
      <View style={{ backgroundColor: "#fff", padding: 12 }}>
        <TouchableOpacity
          onPress={() => setShowFilter(!showFilter)}
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
          <View style={{ borderWidth: 1, borderColor: "#ddd", marginTop: 8 }}>
            {filterOptions.map((f, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  applyFilter(f);
                  setShowFilter(false);
                }}
                style={{
                  padding: 12,
                  backgroundColor: selectedFilter === f ? "#eef7ff" : "#fff",
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

      {/* ✅ LIST */}
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

      {/* ✅ TICKET POPUP */}
      <Modal visible={ticketVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            ref={viewShotRef}
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 12,
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: "#444",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                marginBottom: 15,
              }}
            >
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

                <Text>Barber: {ticket.barberName}</Text>
                <Text>Date: {new Date(ticket.date).toDateString()}</Text>
                <Text>Slot: {ticket.slotTime}</Text>
                <Text>Status: {getStatus(ticket.date)}</Text>
                <Text>Paid: ₹{ticket.amount}</Text>

                {/* ✅ QR CODE */}
                <View style={{ marginTop: 20 }}>
                  <QRCode
                    value={JSON.stringify(ticket)}
                    size={120}
                  />
                </View>
              </>
            )}
          </View>

          <TouchableOpacity
            onPress={() => setTicketVisible(false)}
            style={{
              backgroundColor: "#ccc",
              padding: 12,
              marginTop: 20,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "700" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <CustomerBottomNav />
    </View>
  );
}
