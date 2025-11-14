import AsyncStorage from "@react-native-async-storage/async-storage";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { colors } from "../../styles/theme";

import ApplyLeave from "./ApplyLeave";
import Appointments from "./Appointments";
import BarberBottomNav from "./BarberBottomNav";
import BarberHeader from "./BarberHeader";
import BarberHome from "./BarberHome";
import BarberProfile from "./BarberProfile";
import MySlots from "./MySlots";

const Drawer = createDrawerNavigator();

const ScreenWrapper = (Component: any) => {
  return function WrappedScreen(props: any) {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingBottom: 75 }}>
          <Component {...props} />
        </View>
        <BarberBottomNav />
      </View>
    );
  };
};

export default function BarberDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem("barberId");
      if (!id) router.replace("/staff/BarberLogin");
      setLoading(false);
    })();
  }, []);

  if (loading) {
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
        header: () => <BarberHeader />,
        drawerActiveTintColor: colors.primary,
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      <Drawer.Screen name="Home" component={ScreenWrapper(BarberHome)} />
      <Drawer.Screen name="My Slots" component={ScreenWrapper(MySlots)} />
      <Drawer.Screen name="Appointments" component={ScreenWrapper(Appointments)} />
      <Drawer.Screen name="Apply Leave" component={ScreenWrapper(ApplyLeave)} />
      <Drawer.Screen name="Profile" component={ScreenWrapper(BarberProfile)} />
    </Drawer.Navigator>
  );
}
