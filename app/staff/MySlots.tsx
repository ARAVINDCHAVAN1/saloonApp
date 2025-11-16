import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { db } from "../../src/firebase/firebaseConfig";
import { colors, serviceStyles } from "../../styles/theme";

interface Barber {
  id: string;
  name: string;
}

interface Slot {
  id?: string;
  date: string;
  fromTime: string;
  toTime: string;
  status: string;
  note?: string;
  createdBy?: string;
  barberId?: string | null;
  barberName?: string;
  createdAt?: string;
}

// ---------------- Time Helpers ----------------
const toMinutes = (time12: string): number => {
  const cleaned = time12.replace(/\u202F/g, " ").replace(/\s+/g, " ").trim();
  const [hhmm, mer] = cleaned.split(" ");
  const [hh, mm] = hhmm.split(":").map(Number);
  let h = hh;

  if (mer?.toUpperCase() === "PM" && h < 12) h += 12;
  if (mer?.toUpperCase() === "AM" && h === 12) h = 0;

  return h * 60 + (mm || 0);
};

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  Math.max(aStart, bStart) < Math.min(aEnd, bEnd);

// ------------------------------------------------

export default function SlotCreate() {
  const [role, setRole] = useState<string | null>(null);

  const [shopId, setShopId] = useState<string | null>(null);
  const [salonId, setSalonId] = useState<string | null>(null);

  const [barberId, setBarberId] = useState<string | null>(null);
  const [barberName, setBarberName] = useState("Select Barber");
  const [barbers, setBarbers] = useState<Barber[]>([]);

  const [date, setDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  const [fromTime, setFromTime] = useState("09:00 AM");
  const [toTime, setToTime] = useState("09:30 AM");

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [note, setNote] = useState("");
  const [daySlots, setDaySlots] = useState<Slot[]>([]);
  const [onLeave, setOnLeave] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState("");

  // ---------------- Initial Load ----------------
  useEffect(() => {
    const load = async () => {
      const storedRole = await AsyncStorage.getItem("role");
      const sid = await AsyncStorage.getItem("shopId");
      const salon = await AsyncStorage.getItem("salonId");
      const bId = await AsyncStorage.getItem("barberId");
      const bName = await AsyncStorage.getItem("barberName");

      setRole(storedRole);
      setShopId(sid);
      setSalonId(salon);

      if (storedRole === "barber") {
        setBarberId(bId);
        setBarberName(bName || "");
      }

      if (salon) loadBarbers(salon);
      generateDays(new Date());
    };
    load();
  }, []);

  // ---------------- Date Strip ----------------
  const generateDays = (base: Date) => {
    const start = new Date(base);
    start.setDate(start.getDate() - 1);

    const arr: Date[] = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      arr.push(d);
    }
    setWeekDates(arr);
  };

  const moveDays = (n: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + n * 4);
    setDate(newDate);
    generateDays(newDate);
  };

  // ---------------- Firestore ----------------
  const loadBarbers = async (sid: string) => {
    const q1 = query(collection(db, "barbers"), where("salonId", "==", sid));
    const snap = await getDocs(q1);
    setBarbers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  };

  const formattedDate = useMemo(() => date.toDateString(), [date]);

  const loadDaySlots = async (bId: string | null, d: Date) => {
    const f = d.toDateString();

    const q1 = bId
      ? query(collection(db, "slots"), where("barberId", "==", bId), where("date", "==", f))
      : query(
          collection(db, "slots"),
          where("salonId", "==", salonId),
          where("barberId", "==", null),
          where("date", "==", f)
        );

    const snap = await getDocs(q1);
    setDaySlots(snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })));
  };

  useEffect(() => {
    if (barberId) loadDaySlots(barberId, date);
    else if (salonId) loadDaySlots(null, date);
  }, [barberId, date]);

  // ---------------- Add Slot ----------------
  const addSlot = async () => {
    if (onLeave) {
      Alert.alert("Barber unavailable");
      return;
    }

    const f = formattedDate;

    const qExisting = barberId
      ? query(collection(db, "slots"), where("barberId", "==", barberId), where("date", "==", f))
      : query(
          collection(db, "slots"),
          where("salonId", "==", salonId),
          where("barberId", "==", null),
          where("date", "==", f)
        );

    const snap = await getDocs(qExisting);
    const existing = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

    const newStart = toMinutes(fromTime);
    const newEnd = toMinutes(toTime);

    if (!(newEnd > newStart)) {
      Alert.alert("Invalid time", "End time must be after start time.");
      return;
    }

    // check overlap
    const conflict = existing.find((s) => {
      const sStart = toMinutes(s.fromTime);
      const sEnd = toMinutes(s.toTime);
      return overlaps(newStart, newEnd, sStart, sEnd);
    });

    if (conflict) {
      Alert.alert(
        "Slot conflict",
        `A slot from ${conflict.fromTime} to ${conflict.toTime} already exists.`
      );
      return;
    }

    const createdBy = role === "barber" ? "barber" : "shopOwner";
    const createdById = role === "barber" ? barberId : shopId;

    const payload: Slot = {
      salonId,
      barberId: barberId || null,
      barberName: barberId ? barberName : "General Slot",
      date: f,
      fromTime,
      toTime,
      note,
      status: "available",
      createdAt: new Date().toISOString(),
      createdBy,
      createdById,
    };

    await addDoc(collection(db, "slots"), payload);

    Alert.alert("Slot created");
    setNote("");
    loadDaySlots(barberId, date);
  };

  // ---------------- Time Picker ----------------
  const handleFromConfirm = (time: Date) => {
    const t = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    setFromTime(t);

    // auto +30 minutes
    const next = new Date(time.getTime() + 30 * 60000);
    setToTime(
      next.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
    );

    setShowFromPicker(false);
  };

  const handleToConfirm = (time: Date) => {
    setToTime(
      time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
    );
    setShowToPicker(false);
  };

  const sortedDaySlots = useMemo(
    () => [...daySlots].sort((a, b) => toMinutes(a.fromTime) - toMinutes(b.fromTime)),
    [daySlots]
  );

  // ---------------- UI ----------------
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text
  style={[
    serviceStyles.title,
    { textAlign: "center", alignSelf: "center", width: "100%" },
  ]}
