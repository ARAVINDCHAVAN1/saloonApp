// app/shop-owner/ShopOwnerDashboard.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createDrawerNavigator } from "@react-navigation/drawer";
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

const Drawer = createDrawerNavigator();

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
    <Drawer.Navigator
      screenOptions={{
        header: () => <ShopOwnerHeader />,
        drawerActiveTintColor: colors.primary,
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={ScreenWrapper(ShopOwnerHome)}
        options={{ title: "Dashboard" }}
      />
      <Drawer.Screen name="Profile" component={ScreenWrapper(ShopOwnerProfile)} />
      <Drawer.Screen
        name="Staff"
        component={ScreenWrapper(ShopOwnerStaffTabs)}
        options={{ title: "Manage Staff" }}
      />
      <Drawer.Screen name="Services" component={ScreenWrapper(ShopOwnerServicesTabs)} />
      <Drawer.Screen name="Slot" component={ScreenWrapper(ShopOwnerSlotTabs)} />
      <Drawer.Screen name="Gallery" component={ScreenWrapper(ShopOwnerGallery)} />
      <Drawer.Screen name="Leaves" component={ScreenWrapper(LeavesApproval)} />
      <Drawer.Screen name="Bookings" component={ScreenWrapper(ShopOwnerBookings)} />
    </Drawer.Navigator>
  );
}
