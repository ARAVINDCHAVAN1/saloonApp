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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(false);
  const seenSlotIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    let unsubscribe: any;

    const init = async () => {
      const storedName = await AsyncStorage.getItem("barberName");
      const barberId = await AsyncStorage.getItem("barberId");
      const savedUnread = await AsyncStorage.getItem("unreadNotification");
      if (storedName) setBarberName(storedName);
      if (savedUnread === "true") setUnread(true);

      if (barberId) {
        const q = query(collection(db, "slots"), where("barberId", "==", barberId));

        unsubscribe = onSnapshot(q, (snapshot) => {
          const trulyNew: any[] = [];

          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const docId = change.doc.id;
              if (!seenSlotIds.current.has(docId)) {
                const data = { id: docId, ...change.doc.data() };
                seenSlotIds.current.add(docId);
                trulyNew.push(data);
              }
            }
          });

          if (trulyNew.length > 0) {
            setUnread(true);
            AsyncStorage.setItem("unreadNotification", "true"); // ✅ Persist unread
            setNotifications((prev) => [...trulyNew, ...prev]);

            const latest = trulyNew[0];
            Alert.alert(
              "🕒 New Slot Assigned",
              `Date: ${latest.date || "N/A"}\nTime: ${
                latest.fromTime && latest.toTime
                  ? `${latest.fromTime} - ${latest.toTime}`
                  : "N/A"
              }`
            );
          }
        });
      }
    };

    init();
    return () => unsubscribe && unsubscribe();
  }, []);

  // ✅ Handle notifications click
  const handleNotifications = async () => {
    if (notifications.length === 0) {
      Alert.alert("🔔 Notifications", "No new notifications");
      return;
    }

    const list = notifications
      .map(
        (n, i) =>
          `${i + 1}. ${n.date || "N/A"} — ${
            n.fromTime && n.toTime
              ? `${n.fromTime} - ${n.toTime}`
              : "N/A"
          }`
      )
      .join("\n\n");

    Alert.alert("🕒 New Slots", list);
    setUnread(false);
    await AsyncStorage.setItem("unreadNotification", "false"); // ✅ Mark as read
  };

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
          ]);
          router.replace("/ShopOwnerLoginScreen");
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
        <Text style={headerStyles.title}>Welcome, {barberName} </Text>

        {/* Right: Notifications + Logout */}
        <View style={headerStyles.rightIcons}>
          {/* 🔔 Notifications */}
          <TouchableOpacity
            style={[headerStyles.iconBtn, { position: "relative" }]}
            onPress={handleNotifications}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.textDark} />

            {/* 🔴 Red Dot */}
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
