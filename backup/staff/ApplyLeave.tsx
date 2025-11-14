import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { addDoc, collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../../firebaseConfig";
import { colors } from "../../styles/theme";
import BarberHeader from "./BarberHeader";

export default function ApplyLeave() {
  const [tab, setTab] = useState<"apply" | "list">("apply");
  const [type, setType] = useState<"Leave" | "Permission">("Leave");
  const [date, setDate] = useState(new Date());
  const [fromTime, setFromTime] = useState(new Date());
  const [toTime, setToTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState<null | "date" | "from" | "to">(null);
  const [reason, setReason] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [barberId, setBarberId] = useState("");
  const [salonId, setSalonId] = useState("");

  // Load barber + salon from AsyncStorage
  useEffect(() => {
    const load = async () => {
      const bId = (await AsyncStorage.getItem("barberId")) || "";
      const sId = (await AsyncStorage.getItem("salonId")) || ""; // ✅ fixed key
      setBarberId(bId);
      setSalonId(sId);

      if (bId) {
        const q = query(collection(db, "leaves"), where("barberId", "==", bId));
        const unsub = onSnapshot(q, (snap) => {
          const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setRequests(data);
        });
        return unsub;
      }
    };
    load();
  }, []);

  // Handle Date/Time Picker
  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (!selectedDate) {
      setShowPicker(null);
      return;
    }
    if (showPicker === "date") setDate(selectedDate);
    if (showPicker === "from") setFromTime(selectedDate);
    if (showPicker === "to") setToTime(selectedDate);
    setShowPicker(null);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert("❌ Please enter a reason");
      return;
    }

    try {
      const newLeave: any = {
        barberId,
        salonId,
        type,
        reason,
        status: "Waiting for Approval",
        createdAt: new Date(),
      };

      if (type === "Leave") {
        newLeave.date = date.toDateString();
      } else {
        newLeave.date = date.toDateString();
        newLeave.fromTime = fromTime.toLocaleTimeString();
        newLeave.toTime = toTime.toLocaleTimeString();
      }

      await addDoc(collection(db, "leaves"), newLeave);

      setReason("");
      alert("✅ Request submitted!");
    } catch (err) {
      console.error(err);
      alert("❌ Error saving leave request");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <BarberHeader />

      {/* Tab Switch */}
      <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
        <TouchableOpacity
          style={{
            backgroundColor: tab === "apply" ? colors.primary : "#333",
            padding: 10,
            borderRadius: 8,
            marginRight: 10,
          }}
          onPress={() => setTab("apply")}
        >
          <Text style={{ color: "#000", fontWeight: "bold" }}>Apply Leave</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: tab === "list" ? colors.primary : "#333",
            padding: 10,
            borderRadius: 8,
          }}
          onPress={() => setTab("list")}
        >
          <Text style={{ color: "#000", fontWeight: "bold" }}>Leaves Applied</Text>
        </TouchableOpacity>
      </View>

      {/* ================= APPLY FORM ================= */}
      {tab === "apply" && (
        <View>
          {/* Type Selector */}
          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
            <TouchableOpacity
              style={{
                backgroundColor: type === "Leave" ? colors.primary : "#333",
                padding: 10,
                borderRadius: 8,
                marginRight: 10,
              }}
              onPress={() => setType("Leave")}
            >
              <Text style={{ color: "#000", fontWeight: "bold" }}>Leave</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: type === "Permission" ? colors.primary : "#333",
                padding: 10,
                borderRadius: 8,
              }}
              onPress={() => setType("Permission")}
            >
              <Text style={{ color: "#000", fontWeight: "bold" }}>Permission</Text>
            </TouchableOpacity>
          </View>

          {/* Date Picker */}
          <TouchableOpacity
            style={{
              margin: 16,
              padding: 12,
              backgroundColor: "#222",
              borderRadius: 8,
            }}
            onPress={() => setShowPicker("date")}
          >
            <Text style={{ color: "#fff" }}>📅 {date.toDateString()}</Text>
          </TouchableOpacity>

          {/* Permission -> Time Pickers */}
          {type === "Permission" && (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 16 }}>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, marginRight: 8, backgroundColor: "#222", borderRadius: 8 }}
                onPress={() => setShowPicker("from")}
              >
                <Text style={{ color: "#fff" }}>🕒 From: {fromTime.toLocaleTimeString()}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flex: 1, padding: 12, marginLeft: 8, backgroundColor: "#222", borderRadius: 8 }}
                onPress={() => setShowPicker("to")}
              >
                <Text style={{ color: "#fff" }}>🕒 To: {toTime.toLocaleTimeString()}</Text>
              </TouchableOpacity>
            </View>
          )}

          {showPicker && (
            <DateTimePicker
              value={showPicker === "date" ? date : showPicker === "from" ? fromTime : toTime}
              mode={showPicker === "date" ? "date" : "time"}
              display="default"
              minimumDate={new Date()} // ✅ no past dates
              onChange={onChangeDate}
            />
          )}

          {/* Reason Input */}
          <TextInput
            style={{
              backgroundColor: "#222",
              color: "#fff",
              marginHorizontal: 16,
              padding: 12,
              borderRadius: 8,
              marginTop: 10,
            }}
            placeholder="Enter reason..."
            placeholderTextColor="#777"
            value={reason}
            onChangeText={setReason}
          />

          {/* Submit */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              margin: 16,
              padding: 14,
              borderRadius: 8,
              alignItems: "center",
            }}
            onPress={handleSubmit}
          >
            <Text style={{ fontWeight: "bold", color: "#000" }}>Submit Request</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ================= LEAVE LIST ================= */}
      {tab === "list" && (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={{ color: "#fff", textAlign: "center", marginTop: 20 }}>
              No leave requests applied yet.
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
              <Text style={{ color: "#fff" }}>Reason: {item.reason}</Text>
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
    </View>
  );
}
