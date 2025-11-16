import { Stack } from "expo-router";
import React from "react";

export default function StaffLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none", // Prevent flicker transitions
      }}
    >
      <Stack.Screen name="BarberDashboard" />
      <Stack.Screen name="BarberProfile" />
      <Stack.Screen name="ApplyLeave" />
      <Stack.Screen name="MySlots" />
    </Stack>
  );
}
