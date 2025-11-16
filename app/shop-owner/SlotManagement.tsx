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
import React, { useEffect, useState } from "react";
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
}

export default function SlotCreate({ onSwitchTab }: { onSwitchTab: () => void }) {
  const [salonId, setSalonId] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string | null>(null);
  const [barberName, setBarberName] = useState<string>("Select Barber");
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [date, setDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  const [fromTime, setFromTime] = useState<string>("09:00 AM");
  const [toTime, setToTime] = useState<string>("09:30 AM");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [note, setNote] = useState("");
  const [daySlots, setDaySlots] = useState<Slot[]>([]);
  const [onLeave, setOnLeave] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState("");

  // 🔹 Load initial salon & barbers
  useEffect(() => {
    const init = async () => {
      const sid = await AsyncStorage.getItem("shopId");
      setSalonId(sid);
      if (sid) loadBarbers(sid);
      generateDays(new Date());
    };
    init();
  }, []);

  // 🔹 Generate 4 days centered on selected date
  const generateDays = (baseDate: Date) => {
    const start = new Date(baseDate);
    start.setDate(baseDate.getDate() - 1);
    const days: Date[] = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    setWeekDates(days);
  };

  // 🔹 Move window left/right by 4 days
  const moveDays = (direction: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + direction * 4);
    setDate(newDate);
    generateDays(newDate);
  };

  // 🔹 Load barbers
  const loadBarbers = async (sid: string) => {
    const q = query(collection(db, "barbers"), where("salonId", "==", sid));
    const snap = await getDocs(q);
    setBarbers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Barber)));
  };

  // 🔹 Load slots for selected date
  const loadDaySlots = async (bid: string | null, date: Date) => {
    const formatted = date.toDateString();
    const q = bid
      ? query(
          collection(db, "slots"),
          where("barberId", "==", bid),
          where("date", "==", formatted)
        )
      : query(
          collection(db, "slots"),
          where("salonId", "==", salonId),
          where("barberId", "==", null),
          where("date", "==", formatted)
        );

    const snap = await getDocs(q);
    const slots = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Slot));
    setDaySlots(slots);
  };

  // 🔹 Check leave / weekly off
  const checkLeave = async (bid: string, date: Date) => {
    setOnLeave(false);
    setLeaveMessage("");

    const currentDay = date.getDay();
    const formatted = date.toDateString();

    if (currentDay === 2) {
      setOnLeave(true);
      setLeaveMessage("❌ Tuesday is a weekly off day. Slots cannot be created.");
      setDaySlots([]);
      return;
    }

    const q = query(
      collection(db, "leaves"),
      where("barberId", "==", bid),
      where("date", "==", formatted),
      where("status", "in", ["Approved", "Permission"])
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const data = snap.docs[0].data();
      const reason = data.reason || "No reason provided";
      setOnLeave(true);
      setLeaveMessage(
        `⚠️ ${barberName} is on ${data.type || "Leave"}.\nReason: ${reason}`
      );
      setDaySlots([]);
    } else {
      setOnLeave(false);
      setLeaveMessage("");
      loadDaySlots(bid, date);
    }
  };

  // 🔹 Add new slot
  const addSlot = async () => {
    if (onLeave)
      return Alert.alert("⚠️ Cannot create slot today — barber unavailable.");

    const formattedDate = date.toDateString();
    const q = barberId
      ? query(
          collection(db, "slots"),
          where("barberId", "==", barberId),
          where("date", "==", formattedDate),
          where("fromTime", "==", fromTime)
        )
      : query(
          collection(db, "slots"),
          where("salonId", "==", salonId),
          where("barberId", "==", null),
          where("date", "==", formattedDate),
          where("fromTime", "==", fromTime)
        );

    const snap = await getDocs(q);
    if (!snap.empty)
      return Alert.alert("⚠️ A slot already exists for this time!");

    const newSlot = {
      salonId: salonId || "global",
      barberId: barberId || null,
      barberName: barberName !== "Select Barber" ? barberName : "General Slot",
      date: formattedDate,
      fromTime,
      toTime,
      note,
      status: "available",
      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, "slots"), newSlot);
    Alert.alert("✅ Slot created successfully!");
    setNote("");
    loadDaySlots(barberId, date);
  };

  useEffect(() => {
    if (barberId) checkLeave(barberId, date);
    else if (salonId) {
      setOnLeave(false);
      setLeaveMessage("");
      loadDaySlots(null, date);
    }
  }, [barberId, date]);

  // 🔹 Time pickers
  const handleFromConfirm = (time: Date) => {
    const timeStr = time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    setFromTime(timeStr);
    const next = new Date(time.getTime() + 30 * 60000);
    const nextStr = next.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    setToTime(nextStr);
    setShowFromPicker(false);
  };

  const handleToConfirm = (time: Date) => {
    const timeStr = time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    setToTime(timeStr);
    setShowToPicker(false);
  };

  const monthName = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={serviceStyles.title}>🕒 Slot Management</Text>

      {/* Barber Dropdown */}
      <Text style={{ color: colors.textLight, marginBottom: 6 }}>
        Select Barber (optional)
      </Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 10,
          marginBottom: 10,
          backgroundColor: "#fff",
        }}
      >
        <Picker
          selectedValue={barberId}
          onValueChange={(value) => {
            setBarberId(value);
            const selected = barbers.find((b) => b.id === value);
            if (selected) setBarberName(selected.name);
            else {
              setBarberName("Select Barber");
              setOnLeave(false);
              setLeaveMessage("");
              loadDaySlots(null, date);
            }
          }}
          dropdownIconColor={colors.primary}
        >
          <Picker.Item label="-- General Slot (No Barber) --" value={null} />
          {barbers.map((b) => (
            <Picker.Item key={b.id} label={b.name} value={b.id} />
          ))}
        </Picker>
      </View>

      {/* 🗓️ Month-Year Heading */}
      <Text
        style={{
          textAlign: "center",
          fontSize: 18,
          fontWeight: "700",
          color: colors.primary,
          marginBottom: 8,
        }}
      >
        {monthName} {year}
      </Text>

      {/* 📅 Date Strip */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          marginTop: 8,
        }}
      >
        {/* Left Arrow */}
        <TouchableOpacity
          onPress={() => moveDays(-1)}
          style={{
            paddingHorizontal: 18, // added spacing
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name="chevron-left" size={36} color={colors.primary || "#FFD700"} />
        </TouchableOpacity>

        {/* Date Boxes */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          }}
        >
          {weekDates.map((d, i) => {
            const isSelected = d.toDateString() === date.toDateString();
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setDate(d)}
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 10,
                  backgroundColor: isSelected ? colors.primary : "#fff",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: isSelected ? colors.primary : "#ccc",
                }}
              >
                <Text
                  style={{
                    color: isSelected ? "#000" : "#000",
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  {d.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right Arrow */}
        <TouchableOpacity
          onPress={() => moveDays(1)}
          style={{
            paddingHorizontal: 18,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name="chevron-right" size={36} color={colors.primary || "#FFD700"} />
        </TouchableOpacity>
      </View>

      {/* Leave Message */}
      {onLeave && (
        <View
          style={{
            backgroundColor: "#ffe5e5",
            borderLeftWidth: 6,
            borderLeftColor: "#ff4d4d",
            padding: 10,
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: "#b30000", fontWeight: "bold" }}>
            {leaveMessage}
          </Text>
        </View>
      )}

      {/* Time Inputs */}
      <TouchableOpacity
        style={serviceStyles.input}
        onPress={() => setShowFromPicker(true)}
      >
        <Text style={{ color: "#000" }}>🕒 From: {fromTime}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={serviceStyles.input}
        onPress={() => setShowToPicker(true)}
      >
        <Text style={{ color: "#000" }}>⏰ To: {toTime}</Text>
      </TouchableOpacity>

      {/* Time Pickers */}
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

      {/* Note Input */}
      <TextInput
        placeholder="Add a message or note (optional)"
        placeholderTextColor={colors.placeholder}
        style={[serviceStyles.input, { height: 90, textAlignVertical: "top" }]}
        value={note}
        onChangeText={setNote}
        multiline
      />

      <TouchableOpacity
        style={[serviceStyles.submitButton, { opacity: onLeave ? 0.5 : 1 }]}
        disabled={onLeave}
        onPress={addSlot}
      >
        <Text style={serviceStyles.submitButtonText}>Add Slot</Text>
      </TouchableOpacity>

      {/* Slots */}
      {daySlots.length > 0 && (
        <View style={{ marginTop: 25 }}>
          <Text style={[serviceStyles.title, { marginBottom: 8 }]}>
            📋 Slots on {date.toDateString()}
          </Text>
          {daySlots.map((slot, i) => (
            <View
              key={i}
              style={{
                backgroundColor: "#fff",
                padding: 12,
                borderRadius: 10,
                marginBottom: 10,
                elevation: 2,
              }}
            >
              <Text style={{ fontWeight: "600", color: "#000" }}>
                {slot.fromTime} - {slot.toTime}
              </Text>
              <Text style={{ color: "#666" }}>
                Barber: {slot.barberName || "General"}
              </Text>
              <Text style={{ color: colors.textLight }}>
                Status: {slot.status}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
