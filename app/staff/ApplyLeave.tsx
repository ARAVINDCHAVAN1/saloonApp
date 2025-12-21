// app/staff/ApplyLeave.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";

// ADDED
import BarberHeader from "./BarberHeader";
import BarberBottomNav from "./BarberBottomNav";
import LeftMenu from "./LeftMenu";

export default function ApplyLeave() {
  const [tab, setTab] = useState<"apply" | "list">("apply");
  const [type, setType] = useState<"Leave" | "Permission">("Leave");

  const [date, setDate] = useState(new Date());
  const [fromTime, setFromTime] = useState(new Date());
  const [toTime, setToTime] = useState(new Date());

  const [showPicker, setShowPicker] = useState<
    null | "date" | "from" | "to"
  >(null);

  const [reason, setReason] = useState("");

  const [requests, setRequests] = useState<any[]>([]);
  const [barberId, setBarberId] = useState("");
  const [salonId, setSalonId] = useState("");

  // LEFT MENU
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

  // Load data
  useEffect(() => {
    const load = async () => {
      const bId = (await AsyncStorage.getItem("barberId")) || "";
      const sId = (await AsyncStorage.getItem("salonId")) || "";

      setBarberId(bId);
      setSalonId(sId);

      if (bId) {
        const q = query(
          collection(db, "leaves"),
          where("barberId", "==", bId)
        );

        const unsub = onSnapshot(q, (snap) => {
          const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setRequests(arr);
        });

        return unsub;
      }
    };
    load();
  }, []);

  // Picker
  const onChangeDate = (e: any, selected?: Date) => {
    if (!selected) {
      setShowPicker(null);
      return;
    }

    if (showPicker === "date") setDate(selected);
    if (showPicker === "from") setFromTime(selected);
    if (showPicker === "to") setToTime(selected);

    setShowPicker(null);
  };

  // Submit leave
  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert("Please enter reason");
      return;
    }

    try {
      const obj: any = {
        barberId,
        salonId,
        type,
        reason,
        status: "Waiting for Approval",
        createdAt: new Date(),
      };

      if (type === "Leave") {
        obj.date = date.toDateString();
      } else {
        obj.date = date.toDateString();
        obj.fromTime = fromTime.toLocaleTimeString();
        obj.toTime = toTime.toLocaleTimeString();
      }

      await addDoc(collection(db, "leaves"), obj);

      setReason("");
      alert("Request Submitted!");
    } catch (err) {
      console.log(err);
      alert("Error submitting");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* HEADER */}
      <BarberHeader openMenu={openMenu} />

      {/* TABS */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 20,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: tab === "apply" ? colors.primary : "#333",
            padding: 10,
            borderRadius: 8,
            marginRight: 10,
          }}
          onPress={() => setTab("apply")}
        >
          <Text style={{ color: "#000", fontWeight: "bold" }}>
            Apply Leave
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: tab === "list" ? colors.primary : "#333",
            padding: 10,
            borderRadius: 8,
          }}
          onPress={() => setTab("list")}
        >
          <Text style={{ color: "#000", fontWeight: "bold" }}>
            Leaves Applied
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= APPLY FORM ================= */}
      {tab === "apply" && (
        <View style={{ flex: 1 }}>
          {/* Type buttons */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor:
                  type === "Leave" ? colors.primary : "#333",
                padding: 10,
                borderRadius: 8,
                marginRight: 10,
              }}
              onPress={() => setType("Leave")}
            >
              <Text style={{ color: "#000", fontWeight: "bold" }}>
                Leave
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor:
                  type === "Permission" ? colors.primary : "#333",
                padding: 10,
                borderRadius: 8,
              }}
              onPress={() => setType("Permission")}
            >
              <Text style={{ color: "#000", fontWeight: "bold" }}>
                Permission
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date */}
          <TouchableOpacity
            style={{
              margin: 16,
              padding: 12,
              backgroundColor: "#222",
              borderRadius: 8,
            }}
            onPress={() => setShowPicker("date")}
          >
            <Text style={{ color: "#fff" }}>
              📅 {date.toDateString()}
            </Text>
          </TouchableOpacity>

          {/* Time slot if Permission */}
          {type === "Permission" && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginHorizontal: 16,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  marginRight: 8,
                  backgroundColor: "#222",
                  borderRadius: 8,
                }}
                onPress={() => setShowPicker("from")}
              >
                <Text style={{ color: "#fff" }}>
                  🕒 From: {fromTime.toLocaleTimeString()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  marginLeft: 8,
                  backgroundColor: "#222",
                  borderRadius: 8,
                }}
                onPress={() => setShowPicker("to")}
              >
                <Text style={{ color: "#fff" }}>
                  🕒 To: {toTime.toLocaleTimeString()}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {showPicker && (
            <DateTimePicker
              value={
                showPicker === "date"
                  ? date
                  : showPicker === "from"
                  ? fromTime
                  : toTime
              }
              mode={showPicker === "date" ? "date" : "time"}
              onChange={onChangeDate}
              minimumDate={new Date()}
            />
          )}

          {/* Reason input */}
          <TextInput
            placeholder="Enter reason..."
            placeholderTextColor="#777"
            style={{
              backgroundColor: "#222",
              padding: 12,
              marginHorizontal: 16,
              marginTop: 10,
              color: "#fff",
              borderRadius: 8,
            }}
            value={reason}
            onChangeText={setReason}
          />

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: colors.primary,
              margin: 16,
              padding: 14,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "bold", color: "#000" }}>
              Submit
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ================= LEAVES LIST ================= */}
      {tab === "list" && (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 130 }}
          ListEmptyComponent={
            <Text
              style={{
                color: "#fff",
                textAlign: "center",
                marginTop: 20,
              }}
            >
              No leave requests yet.
            </Text>
          }
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "#111",
                padding: 12,
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                {item.type} - {item.date}
              </Text>

              {item.fromTime && item.toTime && (
                <Text style={{ color: "#ccc" }}>
                  ⏰ {item.fromTime} - {item.toTime}
                </Text>
              )}

              <Text style={{ color: "#fff" }}>
                Reason: {item.reason}
              </Text>

              <Text
                style={{
                  color:
                    item.status === "Approved"
                      ? "lightgreen"
                      : item.status === "Rejected"
                      ? "red"
                      : "orange",
                }}
              >
                Status: {item.status}
              </Text>
            </View>
          )}
        />
      )}

      {/* FOOTER */}
      <BarberBottomNav />

      {/* LEFT MENU */}
      <LeftMenu visible={menuVisible} slide={slide} closeMenu={closeMenu} />
    </View>
  );
}
