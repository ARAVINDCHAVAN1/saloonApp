import { Ionicons } from "@expo/vector-icons";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { withLayoutContext } from "expo-router";
import React from "react";

const Drawer = createDrawerNavigator();
export const DrawerNavigator = withLayoutContext(Drawer.Navigator);

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      {/* Dashboard */}
      <DrawerItem
        label="Dashboard"
        icon={({ color, size }) => (
          <Ionicons name="home-outline" size={size} color={color} />
        )}
        onPress={() => props.navigation.navigate("BarberDashboard")}
      />

      {/* Apply Leave */}
      <DrawerItem
        label="Apply Leave"
        icon={({ color, size }) => (
          <Ionicons name="calendar-outline" size={size} color={color} />
        )}
        onPress={() => props.navigation.navigate("ApplyLeave")}
      />

      {/* Profile */}
      <DrawerItem
        label="Profile"
        icon={({ color, size }) => (
          <Ionicons name="person-outline" size={size} color={color} />
        )}
        onPress={() => props.navigation.navigate("BarberProfile")}
      />

      {/* My Slots */}
      <DrawerItem
        label="My Slots"
        icon={({ color, size }) => (
          <Ionicons name="time-outline" size={size} color={color} />
        )}
        onPress={() => props.navigation.navigate("MySlots")}
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
      <Drawer.Screen
        name="BarberDashboard"
        options={{ title: "Dashboard" }}
      />
      <Drawer.Screen
        name="ApplyLeave"
        options={{ title: "Apply Leave" }}
      />
      <Drawer.Screen
        name="BarberProfile"
        options={{ title: "Profile" }}
      />
      <Drawer.Screen
        name="MySlots"
        options={{ title: "My Slots" }}
      />
    </DrawerNavigator>
  );
}
