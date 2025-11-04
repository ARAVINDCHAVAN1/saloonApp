import { deactivateKeepAwake } from "expo-keep-awake";
import { Stack } from "expo-router";
import React, { useEffect } from "react";

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
    <Stack
      screenOptions={{
        headerShown: false, // ✅ Hide default Expo headers
      }}
    />
  );
}
