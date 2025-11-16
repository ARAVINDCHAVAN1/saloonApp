import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import React from "react";
import { Alert } from "react-native";

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove([
            "isBarberLoggedIn",
            "barberId",
            "barberName",
            "salonId",
            "shopName",
          ]);
          router.replace("/barber-login");
        },
      },
    ]);
  };

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

      {/* Logout */}
      <DrawerItem
        label="Logout"
        icon={({ color, size }) => (
          <Ionicons name="log-out-outline" size={size} color="red" />
        )}
        labelStyle={{ color: "red", fontWeight: "600" }}
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
}

export default function CustomDrawerLayout() {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="BarberDashboard" />
      <Drawer.Screen name="ApplyLeave" />
      <Drawer.Screen name="BarberProfile" />
      <Drawer.Screen name="MySlots" />
    </Drawer.Navigator>
  );
}
