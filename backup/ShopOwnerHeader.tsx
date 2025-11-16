import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, headerStyles, images } from "../styles/theme";

type Props = {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
};

export default function ShopOwnerHeader({ title, showBack, onBackPress }: Props) {
  const navigation = useNavigation();
  const router = useRouter();
  const [ownerName, setOwnerName] = useState("Owner");

  useEffect(() => {
    const load = async () => {
      const name = (await AsyncStorage.getItem("shopOwnerName")) || "Owner";
      setOwnerName(name);
    };
    load();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/ShopOwnerLoginScreen");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.primary }}>
      <View style={headerStyles.header}>
        {/* Left side: Back OR Menu + Logo */}
        <View style={headerStyles.leftSection}>
          {showBack ? (
            <TouchableOpacity
              onPress={onBackPress || (() => router.back())}
              style={headerStyles.iconBtn}
            >
              <Ionicons name="arrow-back" size={28} color={colors.textDark} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
              style={headerStyles.iconBtn}
            >
              <Ionicons name="menu" size={28} color={colors.textDark} />
            </TouchableOpacity>
          )}

          {/* ✅ Logo next to menu/back */}
          <Image
            source={images.logo}
            style={headerStyles.logo}
            resizeMode="cover"
          />
        </View>

        {/* Center: Title or Welcome */}
        <Text style={headerStyles.title}>
          {title ? title : `Welcome, ${ownerName}`}
        </Text>

        {/* Right side: Settings + Logout */}
        <View style={headerStyles.rightIcons}>
          <TouchableOpacity
            style={headerStyles.iconBtn}
            onPress={() => router.push("/shop-owner-settings")}
          >
            <Ionicons name="settings-outline" size={24} color={colors.textDark} />
          </TouchableOpacity>

          <TouchableOpacity style={headerStyles.iconBtn} onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={24}
              color={colors.textDark}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
