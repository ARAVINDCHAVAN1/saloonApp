// app/shop-owner/_layout.tsx
import { Stack } from "expo-router";

export default function ShopOwnerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShopOwnerDashboard" />
      <Stack.Screen name="ShopOwnerStaffTabs" />
      <Stack.Screen name="ShopOwnerAddBarber" />
      <Stack.Screen name="StaffList" />
    </Stack>
  );
}
