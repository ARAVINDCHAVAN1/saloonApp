// app/shop-owner/CustomTimePicker.tsx
import React, { useState } from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../styles/theme";

interface Props {
  visible: boolean;
  initialTime: string | undefined;
  onClose: () => void;
  onConfirm: (time: string) => void;
}

export default function CustomTimePicker({
  visible,
  initialTime,
  onClose,
  onConfirm,
}: Props) {

  // ---------------- SAFE DEFAULT ----------------
  const safeTime = initialTime && initialTime.includes(":")
    ? initialTime
    : "09:00 AM";  

  const [h, setH] = useState(safeTime.split(":")[0]);
  const [m, setM] = useState(safeTime.split(":")[1].split(" ")[0]);
  const [p, setP] = useState(safeTime.includes("AM") ? "AM" : "PM");

  // Hours: 01–12
  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  // Minutes 00–59
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  const periods = ["AM", "PM"];

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", textAlign: "center" }}>
            Select Time
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              marginVertical: 20,
            }}
          >
            {/* HOURS */}
            <FlatList
              data={hours}
              keyExtractor={(item) => item}
              style={{ height: 200 }}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setH(item)}>
                  <Text
                    style={{
                      padding: 10,
                      fontSize: 20,
                      color: h === item ? colors.primary : "#444",
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {/* MINUTES */}
            <FlatList
              data={minutes}
              keyExtractor={(item) => item}
              style={{ height: 200 }}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setM(item)}>
                  <Text
                    style={{
                      padding: 10,
                      fontSize: 20,
                      color: m === item ? colors.primary : "#444",
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {/* PERIODS */}
            <FlatList
              data={periods}
              keyExtractor={(item) => item}
              style={{ height: 200 }}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setP(item)}>
                  <Text
                    style={{
                      padding: 10,
                      fontSize: 20,
                      color: p === item ? colors.primary : "#444",
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* CONFIRM */}
          <TouchableOpacity
            onPress={() => {
              onConfirm(`${h}:${m} ${p}`);
              onClose();
            }}
            style={{
              backgroundColor: colors.primary,
              padding: 12,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: "#fff",
                textAlign: "center",
                fontWeight: "700",
              }}
            >
              Confirm
            </Text>
          </TouchableOpacity>

          {/* CANCEL */}
          <TouchableOpacity onPress={onClose} style={{ padding: 12 }}>
            <Text style={{ textAlign: "center", color: "red" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
