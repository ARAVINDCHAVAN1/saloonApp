// app/shop-owner/ShopOwnerDashboard.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { colors } from "../../styles/theme";

// Screens
import LeavesApproval from "./LeavesApproval";
import ShopOwnerBookings from "./ShopOwnerBookings";
import ShopOwnerBottomNav from "./ShopOwnerBottomNav";
import ShopOwnerGallery from "./ShopOwnerGallery";
import ShopOwnerHeader from "./ShopOwnerHeader";
import ShopOwnerHome from "./ShopOwnerHome";
import ShopOwnerProfile from "./ShopOwnerProfile";
import ShopOwnerServicesTabs from "./ShopOwnerServicesTabs";
import ShopOwnerSlotTabs from "./ShopOwnerSlotTabs";
import ShopOwnerStaffTabs from "./ShopOwnerStaffTabs";

const Stack = createNativeStackNavigator();

const ScreenWrapper = (Component: any) => {
  return function WrappedScreen(props: any) {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingBottom: 75 }}>
          <Component {...props} />
        </View>
        <ShopOwnerBottomNav />
      </View>
    );
  };
};

export default function ShopOwnerDashboard() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const sid = await AsyncStorage.getItem("shopId");
      if (!sid) router.replace("/shop-owner/ShopOwnerLoginScreen");
      setIsChecking(false);
    };
    checkLogin();
  }, []);

  if (isChecking) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <ShopOwnerHeader />,
      }}
    >
      <Stack.Screen
        name="Home"
        component={ScreenWrapper(ShopOwnerHome)}
        options={{ title: "Dashboard" }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ScreenWrapper(ShopOwnerProfile)} 
        options={{ title: "Profile" }}
      />
      <Stack.Screen
        name="Staff"
        component={ScreenWrapper(ShopOwnerStaffTabs)}
        options={{ title: "Manage Staff" }}
      />
      <Stack.Screen 
        name="Services" 
        component={ScreenWrapper(ShopOwnerServicesTabs)} 
        options={{ title: "Services" }}
      />
      <Stack.Screen 
        name="Slot" 
        component={ScreenWrapper(ShopOwnerSlotTabs)} 
        options={{ title: "Time Slots" }}
      />
      <Stack.Screen 
        name="Gallery" 
        component={ScreenWrapper(ShopOwnerGallery)} 
        options={{ title: "Gallery" }}
      />
      <Stack.Screen 
        name="Leaves" 
        component={ScreenWrapper(LeavesApproval)} 
        options={{ title: "Leave Approval" }}
      />
      <Stack.Screen 
        name="Bookings" 
        component={ScreenWrapper(ShopOwnerBookings)} 
        options={{ title: "Bookings" }}
      />
    </Stack.Navigator>
  );
}