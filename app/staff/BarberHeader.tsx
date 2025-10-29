// app/staff/BarberHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, headerStyles } from "../../styles/theme";

export default function BarberHeader() {
  const navigation = useNavigation();
  const router = useRouter();
  const [barberName, setBarberName] = useState("Barber");

  // Load barber name from AsyncStorage
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("barberName");
      if (stored) setBarberName(stored);
    })();
  }, []);

  // Logout function
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("barberName");
          await AsyncStorage.removeItem("barberId");
          await AsyncStorage.removeItem("shopName");
          router.replace("/BarberLogin");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.primary }}>
      <View style={[headerStyles.header, { height: 60 }]}>
        {/* Left: Menu button */}
        <TouchableOpacity
          style={headerStyles.iconBtn}
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        >
          <Ionicons name="menu" size={28} color={colors.textDark} />
        </TouchableOpacity>

        {/* Center: Welcome Barber */}
        <Text
          style={[
            headerStyles.title,
            { color: "#000", flex: 1, textAlign: "center" },
          ]}
        >
          Welcome, {barberName} 💈
        </Text>

        {/* Right: Notifications + Logout */}
        <View style={headerStyles.rightIcons}>
          <TouchableOpacity
            style={headerStyles.iconBtn}
            onPress={() => Alert.alert("🔔 Notifications", "No new notifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.textDark}
            />
          </TouchableOpacity>

          <TouchableOpacity style={headerStyles.iconBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
