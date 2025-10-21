import AsyncStorage from "@react-native-async-storage/async-storage";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { colors, commonStyles } from "../styles/theme";

import DeleteAccountScreen from "./ShopOwnerDelete";
import ProfileScreen from "./ShopOwnerProfile";

const Drawer = createDrawerNavigator();

function HomeScreen() {
  const [ownerName, setOwnerName] = useState<string>("");

  useEffect(() => {
    const loadName = async () => {
      const name = await AsyncStorage.getItem("shopOwnerName");
      setOwnerName(name || "Shop Owner");
    };
    loadName();
  }, []);

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.title}>👋 Welcome, {ownerName}</Text>
      <Text style={commonStyles.subtitle}>
        This is your Shop Owner Dashboard
      </Text>
    </View>
  );
}

export default function ShopOwnerDashboard() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: "#fff",
        drawerActiveTintColor: colors.primary,
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Delete Account" component={DeleteAccountScreen} />
    </Drawer.Navigator>
  );
}
