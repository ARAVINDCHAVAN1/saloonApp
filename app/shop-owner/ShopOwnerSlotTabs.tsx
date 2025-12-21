import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import React, { useEffect, useState, useRef } from "react";
import {
  Platform,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ScrollView,
} from "react-native";

import app from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";

import SlotList from "./SlotList";
import SlotCreate from "./SlotManagement";

import ShopOwnerHeader from "./ShopOwnerHeader";
import ShopOwnerBottomNav from "./ShopOwnerBottomNav";
import LeftMenu from "./LeftMenu";

export default function ShopOwnerSlotTabs() {
  const [activeTab, setActiveTab] = useState("Create Slot");
  const [auth, setAuth] = useState<any>(null);

  /* ---------------- MENU ---------------- */
  const [visible, setVisible] = useState(false);
  const slide = useRef(new Animated.Value(-270)).current;

  const openMenu = () => {
    setVisible(true);
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
    }).start(() => setVisible(false));
  };

  /* ---------------- FIREBASE AUTH INIT ---------------- */
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
          authInstance = getAuth(app);
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

  /* =======================================================================================
     UI 
  ======================================================================================= */

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {/* ⭐ HEADER */}
      <ShopOwnerHeader title="Manage Slots" openMenu={openMenu} />

      {/* ⭐ TABS */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 16,
          marginTop: 12,
          marginBottom: 4,
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
                padding: 12,
                borderRadius: 8,
                marginHorizontal: 4,
                alignItems: "center",
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

      {/* ⭐ TAB CONTENT */}
      {activeTab === "Create Slot" ? (
        <ScrollView
          style={{ paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <SlotCreate onSwitchTab={() => setActiveTab("Slot List")} />
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <SlotList />
        </View>
      )}

      {/* ⭐ FOOTER NAV */}
      <ShopOwnerBottomNav />

      {/* ⭐ LEFT MENU */}
      <LeftMenu visible={visible} slide={slide} closeMenu={closeMenu} />
    </View>
  );
}
