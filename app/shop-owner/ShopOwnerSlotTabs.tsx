import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

import app from "../../src/firebase/firebaseConfig"; // ✅ <<--- THIS LINE IS MANDATORY
import { colors } from "../../styles/theme"; // ✅ fixed path for styles
import SlotList from "./SlotList";
import SlotCreate from "./SlotManagement";

export default function ShopOwnerSlotTabs() {
  const [activeTab, setActiveTab] = useState("Create Slot");
  const [auth, setAuth] = useState<any>(null);

  // ✅ Initialize Firebase Auth safely inside useEffect
  useEffect(() => {
    try {
      let authInstance;
      if (Platform.OS === "web") {
        authInstance = getAuth(app);
      } else {
        try {
          authInstance = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
          });
        } catch {
          authInstance = getAuth(app); // fallback if already initialized
        }
      }
      setAuth(authInstance);
    } catch (error) {
      console.error("Firebase Auth init error:", error);
    }
  }, []);

  if (!auth) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
        }}
      >
        <Text>Loading Firebase...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      {/* 🔹 Tabs */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        {["Create Slot", "Slot List"].map((tab) => {
          const active = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                alignItems: "center",
                padding: 12,
                marginHorizontal: 4,
                borderRadius: 8,
                backgroundColor: active ? colors.primary : colors.cardBg,
              }}
            >
              <Text
                style={{
                  color: active ? colors.background : colors.textLight,
                  fontWeight: "600",
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 🔹 Tab Content */}
      {activeTab === "Create Slot" ? (
        <SlotCreate onSwitchTab={() => setActiveTab("Slot List")} />
      ) : (
        <SlotList />
      )}
    </View>
  );
}
