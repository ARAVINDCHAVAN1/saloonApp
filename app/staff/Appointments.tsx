// app/staff/MySlots.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";

export default function MySlots() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const monthMap: any = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };

  const cleanTime = (t: string) =>
    t.replace(/\u202F/g, " ").replace(/\s+/g, " ").trim();

  const parseSlotDate = (date?: string, fromTime?: string) => {
    if (!date || !fromTime) return null;

    const parts = date.split(" ");
    if (parts.length !== 4) return null;

    const month = monthMap[parts[1]];
    const day = Number(parts[2]);
    const year = Number(parts[3]);

    if (month === undefined || !day || !year) return null;

    const cleaned = cleanTime(fromTime);

    const [time, modifier] = cleaned.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const finalDate = new Date(year, month, day, hours, minutes);

    return isNaN(finalDate.getTime()) ? null : finalDate;
  };

  const isExpired = (date?: string, fromTime?: string) => {
    const slotDate = parseSlotDate(date, fromTime);
    if (!slotDate) return false;
    return slotDate.getTime() < Date.now();
  };

  // ✅ DESCENDING SORT
  const sortSlots = (slotsData: any[]) => {
    return slotsData.sort((a, b) => {
      const dateA = parseSlotDate(a.date, a.fromTime);
      const dateB = parseSlotDate(b.date, b.fromTime);

      if (!dateA || !dateB) return 0;

      return dateB.getTime() - dateA.getTime(); // DESCENDING ✅
    });
  };

  useEffect(() => {
    const loadSlots = async () => {
      try {
        const barberId = await AsyncStorage.getItem("barberId");
        const salonId = await AsyncStorage.getItem("salonId");

        if (!salonId) {
          setLoading(false);
          return;
        }

        let assignedSlots: any[] = [];
        if (barberId) {
          const qAssigned = query(
            collection(db, "slots"),
            where("barberId", "==", barberId),
            where("salonId", "==", salonId)
          );
          const snap1 = await getDocs(qAssigned);
          assignedSlots = snap1.docs.map((d) => ({ id: d.id, ...d.data() }));
        }

        const qGeneral = query(
          collection(db, "slots"),
          where("barberId", "==", null),
          where("salonId", "==", salonId)
        );
        const snap2 = await getDocs(qGeneral);
        const generalSlots = snap2.docs.map((d) => ({ id: d.id, ...d.data() }));

        const merged = [...assignedSlots, ...generalSlots];
        const sorted = sortSlots(merged);

        setSlots(sorted);
      } catch (error) {
        console.log("Error loading slots:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSlots();
  }, []);

  const getStatusBadge = (status: string, expired: boolean) => {
    if (expired)
      return (
        <Text style={{ marginTop: 8, fontSize: 15, fontWeight: "700", color: "red" }}>
          Completed
        </Text>
      );

    if (status === "booked")
      return (
        <Text
          style={{
            marginTop: 8,
            fontSize: 15,
            fontWeight: "700",
            color: "#EAB308",
          }}
        >
          Booked
        </Text>
      );

    return (
      <Text
        style={{
          marginTop: 8,
          fontSize: 15,
          fontWeight: "700",
          color: "green",
        }}
      >
        Available
      </Text>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <Text
          style={{
            color: "#000",
            fontSize: 26,
            fontWeight: "700",
            marginBottom: 18,
            textAlign: "center",
          }}
        >
          My Appointments
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: 50 }}
          />
        ) : slots.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Text style={{ fontSize: 18, color: "#777" }}>
              No Slots Assigned Yet
            </Text>
          </View>
        ) : (
          slots.map((slot) => {
            const expired = isExpired(slot.date, slot.fromTime);

            return (
              <TouchableOpacity
                key={slot.id}
                style={{
                  backgroundColor: expired ? "#fafafa" : "#f7f7f7",
                  borderRadius: 12,
                  padding: 18,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: "#ddd",
                  elevation: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: expired ? "#aaa" : "#111",
                  }}
                >
                  {slot.date || "N/A"}
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    color: expired ? "#999" : "#EAB308",
                    marginTop: 6,
                    fontWeight: "600",
                  }}
                >
                  {slot.fromTime && slot.toTime
                    ? `${slot.fromTime} - ${slot.toTime}`
                    : slot.timeSlot || "N/A"}
                </Text>

                {/* ✅ STATUS BADGE HERE */}
                {getStatusBadge(slot.status, expired)}

                {slot.note ? (
                  <Text
                    style={{
                      marginTop: 6,
                      fontSize: 15,
                      color: "#555",
                      fontStyle: "italic",
                    }}
                  >
                    {slot.note}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
