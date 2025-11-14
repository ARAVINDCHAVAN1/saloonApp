import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../firebaseConfig";
import { colors, headerStyles, images } from "../../styles/theme";

export default function BarberHeader() {
  const navigation = useNavigation();
  const router = useRouter();

  const [barberName, setBarberName] = useState("Barber");
  const [unread, setUnread] = useState(false);

  const seenSlotIds = useRef<Set<string>>(new Set());
  const alertShown = useRef(false); // Prevent multiple alerts rapidly

  // ✅ Load barber info once
  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        const storedName = await AsyncStorage.getItem("barberName");
        const barberId = await AsyncStorage.getItem("barberId");
        const savedUnread = await AsyncStorage.getItem("unreadNotification");

        if (active && storedName) setBarberName(storedName);
        if (active && savedUnread === "true") setUnread(true);

        // ✅ Setup listener only once
        if (barberId) {
          const q = query(collection(db, "slots"), where("barberId", "==", barberId));

          const unsub = onSnapshot(q, (snapshot) => {
            let newDataFound = false;

            snapshot.docChanges().forEach((change) => {
              if (change.type === "added") {
                const docId = change.doc.id;
                if (!seenSlotIds.current.has(docId)) {
                  seenSlotIds.current.add(docId);
                  newDataFound = true;
                }
              }
            });

            // ✅ Only update if new data truly added
            if (newDataFound && active && !alertShown.current) {
              alertShown.current = true; // prevent spam alerts
              setUnread(true);
              AsyncStorage.setItem("unreadNotification", "true");

              setTimeout(() => (alertShown.current = false), 3000); // debounce alerts

              Alert.alert(
                "🕒 New Slot Assigned",
                "A new booking slot was assigned to you."
              );
            }
          });

          return () => unsub();
        }
      } catch (error) {
        console.error("Error initializing header:", error);
      }
    };

    init();
    return () => {
      active = false;
    };
  }, []);

  // ✅ Handle notifications
  const handleNotifications = async () => {
    setUnread(false);
    await AsyncStorage.setItem("unreadNotification", "false");
    Alert.alert("🔔 Notifications", "No new notifications right now.");
  };

  // ✅ Handle logout
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove([
            "barberName",
            "barberId",
            "shopName",
            "unreadNotification",
            "isBarberLoggedIn",
          ]);
          router.replace("/barber-login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.primary }}>
      <View style={headerStyles.header}>
        {/* Left: Menu + Logo */}
        <View style={headerStyles.leftSection}>
          <TouchableOpacity
            style={headerStyles.iconBtn}
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          >
            <Ionicons name="menu-outline" size={28} color={colors.textDark} />
          </TouchableOpacity>

          <Image
            source={images.logo}
            style={headerStyles.logo}
            resizeMode="cover"
          />
        </View>

        {/* Center: Welcome Barber */}
        <Text style={headerStyles.title}>Welcome, {barberName}</Text>

        {/* Right: Notifications + Logout */}
        <View style={headerStyles.rightIcons}>
          {/* 🔔 Notifications */}
          <TouchableOpacity
            style={[headerStyles.iconBtn, { position: "relative" }]}
            onPress={handleNotifications}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.textDark}
            />
            {unread && (
              <View
                style={{
                  position: "absolute",
                  top: 4,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "red",
                }}
              />
            )}
          </TouchableOpacity>

          {/* 🚪 Logout */}
          <TouchableOpacity style={headerStyles.iconBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
