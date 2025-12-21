// app/shop-owner/SlotList.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { db } from "../../src/firebase/firebaseConfig";
import { colors, serviceStyles } from "../../styles/theme";

/* ---------------- HELPERS ---------------- */

// Convert "09:00 AM" → minutes
const toMinutes = (time12: string): number => {
  if (!time12) return 0;
  const cleaned = time12.replace(/\u202F/g, " ").replace(/\s+/g, " ").trim();
  const [hhmm, mer] = cleaned.split(" ");
  const [hh, mm] = hhmm.split(":").map(Number);
  let h = hh;

  if (mer?.toUpperCase() === "PM" && h < 12) h += 12;
  if (mer?.toUpperCase() === "AM" && h === 12) h = 0;

  return h * 60 + (mm || 0);
};

// Decide slot label + priority
const getSlotStatusLabel = (slot: any) => {
  const slotDate = new Date(slot.date);
  const today = new Date(new Date().toDateString());
  const now = new Date();

  // 1️⃣ UNAVAILABLE
  if (slot.status === "unavailable") {
    return { label: "Unavailable", priority: 5, color: "#9e9e9e" };
  }

  // 2️⃣ BOOKED
  if (slot.isBooked) {
    return { label: "Booked", priority: 2, color: "#1e88e5" };
  }

  // 3️⃣ EXPIRED (past but not booked)
  const endMin = toMinutes(slot.toTime);
  const nowMin = now.getHours() * 60 + now.getMinutes();

  if (
    slotDate < today ||
    (slotDate.toDateString() === today.toDateString() &&
      endMin <= nowMin)
  ) {
    return { label: "Expired", priority: 3, color: "#f57c00" };
  }

  // 4️⃣ UPCOMING
  return { label: "Upcoming", priority: 1, color: "green" };
};

export default function SlotList() {
  const [slots, setSlots] = useState<any[]>([]);
  const [salonId, setSalonId] = useState<string | null>(null);

  /* ---------------- LOAD SALON ---------------- */

  useEffect(() => {
    (async () => {
      const sid = await AsyncStorage.getItem("shopId");
      setSalonId(sid);
    })();
  }, []);

  useEffect(() => {
    if (salonId) loadSlots();
  }, [salonId]);

  /* ---------------- LOAD SLOTS ---------------- */

  const loadSlots = async () => {
    if (!salonId) return;

    const snap = await getDocs(
      query(collection(db, "slots"), where("salonId", "==", salonId))
    );

    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Attach booking info
    const enriched = await Promise.all(
      data.map(async (slot) => {
        const qPay = query(
          collection(db, "payments"),
          where("slotId", "==", slot.id),
          where("status", "==", "paid"),
          where("paymentStatus", "==", "captured")
        );

        const snapPay = await getDocs(qPay);
        return { ...slot, isBooked: !snapPay.empty };
      })
    );

    // 🔥 SORT: Upcoming → Booked → Expired → Unavailable
    enriched.sort((a, b) => {
      const sa = getSlotStatusLabel(a);
      const sb = getSlotStatusLabel(b);

      if (sa.priority !== sb.priority) {
        return sa.priority - sb.priority;
      }

      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      if (da !== db) return da - db;

      return toMinutes(a.fromTime) - toMinutes(b.fromTime);
    });

    setSlots(enriched);
  };

  /* ---------------- DELETE SLOT ---------------- */

  const handleDelete = async (id: string, isBooked: boolean) => {
    if (isBooked) {
      return Alert.alert("Cannot Delete", "This slot is already booked.");
    }

    Alert.alert("Delete Slot?", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "slots", id));
          loadSlots();
        },
      },
    ]);
  };

  /* ---------------- TOGGLE AVAILABILITY ---------------- */

  const toggleAvailability = async (
    id: string,
    status: string,
    disabled: boolean
  ) => {
    if (disabled) return;

    await updateDoc(doc(db, "slots", id), {
      status: status === "available" ? "unavailable" : "available",
    });

    loadSlots();
  };

  /* ---------------- UI ---------------- */

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Text style={[serviceStyles.title, { marginBottom: 20 }]}>
        📋 Slot List
      </Text>

      <FlatList
        data={slots}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <Text style={serviceStyles.emptyText}>No slots found.</Text>
        }
        renderItem={({ item }) => {
          const { label, color } = getSlotStatusLabel(item);
          const disableToggle = label !== "Upcoming";

          return (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                backgroundColor: "#fff",
                marginBottom: 10,
                padding: 12,
                borderRadius: 12,
                elevation: 2,
              }}
            >
              {/* LEFT */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "700" }}>
                  {item.date} | {item.fromTime} - {item.toTime}
                </Text>

                <Text style={{ color: "#555" }}>
                  {item.barberName || "No Barber"}
                </Text>

                {item.note && (
                  <Text style={{ color: "#777" }}>📝 {item.note}</Text>
                )}

                <Text
                  style={{
                    marginTop: 6,
                    fontWeight: "700",
                    color,
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </Text>
              </View>

              {/* RIGHT */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity
                  disabled={disableToggle}
                  onPress={() =>
                    toggleAvailability(item.id, item.status, disableToggle)
                  }
                  style={{
                    backgroundColor: disableToggle
                      ? "#ddd"
                      : item.status === "available"
                      ? "#ffe5e5"
                      : "#e6ffe6",
                    opacity: disableToggle ? 0.5 : 1,
                    borderRadius: 50,
                    padding: 8,
                    marginHorizontal: 6,
                  }}
                >
                  <Icon
                    name={
                      item.status === "available"
                        ? "close-circle-outline"
                        : "check-circle-outline"
                    }
                    size={24}
                    color={
                      item.status === "available"
                        ? "#cc0000"
                        : colors.primary
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={item.isBooked}
                  onPress={() => handleDelete(item.id, item.isBooked)}
                  style={{
                    backgroundColor: item.isBooked ? "#ddd" : "#ffe5e5",
                    opacity: item.isBooked ? 0.5 : 1,
                    borderRadius: 50,
                    padding: 8,
                    marginHorizontal: 6,
                  }}
                >
                  <Icon name="delete-outline" size={24} color="#cc0000" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
