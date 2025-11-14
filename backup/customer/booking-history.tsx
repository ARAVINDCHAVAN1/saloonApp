import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebaseConfig";
import { colors } from "../../styles/theme";
import CustomerBottomNav from "./CustomerBottomNav";

export default function BookingHistory() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("Today");
  const [hasToday, setHasToday] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const customerData = await AsyncStorage.getItem("customer");
        if (!customerData) return;

        const customer = JSON.parse(customerData);
        const uid = customer.id;

        const q = query(
          collection(db, "userBookings"),
          where("userId", "==", uid),
          where("status", "==", "paid")
        );

        const snap = await getDocs(q);
        const list: any[] = [];
        snap.forEach((docu) => {
          const d = docu.data();
          list.push({ id: docu.id, ...d });
        });

        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setBookings(list);
        applyFilter("Today", list);
      } catch (err) {
        console.error("❌ Error loading bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  // ✅ Filter Logic
  const applyFilter = (type: string, sourceList?: any[]) => {
    const now = new Date();
    const list = sourceList || bookings;
    let result = list;

    if (type === "Today") {
      result = list.filter((b) => new Date(b.date).toDateString() === now.toDateString());
      setHasToday(result.length > 0);
    } else if (type === "Upcoming") {
      result = list.filter((b) => new Date(b.date) > now);
      setHasToday(false);
    } else if (type === "This Month") {
      result = list.filter((b) => {
        const bookingDate = new Date(b.date);
        return (
          bookingDate.getMonth() === now.getMonth() &&
          bookingDate.getFullYear() === now.getFullYear()
        );
      });
      setHasToday(false);
    } else if (type === "Last 3 Months") {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3);
      result = list.filter((b) => new Date(b.date) >= threeMonthsAgo);
      setHasToday(false);
    } else if (type === "Last 6 Months") {
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6);
      result = list.filter((b) => new Date(b.date) >= sixMonthsAgo);
      setHasToday(false);
    }

    setSelectedFilter(type);
    setFiltered(result);
  };

  // ✅ Status badge
  const getStatusBadge = (bookingDateStr: string) => {
    const now = new Date();
    const bookingDate = new Date(bookingDateStr);

    if (bookingDate.toDateString() === now.toDateString())
      return { label: "Today", color: "#f39c12" };
    if (bookingDate > now) return { label: "Upcoming", color: "#28a745" };
    return { label: "Completed", color: "#999" };
  };

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("isLoggedIn");
      await AsyncStorage.removeItem("customer");
      setSettingsVisible(false);
      router.replace("/customer-login"); // instant redirect
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // ✅ Booking Card
  const renderBooking = ({ item }: { item: any }) => {
    const status = getStatusBadge(item.date);
    const formattedDate = item.date
      ? new Date(item.date).toDateString()
      : "No date available";
    const isToday = status.label === "Today";

    return (
      <View
        style={{
          backgroundColor: isToday ? "#fffbe6" : "#fff",
          borderRadius: 12,
          marginBottom: 12,
          padding: 15,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
          borderLeftWidth: 5,
          borderLeftColor: status.color,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#222" }}>
            {item.barberName || "Barber"}
          </Text>
          <View
            style={{
              backgroundColor: status.color + "22",
              borderRadius: 8,
              paddingVertical: 3,
              paddingHorizontal: 8,
            }}
          >
            <Text style={{ color: status.color, fontWeight: "600", fontSize: 12 }}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
          <Ionicons name="calendar-outline" size={20} color="#555" />
          <Text style={{ marginLeft: 8, color: "#333", fontSize: 16, fontWeight: "600" }}>
            {formattedDate}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
          <Ionicons name="time-outline" size={20} color="#555" />
          <Text style={{ marginLeft: 8, color: "#333", fontSize: 16, fontWeight: "600" }}>
            {item.slotTime || "Time not specified"}
          </Text>
        </View>

        <Text
          style={{
            color: "green",
            fontWeight: "700",
            fontSize: 16,
            marginTop: 5,
          }}
        >
          ₹{item.amount || "0"} Paid
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      {/* 🔹 Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.primary,
          paddingHorizontal: 15,
          paddingTop: 45,
          paddingBottom: 12,
        }}
      >
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#000",
            marginLeft: 15,
            flex: 1,
          }}
        >
          My Bookings
        </Text>

        {/* 🛒 Cart */}
        <TouchableOpacity onPress={() => router.push("/customer/cart-empty")}>
          <Ionicons
            name="cart-outline"
            size={24}
            color="#000"
            style={{ marginRight: 15 }}
          />
        </TouchableOpacity>

        {/* ⚙️ Settings */}
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* ⚙️ Logout Modal */}
      <Modal
        visible={settingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setSettingsVisible(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              width: 250,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 10,
              }}
            >
              <Ionicons name="log-out-outline" size={22} color="red" />
              <Text style={{ marginLeft: 10, fontSize: 16, color: "red" }}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 🔹 Banner for Today's Bookings */}
      {hasToday && (
        <View
          style={{
            backgroundColor: "#fff8e1",
            borderLeftWidth: 5,
            borderLeftColor: "#f39c12",
            paddingVertical: 10,
            paddingHorizontal: 15,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="sunny-outline" size={22} color="#f39c12" />
          <Text
            style={{
              marginLeft: 10,
              color: "#333",
              fontWeight: "600",
              fontSize: 15,
            }}
          >
            You have booking(s) today!
          </Text>
        </View>
      )}

      {/* 🔹 Filters */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          padding: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#eee",
          backgroundColor: "#fff",
        }}
      >
        {["Today", "Upcoming", "This Month", "Last 3 Months", "Last 6 Months"].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => applyFilter(f)}
            style={{
              backgroundColor: selectedFilter === f ? colors.primary : "#fff",
              borderColor: colors.primary,
              borderWidth: 1,
              borderRadius: 10,
              paddingVertical: 6,
              paddingHorizontal: 12,
              margin: 5,
            }}
          >
            <Text
              style={{
                color: selectedFilter === f ? "#fff" : colors.primary,
                fontWeight: "600",
                fontSize: 13,
              }}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔹 Booking List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 40 }}
        />
      ) : filtered.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#888", fontSize: 15, marginBottom: 10 }}>
            No bookings found for this period.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
        />
      )}

      <CustomerBottomNav />
    </View>
  );
}
