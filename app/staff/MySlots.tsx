// app/barber/SlotCreate.tsx

import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { db } from "../../src/firebase/firebaseConfig";
import { colors, serviceStyles } from "../../styles/theme";

import BarberBottomNav from "./BarberBottomNav";
import BarberHeader from "./BarberHeader";
import LeftMenu from "./LeftMenu";

import CustomTimePicker from "../shop-owner/CustomTimePicker";

// ----------------- HELPERS -----------------
const toMinutes = (t: string) => {
  if (!t || !t.includes(":")) return 0;
  const cleaned = t.replace(/\u202F/g, " ").replace(/\s+/g, " ").trim();
  const [hm, mer] = cleaned.split(" ");
  const [h, m] = hm.split(":").map(Number);
  let hour = h;

  if (mer?.toUpperCase() === "PM" && hour < 12) hour += 12;
  if (mer?.toUpperCase() === "AM" && hour === 12) hour = 0;

  return hour * 60 + (m || 0);
};

const overlaps = (a1: number, a2: number, b1: number, b2: number) =>
  Math.max(a1, b1) < Math.min(a2, b2);

const formatTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

// ----------------- TYPES -----------------
interface AutoSlot {
  id: string;
  fromTime: string;
  toTime: string;
}

// ----------------------------------------------------
export default function SlotCreate() {
  const [role, setRole] = useState<string | null>(null);
  const [salonId, setSalonId] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string | null>(null);
  const [barberName, setBarberName] = useState("");

  const [date, setDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  const [fromTime, setFromTime] = useState("09:00 AM");
  const [toTime, setToTime] = useState("09:30 AM");

  const [pickerMode, setPickerMode] = useState<null | "from" | "to">(null);

  const [note, setNote] = useState("");
  const [daySlots, setDaySlots] = useState<any[]>([]);

  const [onLeave, setOnLeave] = useState(false);

  // Auto slots (45 min, show up to 13)
  const [autoSlots, setAutoSlots] = useState<AutoSlot[]>([]);

  // Left menu
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

  // ---------------------------
  // INITIAL LOAD
  // ---------------------------
  useEffect(() => {
    (async () => {
      setRole(await AsyncStorage.getItem("role"));
      setSalonId(await AsyncStorage.getItem("salonId"));
      setBarberId(await AsyncStorage.getItem("barberId"));
      setBarberName((await AsyncStorage.getItem("barberName")) || "");

      const today = new Date();
      setDate(today);
      generateDays(today);

      // load slots & autos
      const bId = await AsyncStorage.getItem("barberId");
      if (bId) {
        await loadDaySlots(bId, today);
      }
      generateAutoSlotsForDate(today);
    })();
  }, []);

  // ---------------------------
  // DATE STRIP
  // ---------------------------
  const generateDays = (base: Date) => {
    const start = new Date(base);
    start.setDate(start.getDate() - 1);

    const list: Date[] = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      list.push(d);
    }
    setWeekDates(list);
  };

  const moveDays = (n: number) => {
    const nd = new Date(date);
    nd.setDate(nd.getDate() + n * 4);
    setDate(nd);
    generateDays(nd);
    // regenerate autos and reload slots for barber
    generateAutoSlotsForDate(nd);
    if (barberId) loadDaySlots(barberId, nd);
  };

  const formattedDate = useMemo(() => date.toDateString(), [date]);

  // ---------------------------
  // AUTO SLOTS (45 min, show up to 13)
  // ---------------------------
  const generateAutoSlotsForDate = (target: Date) => {
    const today = new Date();
    const todayStr = today.toDateString();
    const targetStr = target.toDateString();

    // Past date → no auto slots
    if (new Date(targetStr) < new Date(todayStr)) {
      setAutoSlots([]);
      return;
    }

    let start = new Date(target);
    let end = new Date(target);
    end.setHours(22, 0, 0, 0); // 10 PM closing

    if (targetStr === todayStr) {
      // Today → start from next available 45-min block after NOW
      start = new Date();
    } else {
      // Future → start from 9:00 AM
      start.setHours(9, 0, 0, 0);
    }

    // Round to next 45-min block
    const mins = start.getMinutes();
    const next45 = Math.ceil(mins / 45) * 45;
    if (next45 === 60) {
      start.setHours(start.getHours() + 1);
      start.setMinutes(0, 0, 0);
    } else {
      start.setMinutes(next45, 0, 0);
    }

    if (start >= end) {
      setAutoSlots([]);
      return;
    }

    const slots: AutoSlot[] = [];
    let cursor = new Date(start);

    while (cursor < end && slots.length < 13) {
      const from = new Date(cursor);
      const to = new Date(cursor.getTime() + 45 * 60000); // +45 mins

      if (to > end) break;

      slots.push({
        id: String(from.getTime()),
        fromTime: formatTime(from),
        toTime: formatTime(to),
      });

      cursor = to; // next slot starts where this ended
    }

    setAutoSlots(slots);

    if (slots.length > 0) {
      setFromTime(slots[0].fromTime);
      setToTime(slots[0].toTime);
    } else {
      // fallback to default
      setFromTime("09:00 AM");
      setToTime("09:30 AM");
    }
  };

  useEffect(() => {
    generateAutoSlotsForDate(date);
  }, [date]);

  // ---------------------------
  // LOAD SLOTS
  // ---------------------------
  const loadDaySlots = async (bId: string | null, d: Date) => {
    if (!bId) return;

    const q1 = query(
      collection(db, "slots"),
      where("barberId", "==", bId),
      where("date", "==", d.toDateString())
    );

    const snap1 = await getDocs(q1);

    const rawSlots = snap1.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    // For each slot, check payments to determine booking
    const updated = await Promise.all(
      rawSlots.map(async (s) => {
        const qPay = query(
          collection(db, "payments"),
          where("slotId", "==", s.id),
          where("status", "==", "paid"),
          where("paymentStatus", "==", "captured")
        );

        const sPay = await getDocs(qPay);
        const isBooked = !sPay.empty;

        return { ...s, isBooked };
      })
    );

    // sort by fromTime
    updated.sort((a, b) => toMinutes(a.fromTime) - toMinutes(b.fromTime));

    setDaySlots(updated);
  };

  useEffect(() => {
    if (barberId) loadDaySlots(barberId, date);
  }, [barberId, date]);

  // ---------------------------
  // PAST-TIME CHECK (same logic as shop owner)
  // ---------------------------
  const isPastSlot = () => {
    const today = new Date();
    const todayStr = today.toDateString();
    const targetStr = date.toDateString();

    const newStart = toMinutes(fromTime);
    const nowMinutes = today.getHours() * 60 + today.getMinutes();

    // Past day
    if (new Date(targetStr) < new Date(todayStr)) return true;

    // Future day → allowed
    if (new Date(targetStr) > new Date(todayStr)) return false;

    // Same day → compare start time (disallow if start <= now)
    return newStart <= nowMinutes;
  };

  // ---------------------------
  // CREATE SLOT
  // ---------------------------
  const addSlot = async () => {
    if (onLeave) return Alert.alert("Barber unavailable");
    if (isPastSlot()) return Alert.alert("Past time not allowed");

    const start = toMinutes(fromTime);
    const end = toMinutes(toTime);

    if (end <= start) return Alert.alert("Invalid time range");

    // Check duplication & overlap for this barber & date
    const qCheck = query(
      collection(db, "slots"),
      where("barberId", "==", barberId),
      where("date", "==", formattedDate)
    );

    const snap = await getDocs(qCheck);
    const exist = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

    // Exact duplicate
    const duplicate = exist.find((s) => s.fromTime === fromTime && s.toTime === toTime);
    if (duplicate) return Alert.alert("Duplicate Slot", "This slot already exists.");

    // Overlap
    const conflict = exist.find((s) =>
      overlaps(start, end, toMinutes(s.fromTime), toMinutes(s.toTime))
    );
    if (conflict)
      return Alert.alert(
        "Conflict",
        `Overlaps with existing ${conflict.fromTime} - ${conflict.toTime}`
      );

    // Save
    await addDoc(collection(db, "slots"), {
      salonId,
      barberId,
      barberName,
      date: formattedDate,
      fromTime,
      toTime,
      note,
      status: "available",
      createdAt: new Date().toISOString(),
      createdBy: role,
      createdById: barberId,
    });

    Alert.alert("Slot added");
    setNote("");
    loadDaySlots(barberId, date);
  };

  // ---------------------------
  // HANDLE TIME PICK
  // ---------------------------
  const onSelectTime = (time: string) => {
    if (pickerMode === "from") {
      setFromTime(time);

      // Auto-set +30 minutes (keep barber default 30 min)
      const parts = time.replace(/\u202F/g, " ").replace(/\s+/g, " ").trim().split(/[: ]/);
      let hour = parseInt(parts[0], 10);
      let minute = parseInt(parts[1], 10) + 30;
      const per = parts[2];

      if (minute >= 60) {
        minute -= 60;
        hour += 1;
        if (hour > 12) hour = 1;
      }
      setToTime(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${per}`);
    } else {
      setToTime(time);
    }
    setPickerMode(null);
  };

  const sortedDaySlots = useMemo(
    () => [...daySlots].sort((a, b) => toMinutes(a.fromTime) - toMinutes(b.fromTime)),
    [daySlots]
  );

  const getSlotStatusLabel = (slot: any) => {
    if (slot.isBooked) return { label: "Booked", color: "#1e88e5" };

    const sDate = new Date(slot.date);
    const today = new Date(new Date().toDateString());
    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();

    if (sDate < today) return { label: "Completed", color: "red" };

    if (sDate.toDateString() === today.toDateString()) {
      if (toMinutes(slot.toTime) <= nowMins) return { label: "Completed", color: "red" };
    }

    return { label: "Upcoming", color: "green" };
  };

  const isAddDisabled = isPastSlot();

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BarberHeader openMenu={openMenu} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <Text style={[serviceStyles.title, { textAlign: "center" }]}>🕒 Slot Management</Text>

        <Text style={{ marginBottom: 10, fontWeight: "600", fontSize: 16 }}>
          Logged in as: {barberName}
        </Text>

        {/* MONTH */}
        <Text
          style={{
            textAlign: "center",
            fontSize: 18,
            fontWeight: "700",
            color: colors.primary,
            marginBottom: 12,
          }}
        >
          {date.toLocaleString("en-US", { month: "long" })} {date.getFullYear()}
        </Text>

        {/* DATE STRIP */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 20 }}>
          <TouchableOpacity onPress={() => moveDays(-1)} style={{ paddingHorizontal: 18 }}>
            <Icon name="chevron-left" size={36} color={colors.primary} />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", gap: 10 }}>
            {weekDates.map((d, idx) => {
              const active = d.toDateString() === date.toDateString();
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setDate(d);
                    generateDays(d);
                    generateAutoSlotsForDate(d);
                    if (barberId) loadDaySlots(barberId, d);
                  }}
                  style={{
                    width: 55,
                    height: 55,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: active ? colors.primary : "#fff",
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: active ? colors.primary : "#ccc",
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "700" }}>{d.getDate()}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity onPress={() => moveDays(1)} style={{ paddingHorizontal: 18 }}>
            <Icon name="chevron-right" size={36} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Auto Slots (45 min) */}
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 6 }}>Auto Slots (45 min)</Text>
        <Text style={{ color: "#777", fontSize: 12, marginBottom: 8 }}>
          For today: from next available 45 minutes until 10:00 PM.{"\n"}
          For future dates: from 9:00 AM to 10:00 PM. (showing first 13 slots)
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 10 }}>
          {autoSlots.length === 0 ? (
            <Text style={{ color: "#999", marginTop: 4 }}>No auto slots.</Text>
          ) : (
            autoSlots.map((s) => {
              const active = fromTime === s.fromTime && toTime === s.toTime;
              return (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => {
                    if (active) {
                      setFromTime("");
                      setToTime("");
                    } else {
                      setFromTime(s.fromTime);
                      setToTime(s.toTime);
                    }
                  }}
                  style={{
                    width: "23%",
                    margin: "1%",
                    paddingVertical: 8,
                    paddingHorizontal: 4,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: active ? "green" : "#ccc",
                    backgroundColor: active ? colors.primary : "#fff",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontWeight: "700", fontSize: 12, textAlign: "center", color: active ? "#000" : colors.primary }}>
                    {s.fromTime}
                  </Text>
                  <Text style={{ fontSize: 11, color: active ? "#000" : "#555", marginTop: 2 }}>
                    {s.toTime}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* TIME PICKERS */}
        <TouchableOpacity style={serviceStyles.input} onPress={() => setPickerMode("from")}>
          <Text>🕒 From: {fromTime}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={serviceStyles.input} onPress={() => setPickerMode("to")}>
          <Text>⏰ To: {toTime}</Text>
        </TouchableOpacity>

        <CustomTimePicker
          visible={pickerMode !== null}
          initialTime={pickerMode === "from" ? fromTime : toTime}
          onClose={() => setPickerMode(null)}
          onConfirm={onSelectTime}
        />

        {/* NOTE */}
        <TextInput
          placeholder="Add note (optional)"
          style={[serviceStyles.input, { height: 90, textAlignVertical: "top" }]}
          value={note}
          onChangeText={setNote}
          multiline
        />

        {/* ADD SLOT */}
        <TouchableOpacity
          style={[serviceStyles.submitButton, isAddDisabled && { backgroundColor: "#aaa" }]}
          disabled={isAddDisabled}
          onPress={addSlot}
        >
          <Text style={serviceStyles.submitButtonText}>
            {isAddDisabled ? "Past Time (Not Allowed)" : "Add Slot"}
          </Text>
        </TouchableOpacity>

        {/* SLOTS LIST */}
        {sortedDaySlots.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={[serviceStyles.title, { marginBottom: 8 }]}>📋 Slots on {formattedDate}</Text>

            {sortedDaySlots.map((s) => {
              const { label, color } = getSlotStatusLabel(s);

              return (
                <View
                  key={s.id}
                  style={{
                    backgroundColor: "#fff",
                    padding: 12,
                    borderRadius: 12,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: "#eee",
                  }}
                >
                  <Text style={{ fontWeight: "700", fontSize: 16 }}>
                    {s.fromTime} — {s.toTime}
                  </Text>

                  {!!s.note && (
                    <Text style={{ marginTop: 6, fontStyle: "italic", color: "#666" }}>
                      “{s.note}”
                    </Text>
                  )}

                  <Text style={{ marginTop: 8, fontWeight: "700", color }}>{label}</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <BarberBottomNav />
      <LeftMenu visible={menuVisible} slide={slide} closeMenu={closeMenu} />
    </View>
  );
}
