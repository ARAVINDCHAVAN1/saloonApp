// app/shop-owner/ShopOwnerSpotBooking.tsx

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";
import CustomTimePicker from "../shop-owner/CustomTimePicker";
import BarberBottomNav from "./BarberBottomNav";

// ---------- TIME HELPERS ----------
const formatTime = (d: Date) =>
  d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const toMinutes = (t: string) => {
  const cleaned = t.replace(/\s+/g, " ").trim();
  const [hhmm, mer] = cleaned.split(" ");
  const [hh, mm] = hhmm.split(":").map(Number);
  let h = hh;

  if (mer === "PM" && h < 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;

  return h * 60 + mm;
};

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  Math.max(aStart, bStart) < Math.min(aEnd, bEnd);

export default function BarberSpotBooking() {
  const router = useRouter();

  const [salonId, setSalonId] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string | null>(null);
  const [barberName, setBarberName] = useState<string | null>(null);

  const [autoSlots, setAutoSlots] = useState<any[]>([]);
  const [selectedAutoSlotId, setSelectedAutoSlotId] = useState<string | null>(
    null
  );

  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [pickerMode, setPickerMode] = useState<null | "from" | "to">(null);

  const [loading, setLoading] = useState(true);

  // ---------- LOAD LOGGED-IN BARBER ----------
  useEffect(() => {
    (async () => {
      const sid = await AsyncStorage.getItem("salonId");
      const bid = await AsyncStorage.getItem("barberId");
      const bname = await AsyncStorage.getItem("barberName");

      setSalonId(sid);
      setBarberId(bid);
      setBarberName(bname);

      setLoading(false);
    })();
  }, []);

  // ---------- GENERATE AUTO SLOTS ----------
  useEffect(() => {
    const now = new Date();
    const start = new Date(now);
    start.setSeconds(0, 0);

    const mins = start.getMinutes();
    const next45 = Math.ceil(mins / 45) * 45;

    if (next45 === 60) {
      start.setHours(start.getHours() + 1);
      start.setMinutes(0);
    } else {
      start.setMinutes(next45);
    }

    const end = new Date();
    end.setHours(22, 0, 0, 0);

    const slots: any[] = [];
    let cursor = new Date(start);

    while (cursor < end && slots.length < 13) {
      const from = new Date(cursor);
      const to = new Date(cursor.getTime() + 45 * 60000);

      if (to > end) break;

      slots.push({
        id: `${from.getTime()}`,
        fromTime: formatTime(from),
        toTime: formatTime(to),
      });

      cursor = to;
    }

    setAutoSlots(slots);

    if (slots.length > 0) {
      setCustomFrom(slots[0].fromTime);
      setCustomTo(slots[0].toTime);
    }
  }, []);

  const displayedSlots = useMemo(() => autoSlots.slice(0, 13), [autoSlots]);

  // ---------- TIME PICKER ----------
  const handleTimePicked = (time: string) => {
    const now = new Date();
    const pickedMinutes = toMinutes(time);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    if (pickedMinutes <= nowMinutes) {
      Alert.alert("Invalid Time", "You cannot select a past time.");
      return;
    }

    if (pickerMode === "from") {
      setCustomFrom(time);

      const [hh, mm, per] = time.split(/[: ]/);
      let h = Number(hh);
      let m = Number(mm) + 45;

      if (m >= 60) {
        m -= 60;
        h += 1;
        if (h > 12) h = h - 12;
      }

      setCustomTo(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${per}`);
    } else {
      if (toMinutes(time) <= toMinutes(customFrom)) {
        Alert.alert("Invalid Range", "End must be after start.");
        return;
      }
      setCustomTo(time);
    }

    setPickerMode(null);
  };

  // ---------- CHECK CONFLICT ONLY FOR THIS BARBER ----------
  const checkConflict = async (fromTime: string, toTime: string, dateStr: string) => {
    if (!barberId) return false;

    const newStart = toMinutes(fromTime);
    const newEnd = toMinutes(toTime);

    const q1 = query(
      collection(db, "spotpayment"),
      where("barberId", "==", barberId),
      where("date", "==", dateStr)
    );

    const snap1 = await getDocs(q1);

    for (const d of snap1.docs) {
      const s = d.data() as any;
      if (overlaps(newStart, newEnd, toMinutes(s.fromTime), toMinutes(s.toTime))) {
        return true;
      }
    }

    return false;
  };

  // ---------- SAVE BOOKING ----------
  const handleSave = async () => {
    if (!salonId || !barberId) {
      Alert.alert("Error", "Barber not logged in properly.");
      return;
    }

    const fromTime = customFrom;
    const toTime = customTo;

    if (toMinutes(toTime) <= toMinutes(fromTime)) {
      Alert.alert("Invalid", "End time must be after start.");
      return;
    }

    const dateStr = new Date().toDateString();

    const conflict = await checkConflict(fromTime, toTime, dateStr);

    if (conflict) {
      Alert.alert("Unavailable", "You already have a booking in this time.");
      return;
    }

    const payload = {
      salonId,
      barberId,
      barberName,
      createdBy: barberId,
      fromTime,
      toTime,
      date: dateStr,
      status: "paid",
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "spotpayment"), payload);

    Alert.alert("Success", "Booking created!", [
      { text: "OK", onPress: () => router.replace("/shop-owner/ShopOwnerSpotBookingList") },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.primary,
          paddingTop: 45,
          paddingBottom: 12,
          paddingHorizontal: 12,
        }}
      >
        <TouchableOpacity onPress={() => router.replace("/staff/BarberDashboard")}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={{ marginLeft: 16, fontSize: 18, fontWeight: "700" }}>
          Spot Booking
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 150 }}>
          
          {/* AUTO SLOTS */}
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
            Auto Slots (45 mins)
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {displayedSlots.map((slot) => {
              const active = selectedAutoSlotId === slot.id;
              return (
                <TouchableOpacity
                  key={slot.id}
                  onPress={() => {
                    setSelectedAutoSlotId(active ? null : slot.id);
                    setCustomFrom(slot.fromTime);
                    setCustomTo(slot.toTime);
                  }}
                  style={{
                    width: "23%",
                    margin: "1%",
                    paddingVertical: 8,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: active ? colors.primary : "#ccc",
                    backgroundColor: active ? colors.primary : "#fff",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: active ? "#fff" : colors.primary,
                      fontWeight: "700",
                      fontSize: 12,
                    }}
                  >
                    {slot.fromTime}
                  </Text>
                  <Text
                    style={{
                      color: active ? "#fff" : "#555",
                      fontSize: 11,
                      marginTop: 2,
                    }}
                  >
                    {slot.toTime}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* CUSTOM SLOT */}
          <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 20 }}>
            OR Custom Slot
          </Text>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 10,
                padding: 10,
              }}
              onPress={() => setPickerMode("from")}
            >
              <Text>From: {customFrom}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 10,
                padding: 10,
              }}
              onPress={() => setPickerMode("to")}
            >
              <Text>To: {customTo}</Text>
            </TouchableOpacity>
          </View>

          {/* SAVE BUTTON */}
          <TouchableOpacity
            onPress={handleSave}
            style={{
              backgroundColor: colors.primary,
              padding: 14,
              borderRadius: 10,
              alignItems: "center",
              marginTop: 24,
            }}
          >
            <Text style={{ fontWeight: "700" }}>Save Booking</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <CustomTimePicker
        visible={pickerMode !== null}
        initialTime={customFrom}
        onConfirm={handleTimePicked}
        onClose={() => setPickerMode(null)}
      />

      <BarberBottomNav />
    </View>
  );
}
