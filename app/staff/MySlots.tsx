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
import { db } from "../../firebaseConfig";
import { colors } from "../../styles/theme";
import BarberHeader from "./BarberHeader";

export default function MySlots() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSlots = async () => {
      try {
        const barberId = await AsyncStorage.getItem("barberId");
        const salonId = await AsyncStorage.getItem("salonId");
        if (!barberId || !salonId) return;

        const q = query(
          collection(db, "slots"),
          where("barberId", "==", barberId),
          where("salonId", "==", salonId)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSlots(data);
      } catch (e) {
        console.error("Error loading slots:", e);
      } finally {
        setLoading(false);
      }
    };
    loadSlots();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <BarberHeader />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Title */}
        <Text
          style={{
            color: "#000",
            fontSize: 26,
            fontWeight: "700",
            marginBottom: 18,
            textAlign: "center",
          }}
        >
          🕒 My Slots
        </Text>

        {/* Loading State */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: 60 }}
          />
        ) : slots.length === 0 ? (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginTop: 60,
            }}
          >
            <Text
              style={{
                color: "#999",
                fontSize: 20,
                textAlign: "center",
                marginTop: 10,
              }}
            >
              ✂️ No slots assigned yet
            </Text>
          </View>
        ) : (
          slots.map((slot, index) => (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: "#f9f9f9",
                borderWidth: 1,
                borderColor: "#e0e0e0",
                borderRadius: 16,
                paddingVertical: 20,
                paddingHorizontal: 20,
                marginBottom: 14,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}
              activeOpacity={0.9}
            >
              {/* Date */}
              <Text
                style={{
                  color: "#222",
                  fontSize: 18,
                  fontWeight: "700",
                  marginBottom: 8,
                }}
              >
                📅 {slot.date || "N/A"}
              </Text>

              {/* Time */}
              <Text
                style={{
                  color: "#EAB308", // your yellow accent
                  fontSize: 17,
                  fontWeight: "600",
                  marginBottom: 10,
                }}
              >
                ⏰{" "}
                {slot.fromTime && slot.toTime
                  ? `${slot.fromTime} - ${slot.toTime}`
                  : slot.timeSlot || "N/A"}
              </Text>

              {/* Message */}
              <Text
                style={{
                  color: "#555",
                  fontSize: 16,
                  fontStyle: "italic",
                  lineHeight: 22,
                }}
              >
                💬 {slot.message || slot.note || "No message"}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
