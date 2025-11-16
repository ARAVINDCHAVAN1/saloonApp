import { deactivateKeepAwake } from "expo-keep-awake";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";

export default function CustomerLayout() {
  useEffect(() => {
    // 🧩 Fix "Unable to activate keep awake" issue in Expo dev mode
    if (__DEV__) {
      try {
        deactivateKeepAwake();
        console.log("✅ KeepAwake disabled in dev mode");
      } catch (error) {
        console.warn("⚠️ Failed to deactivate keep awake:", error);
      }
    }
  }, []);

  return (
    <>
      {/* ✅ Customer Stack Navigation */}
      <Stack
        screenOptions={{
          headerShown: false, // hide default Expo Router headers
        }}
      />

      {/* ✅ Global Toast Container for all pages */}
      <Toast position="bottom" visibilityTime={2500} />
    </>
  );
}
