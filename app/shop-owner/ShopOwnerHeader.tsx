// app/shop-owner/ShopOwnerHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, headerStyles, images } from "../../styles/theme";

export default function ShopOwnerHeader({ title, openMenu }) {
  const router = useRouter();
  const [ownerName, setOwnerName] = useState("Owner");

  useEffect(() => {
    (async () => {
      const name = await AsyncStorage.getItem("shopOwnerName");
      setOwnerName(name || "Owner");
    })();
  }, []);

  const logout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/shop-owner/ShopOwnerLoginScreen");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.primary }}>
      <View style={headerStyles.header}>

        {/* LEFT SECTION → menu + logo */}
        <View style={headerStyles.leftSection}>
          <TouchableOpacity onPress={openMenu} style={headerStyles.iconBtn}>
            <Ionicons name="menu" size={28} color={colors.textDark} />
          </TouchableOpacity>

          <Image source={images.logo} style={headerStyles.logo} />
        </View>

        {/* CENTER TITLE */}
        <Text style={headerStyles.title}>
          {title ? title : `Welcome, ${ownerName}`}
        </Text>

        {/* RIGHT → LOGOUT ONLY */}
        <View style={headerStyles.rightIcons}>
          <TouchableOpacity style={headerStyles.iconBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={26} color={colors.textDark} />
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
