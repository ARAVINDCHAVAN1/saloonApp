import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { withLayoutContext } from "expo-router";
import React from "react";

const Drawer = createDrawerNavigator();
export const DrawerNavigator = withLayoutContext(Drawer.Navigator);

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="Dashboard"
        icon={({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />}
        onPress={() => props.navigation.navigate("BarberDashboard")}
      />
      <DrawerItem
        label="Apply Leave"
        icon={({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />}
        onPress={() => props.navigation.navigate("ApplyLeave")}
      />
      <DrawerItem
        label="Profile"
        icon={({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />}
        onPress={() => props.navigation.navigate("Profile")}
      />
      <DrawerItem
        label="Appointments"
        icon={({ color, size }) => <Ionicons name="clipboard-outline" size={size} color={color} />}
        onPress={() => props.navigation.navigate("Appointments")}
      />
    </DrawerContentScrollView>
  );
}

export default function StaffLayout() {
  return (
    <DrawerNavigator
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="BarberDashboard" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="ApplyLeave" options={{ title: "Apply Leave" }} />
      <Drawer.Screen name="Profile" options={{ title: "Profile" }} />
      <Drawer.Screen name="Appointments" options={{ title: "Appointments" }} />
    </DrawerNavigator>
  );
}