>
  🕒 Slot Management
</Text>


      {/* Shop Owner can select barber */}
      {role === "shopOwner" && (
        <>
          <Text style={{ color: colors.textLight, marginBottom: 6 }}>
            Select Barber (optional)
          </Text>

          <View
            style={{
              borderWidth: 1,
              borderColor: colors.inputBorder,
              borderRadius: 10,
              backgroundColor: "#fff",
              marginBottom: 12,
            }}
          >
            <Picker
              selectedValue={barberId}
              onValueChange={(v) => {
                setBarberId(v);
                const selected = barbers.find((b) => b.id === v);
                setBarberName(selected ? selected.name : "General Slot");
              }}
            >
              <Picker.Item label="-- General Slot --" value={null} />
              {barbers.map((b) => (
                <Picker.Item key={b.id} label={b.name} value={b.id} />
              ))}
            </Picker>
          </View>
        </>
      )}

      {/* Barber info */}
      {role === "barber" && (
        <Text style={{ marginBottom: 12, fontSize: 16, fontWeight: "600" }}>
          Logged in as: {barberName}
        </Text>
      )}

      {/* Month Title */}
      <Text
        style={{
          textAlign: "center",
          fontSize: 18,
          fontWeight: "700",
          color: colors.primary,
          marginBottom: 10,
        }}
      >
        {date.toLocaleString("en-US", { month: "long" })} {date.getFullYear()}
      </Text>

      {/* Date Strip */}
      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 20 }}>
        <TouchableOpacity onPress={() => moveDays(-1)} style={{ paddingHorizontal: 18 }}>
          <Icon name="chevron-left" size={36} color={colors.primary} />
        </TouchableOpacity>

        <View style={{ flexDirection: "row", gap: 10 }}>
          {weekDates.map((d, i) => {
            const active = d.toDateString() === date.toDateString();
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setDate(d)}
                style={{
                  width: 55,
                  height: 55,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 10,
                  backgroundColor: active ? colors.primary : "#fff",
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

      {/* Time */}
      <TouchableOpacity style={serviceStyles.input} onPress={() => setShowFromPicker(true)}>
        <Text>🕒 From: {fromTime}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={serviceStyles.input} onPress={() => setShowToPicker(true)}>
        <Text>⏰ To: {toTime}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={showFromPicker}
        mode="time"
        onConfirm={handleFromConfirm}
        onCancel={() => setShowFromPicker(false)}
      />
      <DateTimePickerModal
        isVisible={showToPicker}
        mode="time"
        onConfirm={handleToConfirm}
        onCancel={() => setShowToPicker(false)}
      />

      {/* Note */}
      <TextInput
        placeholder="Add note (optional)"
        style={[serviceStyles.input, { height: 90, textAlignVertical: "top" }]}
        value={note}
        onChangeText={setNote}
        multiline
      />

      {/* Add Slot */}
      <TouchableOpacity style={serviceStyles.submitButton} onPress={addSlot}>
        <Text style={serviceStyles.submitButtonText}>Add Slot</Text>
      </TouchableOpacity>

      {/* Slots List */}
      {sortedDaySlots.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={[serviceStyles.title, { marginBottom: 8 }]}>
            📋 Slots on {formattedDate}
          </Text>

          {sortedDaySlots.map((s) => {
            const slotDateObj = new Date(`${s.date} ${s.fromTime}`);
            const isExpired = slotDateObj.getTime() < Date.now();

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

                <Text
                  style={{
                    marginTop: 8,
                    fontWeight: "700",
                    color: isExpired ? "red" : "green",
                  }}
                >
                  {isExpired ? "Expired" : "Upcoming"}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
