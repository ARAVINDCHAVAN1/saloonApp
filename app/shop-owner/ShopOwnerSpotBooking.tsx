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
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";
import CustomTimePicker from "./CustomTimePicker";
import ShopOwnerBottomNav from "./ShopOwnerBottomNav";

// --------- Time Helpers ---------
const formatTime = (d: Date) =>
  d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const toMinutes = (time12: string): number => {
  const cleaned = time12.replace(/\s+/g, " ").trim();
  const [hhmm, mer] = cleaned.split(" ");
  const [hh, mm] = hhmm.split(":").map(Number);
  let h = hh;

  if (mer?.toUpperCase() === "PM" && h < 12) h += 12;
  if (mer?.toUpperCase() === "AM" && h === 12) h = 0;

  return h * 60 + (mm || 0);
};

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  Math.max(aStart, bStart) < Math.min(aEnd, bEnd);

type Barber = {
  id: string;
  name: string;
  photoUrl?: string;
};

type AutoSlot = {
  id: string;
  fromTime: string;
  toTime: string;
};

export default function ShopOwnerSpotBooking() {
  const router = useRouter();
  const [salonId, setSalonId] = useState<string | null>(null);

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [search, setSearch] = useState("");

  const [autoSlots, setAutoSlots] = useState<AutoSlot[]>([]);
  const [selectedAutoSlotId, setSelectedAutoSlotId] = useState<string | null>(
    null
  );

  // Custom slot
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");

  // for CustomTimePicker
  const [pickerMode, setPickerMode] = useState<null | "from" | "to">(null);

  const [loading, setLoading] = useState(true);

  // ---------- Load salonId ----------
  useEffect(() => {
    (async () => {
      const sid = await AsyncStorage.getItem("shopId");
      setSalonId(sid);
    })();
  }, []);

  // ---------- Load barbers ----------
  useEffect(() => {
    if (!salonId) return;

    const load = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "barbers"), where("salonId", "==", salonId))
        );
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        })) as Barber[];
        setBarbers(items);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [salonId]);

  // ---------- Generate auto slots (45 mins, first 13 slots) ----------
  useEffect(() => {
    const now = new Date();
    const start = new Date(now);
    start.setSeconds(0, 0);

    // Round to next 45-min block
    const mins = start.getMinutes();
    const next45 = Math.ceil(mins / 45) * 45;

    if (next45 === 60) {
      start.setHours(start.getHours() + 1);
      start.setMinutes(0, 0, 0);
    } else {
      start.setMinutes(next45, 0, 0);
    }

    // End time 10 PM
    const end = new Date();
    end.setHours(22, 0, 0, 0);

    const slots: AutoSlot[] = [];
    let cursor = new Date(start);

    while (cursor < end && slots.length < 13) {
      const from = new Date(cursor);
      const to = new Date(cursor.getTime() + 45 * 60000); // +45 mins

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

  // show first 13 slots (we have already generated max 13)
  const displayedSlots = useMemo(() => autoSlots.slice(0, 13), [autoSlots]);

  const visibleBarbers = useMemo(
    () =>
      barbers.filter((b) =>
        (b.name || "").toLowerCase().includes(search.toLowerCase())
      ),
    [barbers, search]
  );

  // ---------- Time Picker using CustomTimePicker ----------
  const handleTimePicked = (time: string) => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const pickedMinutes = toMinutes(time);

    // No past times allowed (today only)
    if (pickedMinutes <= nowMinutes) {
      Alert.alert("Invalid Time", "You cannot select a past time.");
      return;
    }

    if (pickerMode === "from") {
      setCustomFrom(time);

      // auto +45 mins for "to" (changed to 45)
      const [hh, mm, per] = time.split(/[: ]/);
      let h = Number(hh);
      let m = Number(mm) + 45;

      if (m >= 60) {
        m -= 60;
        h += 1;
        if (h > 12) h = h - 12 === 0 ? 12 : h - 12; // handle wrap safely
      }

      const next = `${String(h).padStart(2, "0")}:${String(m).padStart(
        2,
        "0"
      )} ${per}`;
      setCustomTo(next);
    } else if (pickerMode === "to") {
      // Ensure end > start
      if (customFrom) {
        const fromMin = toMinutes(customFrom);
        const toMin = toMinutes(time);
        if (toMin <= fromMin) {
          Alert.alert(
            "Invalid Range",
            "End time must be greater than start time."
          );
          return;
        }
      }
      setCustomTo(time);
    }

    setPickerMode(null);
  };

  const defaultInitialTime = useMemo(() => {
    if (pickerMode === "from") {
      return customFrom || displayedSlots[0]?.fromTime || formatTime(new Date());
    } else {
      return (
        customTo ||
        customFrom ||
        displayedSlots[0]?.fromTime ||
        formatTime(new Date())
      );
    }
  }, [pickerMode, customFrom, customTo, displayedSlots]);

  // ============================================================
  // 🚨 CHECK BARBER SLOT CONFLICT (slots + spotpayment)
  // ============================================================
  const checkBarberConflict = async (
    barberId: string | null,
    fromTime: string,
    toTime: string,
    dateStr: string
  ) => {
    const newStart = toMinutes(fromTime);
    const newEnd = toMinutes(toTime);

    // we check both barber-specific and general (when barberId is null)
    const barberCondition =
      barberId === null
        ? where("barberId", "==", null)
        : where("barberId", "==", barberId);

    // 1️⃣ CHECK ONLINE BOOKINGS in "slots"
    const q1 = query(
      collection(db, "slots"),
      barberCondition,
      where("date", "==", dateStr)
    );
    const snap1 = await getDocs(q1);

    for (let d of snap1.docs) {
      const s = d.data() as any;
      const sStart = toMinutes(s.fromTime);
      const sEnd = toMinutes(s.toTime);

      if (overlaps(newStart, newEnd, sStart, sEnd)) {
        Alert.alert(
          "Barber Unavailable",
          barberId
            ? "This barber already has an online booking in this time."
            : "A general slot is already booked in this time."
        );
        return true;
      }
    }

    // 2️⃣ CHECK WALK-IN BOOKINGS in "spotpayment"
    const q2 = query(
      collection(db, "spotpayment"),
      barberCondition,
      where("date", "==", dateStr)
    );
    const snap2 = await getDocs(q2);

    for (let d of snap2.docs) {
      const s = d.data() as any;
      const sStart = toMinutes(s.fromTime);
      const sEnd = toMinutes(s.toTime);

      if (overlaps(newStart, newEnd, sStart, sEnd)) {
        Alert.alert(
          "Barber Unavailable",
          barberId
            ? "This barber already has a walk-in booking in this time."
            : "A general walk-in booking already exists in this time."
        );
        return true;
      }
    }

    return false;
  };

  // ============================================================
  // SAVE SPOT BOOKING (no amount field, as requested)
  // ============================================================
  const handleSaveSpotPayment = async () => {
    if (!salonId) return Alert.alert("Error", "Salon ID missing");

    let fromTime = "";
    let toTime = "";

    // First priority: custom times
    if (customFrom && customTo) {
      fromTime = customFrom;
      toTime = customTo;
    } else if (selectedAutoSlotId) {
      const s = autoSlots.find((x) => x.id === selectedAutoSlotId);
      if (!s) return Alert.alert("Error", "Selected slot not found");
      fromTime = s.fromTime;
      toTime = s.toTime;
    } else {
      return Alert.alert(
        "Choose Time",
        "Select an auto slot or set a custom time"
      );
    }

    const startMin = toMinutes(fromTime);
    const endMin = toMinutes(toTime);
    if (!(endMin > startMin)) {
      return Alert.alert(
        "Invalid Range",
        "End time must be greater than start time."
      );
    }

    const dateStr = new Date().toDateString();

    // 🔥 Check conflict for barber OR general slot
    const barberIdForCheck = selectedBarber ? selectedBarber.id : null;
    const conflict = await checkBarberConflict(
      barberIdForCheck,
      fromTime,
      toTime,
      dateStr
    );
    if (conflict) return; // stop save

    // Save walk-in booking (NO amount field)
    const payload: any = {
      salonId,
      createdBy: salonId,
      date: dateStr,
      fromTime,
      toTime,
      createdAt: serverTimestamp(),
      status: "paid",
    };

    if (selectedBarber) {
      payload.barberId = selectedBarber.id;
      payload.barberName = selectedBarber.name;
    } else {
      payload.barberId = null;
      payload.barberName = "General";
    }

    try {
      await addDoc(collection(db, "spotpayment"), payload);
      Alert.alert("Success", "Spot booking saved!", [
        {
          text: "OK",
          onPress: () => router.replace("/shop-owner/ShopOwnerSpotBookingList"),
        },
      ]);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Could not save spot booking.");
    }
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
        <TouchableOpacity
          onPress={() => router.replace("/shop-owner/ShopOwnerDashboard")}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text
          style={{
            marginLeft: 16,
            fontSize: 18,
            fontWeight: "700",
            color: "#000",
          }}
        >
          Spot Booking
        </Text>
      </View>

      {/* CONTENT */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
          {/* Barber Search */}
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
            Select Barber (optional)
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 10,
              paddingHorizontal: 10,
              marginBottom: 10,
            }}
          >
            <Ionicons name="search-outline" size={18} color="#666" />
            <TextInput
              placeholder="Search barber..."
              style={{ flex: 1, marginLeft: 8 }}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <FlatList
            data={visibleBarbers}
            horizontal
            keyExtractor={(b) => b.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  setSelectedBarber(selectedBarber?.id === item.id ? null : item)
                }
                style={{

                  
                  width: 95,
                  height: 120,
                  marginRight: 12,
                  borderWidth: selectedBarber?.id === item.id ? 2 : 1,
                  borderColor:
                    selectedBarber?.id === item.id ? colors.primary : "#ddd",
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={{
                    uri:
                      item.photoUrl ||
                      "https://cdn-icons-png.flaticon.com/512/194/194938.png",
                  }}
                  style={{ width: 60, height: 60, borderRadius: 30 }}
                />
                <Text
                  style={{
                    marginTop: 5,
                    fontWeight: "700",
                    color: selectedBarber?.id === item.id ? colors.primary : "#333",
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* Auto Slots */}
          <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 6 }}>
            Auto Slots (Today, 45 mins)
          </Text>
          <Text style={{ fontSize: 12, color: "#777", marginBottom: 8 }}>
            Showing up to first 13 slots from next available 45-minute block until 10:00 PM
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 10 }}>
            {displayedSlots.length === 0 ? (
              <Text style={{ color: "#999" }}>No auto slots available.</Text>
            ) : (
              displayedSlots.map((slot) => {
                const active = selectedAutoSlotId === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    onPress={() => setSelectedAutoSlotId(active ? null : slot.id)}
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
                    <Text style={{ fontWeight: "700", fontSize: 12, textAlign: "center", color: active ? "#fff" : colors.primary }}>
                      {slot.fromTime}
                    </Text>
                    <Text style={{ fontSize: 11, color: active ? "#fff" : "#555", marginTop: 2 }}>
                      {slot.toTime}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Custom Slot */}
          <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 8 }}>
            OR Custom Slot
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
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
              <Text style={{ color: "#555" }}>
                From: <Text style={{ fontWeight: "700" }}>{customFrom || "Select"}</Text>
              </Text>
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
              <Text style={{ color: "#555" }}>
                To: <Text style={{ fontWeight: "700" }}>{customTo || "Select"}</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <View style={{ marginTop: 24 }}>
            <TouchableOpacity
              onPress={handleSaveSpotPayment}
              style={{
                backgroundColor: colors.primary,
                padding: 14,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "700" }}>Save Spot Booking</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <CustomTimePicker
        visible={pickerMode !== null}
        initialTime={defaultInitialTime}
        onConfirm={handleTimePicked}
        onClose={() => setPickerMode(null)}
      />

      <ShopOwnerBottomNav />
    </View>
  );
}
