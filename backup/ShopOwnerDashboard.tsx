import AsyncStorage from "@react-native-async-storage/async-storage";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import { colors } from "../styles/theme";
import LeavesApproval from "./LeavesApproval";
import ShopOwnerBookings from "./ShopOwnerBookings";
import ShopOwnerGallery from "./ShopOwnerGallery";
import ShopOwnerHeader from "./ShopOwnerHeader";
import ShopOwnerHome from "./ShopOwnerHome";
import ShopOwnerProfile from "./ShopOwnerProfile";
import ShopOwnerServicesTabs from "./ShopOwnerServicesTabs";
import ShopOwnerSlotTabs from "./ShopOwnerSlotTabs";
import ShopOwnerStaffTabs from "./ShopOwnerStaffTabs";



const Drawer = createDrawerNavigator();

export default function ShopOwnerDashboard() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const sid = await AsyncStorage.getItem("shopId");
      if (!sid) {
        // 👈 If no session, redirect to login
        router.replace("/ShopOwnerLoginScreen");
      }
      setIsChecking(false);
    };
    checkLogin();
  }, []);

  if (isChecking) {
    // ✅ Show splash loader instead of null
    return (
      <></>
    );
  }

  return (
    <Drawer.Navigator
      screenOptions={{
        header: () => <ShopOwnerHeader />, // 👈 custom header with logout
        drawerActiveTintColor: colors.primary,
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      {/* ✅ Home Page stays when logged in */}
       <Drawer.Screen name="Home" component={ShopOwnerHome} />
       <Drawer.Screen name="Profile" component={ShopOwnerProfile} />
       <Drawer.Screen name="Staff" component={ShopOwnerStaffTabs} />
       <Drawer.Screen name="Services" component={ShopOwnerServicesTabs} />
        <Drawer.Screen name="Slot" component={ShopOwnerSlotTabs} />

       <Drawer.Screen name="Gallery" component={ShopOwnerGallery} />
       <Drawer.Screen name="Leaves" component={LeavesApproval} />
              <Drawer.Screen name="Bookings" component={ShopOwnerBookings} />



  
  
    </Drawer.Navigator>


  );
}
