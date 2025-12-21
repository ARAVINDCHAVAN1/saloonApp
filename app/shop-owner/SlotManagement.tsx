import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { db } from "../../src/firebase/firebaseConfig";
import { colors, serviceStyles } from "../../styles/theme";
import CustomTimePicker from "./CustomTimePicker";

/* ---------------- HELPERS ---------------- */

const toMinutes = (time12: string): number => {
  if (!time12) return 0;
  const [t, mer] = time12.split(" ");
  let [h, m] = t.split(":").map(Number);
  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  return h * 60 + m;
};

const isPastTime = (date: Date, time: string) => {
  const today = new Date();
  if (date.toDateString() !== today.toDateString()) return false;
  return toMinutes(time) <= today.getHours() * 60 + today.getMinutes();
};

/* ---------------- TYPES ---------------- */

interface Barber {
  id: string;
  name: string;
}

interface Slot {
  id?: string;
  fromTime: string;
  toTime: string;
  barberName?: string;
  status?: string;
}

/* ---------------- COMPONENT ---------------- */

export default function SlotCreate() {
  const [salonId, setSalonId] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);

  const [date, setDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  const [fromTime, setFromTime] = useState("09:00 AM");
  const [toTime, setToTime] = useState("09:45 AM");
  const [pickerMode, setPickerMode] = useState<"from" | "to" | null>(null);

  const [note, setNote] = useState("");
  const [adminAutoSlots, setAdminAutoSlots] = useState<Slot[]>([]);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    (async () => {
      const sid = await AsyncStorage.getItem("shopId");
      setSalonId(sid);

      if (sid) {
        loadBarbers(sid);
        loadAutoSlots(new Date(), sid);
      }

      generateWeekDates(new Date());
    })();
  }, []);

  /* ---------------- BARBERS ---------------- */

  const loadBarbers = async (sid: string) => {
    const snap = await getDocs(
      query(collection(db, "barbers"), where("salonId", "==", sid))
    );
    setBarbers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  };

  /* ---------------- WEEK DATES ---------------- */

  const generateWeekDates = (base: Date) => {
    const arr: Date[] = [];
    for (let i = -1; i < 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      arr.push(d);
    }
    setWeekDates(arr);
  };

  /* ---------------- LOAD AUTO SLOTS ---------------- */

  const loadAutoSlots = async (dt: Date, sid = salonId) => {
    if (!sid) return;

    const snap = await getDocs(
      query(
        collection(db, "slots"),
        where("salonId", "==", sid),
        where("date", "==", dt.toDateString()),
        where("isAdminAutoSlot", "==", true)
      )
    );

    const items = snap.docs.map(
      (d) => ({ id: d.id, ...(d.data() as any) } as Slot)
    );

    items.sort((a, b) => toMinutes(a.fromTime) - toMinutes(b.fromTime));
    setAdminAutoSlots(items);
  };

  useEffect(() => {
    if (salonId) loadAutoSlots(date);
  }, [date, salonId]);

  /* ---------------- ADD SLOT ---------------- */

  const addSlot = async () => {
    if (!salonId) return;

    if (isPastTime(date, fromTime)) {
      return Alert.alert("Invalid Time", "Past slot creation is not allowed");
    }

    await addDoc(collection(db, "slots"), {
      salonId,
      barberId,
      barberName: barberId
        ? barbers.find((b) => b.id === barberId)?.name
        : "General",
      date: date.toDateString(),
      fromTime,
      toTime,
      note,
      isAdminAutoSlot: true,
      status: "available",
      createdAt: new Date().toISOString(),
    });

    Alert.alert("Success", "Slot added");
    setNote("");
    loadAutoSlots(date);
  };

  /* ---------------- DISABLE SLOT (NOT DELETE) ---------------- */

  const disableSlot = async (id: string) => {
    Alert.alert("Disable Slot?", "This slot will be unavailable", [
      { text: "Cancel" },
      {
        text: "Disable",
        style: "destructive",
        onPress: async () => {
          await updateDoc(doc(db, "slots", id), {
            status: "unavailable",
            updatedAt: new Date().toISOString(),
          });
          loadAutoSlots(date);
        },
      },
    ]);
  };

  /* ---------------- SAVE EDIT ---------------- */

  const saveEdit = async () => {
    if (!editingSlot?.id) return;

    if (isPastTime(date, fromTime)) {
      return Alert.alert("Invalid Time", "Cannot edit past slot");
    }

    await updateDoc(doc(db, "slots", editingSlot.id), {
      fromTime,
      toTime,
      updatedAt: new Date().toISOString(),
    });

    Alert.alert("Updated", "Slot updated");
    setEditModalVisible(false);
    setEditingSlot(null);
    loadAutoSlots(date);
  };

  const formattedDateLabel = useMemo(() => date.toDateString(), [date]);

  /* ---------------- UI ---------------- */

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <Text style={serviceStyles.title}>🕒 Slot Management</Text>

      <Text style={{ textAlign: "center", fontWeight: "700" }}>
        {formattedDateLabel}
      </Text>

      {/* BARBER DROPDOWN */}
      <View style={[serviceStyles.input, { padding: 0 }]}>
        <Picker selectedValue={barberId} onValueChange={setBarberId}>
          <Picker.Item label="-- General Slot --" value={null} />
          {barbers.map((b) => (
            <Picker.Item key={b.id} label={b.name} value={b.id} />
          ))}
        </Picker>
      </View>

      {/* DATE STRIP */}
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        {weekDates.map((d, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setDate(d)}
            style={{
              width: 55,
              height: 55,
              marginHorizontal: 4,
              borderRadius: 10,
              backgroundColor:
                d.toDateString() === date.toDateString()
                  ? colors.primary
                  : "#fff",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
            }}
          >
            <Text style={{ fontWeight: "700" }}>{d.getDate()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* AUTO SLOTS */}
      <Text style={{ fontSize: 18, fontWeight: "700", marginVertical: 12 }}>
        Auto Slots
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {adminAutoSlots.map((s) => {
          const expired =
            s.status === "unavailable" || isPastTime(date, s.fromTime);

          return (
            <View
              key={s.id}
              style={{
                width: "48%",
                margin: "1%",
                padding: 10,
                borderRadius: 12,
                borderWidth: 1,
                backgroundColor: "#fff",
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  color: expired ? "#999" : "#000",
                  textDecorationLine: expired ? "line-through" : "none",
                }}
              >
                {s.fromTime} – {s.toTime}
              </Text>

              {expired && (
                <Text style={{ fontSize: 11, color: "red" }}>
                  {s.status === "unavailable" ? "UNAVAILABLE" : "EXPIRED"}
                </Text>
              )}

              {!expired && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setEditingSlot(s);
                      setFromTime(s.fromTime);
                      setToTime(s.toTime);
                      setEditModalVisible(true);
                    }}
                  >
                    <Icon name="pencil" size={18} color={colors.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => disableSlot(s.id!)}>
                    <Icon name="delete" size={18} color="red" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* TIME PICKERS */}
      <TouchableOpacity
        style={serviceStyles.input}
        onPress={() => setPickerMode("from")}
      >
        <Text>From: {fromTime}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={serviceStyles.input}
        onPress={() => setPickerMode("to")}
      >
        <Text>To: {toTime}</Text>
      </TouchableOpacity>

      <CustomTimePicker
        visible={pickerMode !== null}
        initialTime={pickerMode === "from" ? fromTime : toTime}
        onConfirm={(v) => {
          pickerMode === "from" ? setFromTime(v) : setToTime(v);
          setPickerMode(null);
        }}
        onClose={() => setPickerMode(null)}
      />

      <TextInput
        placeholder="Note (optional)"
        value={note}
        onChangeText={setNote}
        style={[serviceStyles.input, { height: 80 }]}
        multiline
      />

      <TouchableOpacity
        style={[
          serviceStyles.submitButton,
          isPastTime(date, fromTime) && { backgroundColor: "#aaa" },
        ]}
        disabled={isPastTime(date, fromTime)}
        onPress={addSlot}
      >
        <Text style={serviceStyles.submitButtonText}>Add Slot</Text>
      </TouchableOpacity>

      {/* EDIT MODAL */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>Edit Slot</Text>

            <TouchableOpacity
              style={serviceStyles.input}
              onPress={() => setPickerMode("from")}
            >
              <Text>From: {fromTime}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={serviceStyles.input}
              onPress={() => setPickerMode("to")}
            >
              <Text>To: {toTime}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={serviceStyles.submitButton}
              onPress={saveEdit}
            >
              <Text style={serviceStyles.submitButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setEditModalVisible(false)}
              style={{ marginTop: 10, alignItems: "center" }}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
