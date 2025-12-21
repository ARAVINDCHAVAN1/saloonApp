import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../src/firebase/firebaseConfig";
import { colors, headerStyles, images } from "../../styles/theme";

// ===============================
// TIME HELPERS
// ===============================
const parseAMPM = (timeString: string) => {
  try {
    if (!timeString) return null;
    const cleaned = timeString.replace(/\./g, "").trim(); // "10:39 am"
    const parts = cleaned.split(" ");
    if (parts.length < 2) return null;

    const [time, modifierRaw] = parts;
    const modifier = modifierRaw.toUpperCase(); // AM / PM
    let [hours, minutes] = time.split(":").map((n) => Number(n));

    if (isNaN(hours) || isNaN(minutes)) return null;

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return { hours, minutes };
  } catch (e) {
    console.log("parseAMPM error:", timeString, e);
    return null;
  }
};

const isFutureSlot = (dateStr?: string, fromTime?: string) => {
  if (!dateStr || !fromTime) return false;

  try {
    const now = new Date();
    const todayOnlyDate = new Date(now.toDateString());
    const slotDate = new Date(dateStr);

    // Past date → expired
    if (slotDate < todayOnlyDate) return false;

    // Future date → ok
    if (slotDate > todayOnlyDate) return true;

    // Same date → check time
    const parsed = parseAMPM(fromTime);
    if (!parsed) return false;

    const slotDateTime = new Date();
    slotDateTime.setHours(parsed.hours, parsed.minutes, 0, 0);

    return slotDateTime > now;
  } catch (e) {
    console.log("isFutureSlot error:", e);
    return false;
  }
};

const getFromTimeFromSlotTime = (slotTime?: string) => {
  if (!slotTime) return "";
  // "10:39 am - 11:24 am" → "10:39 am"
  return String(slotTime).split("-")[0].trim();
};

export default function BarberHeader({ title, openMenu }) {
  const router = useRouter();

  const [barberName, setBarberName] = useState("Barber");

  // Notification state
  const [notifCount, setNotifCount] = useState(0);
  const [notifList, setNotifList] = useState<
    { type: string; message: string; time: any }[]
  >([]);
  const [notifVisible, setNotifVisible] = useState(false);

  /* ---------------------------------------
      LOAD BARBER NAME + FIRESTORE LISTENERS
  ---------------------------------------- */
  useEffect(() => {
    let unsubBook: (() => void) | undefined;
    let unsubSlot: (() => void) | undefined;
    let unsubPaid: (() => void) | undefined;

    (async () => {
      const bName = await AsyncStorage.getItem("barberName");
      const barberId = await AsyncStorage.getItem("barberId");
      const salonId = await AsyncStorage.getItem("salonId");

      console.log("BARBER_ID:", barberId);
      console.log("SALON_ID:", salonId);

      setBarberName(bName || "Barber");

      if (!barberId) return;

      /* ------------------------------
         NEW BOOKINGS (userBookings)
      ------------------------------ */
      const bookingQ = query(
        collection(db, "userBookings"),
        where("barberId", "==", barberId),
        where("status", "==", "paid")
      );

      unsubBook = onSnapshot(bookingQ, (snap) => {
        const futureBookings = snap.docs
          .map((d) => d.data() as any)
          .filter((b) =>
            isFutureSlot(b.date, getFromTimeFromSlotTime(b.slotTime))
          );

        updateNotificationList("booking", futureBookings);
      });

      /* ------------------------------
         NEW SLOTS (slots collection)
      ------------------------------ */
      const slotQ = query(
        collection(db, "slots"),
        where("barberId", "==", barberId)
      );

      unsubSlot = onSnapshot(slotQ, (snap) => {
        const futureSlots = snap.docs
          .map((d) => d.data() as any)
          .filter((s) => isFutureSlot(s.date, s.fromTime));

        updateNotificationList("slot", futureSlots);
      });

      /* ------------------------------
         BOOKED SLOTS (payments)
      ------------------------------ */
      const paidQ = query(
        collection(db, "payments"),
        where("barberId", "==", barberId),
        where("status", "==", "paid")
      );

      unsubPaid = onSnapshot(paidQ, (snap) => {
        const futurePaid = snap.docs
          .map((d) => d.data() as any)
          .filter((p) =>
            isFutureSlot(p.date, getFromTimeFromSlotTime(p.slotTime))
          );

        updateNotificationList("booked", futurePaid);
      });
    })();

    return () => {
      if (unsubBook) unsubBook();
      if (unsubSlot) unsubSlot();
      if (unsubPaid) unsubPaid();
    };
  }, []);

  /* ---------------------------------------
      UPDATE NOTIFICATION LIST
  ---------------------------------------- */
  const updateNotificationList = (type: string, items: any[]) => {
    if (!items || items.length === 0) return;

    const formatted = items.map((item) => {
      let message = "";
      if (type === "booking") {
        message = `New Booking: ${item.barberName || ""} at ${
          item.slotTime || ""
        }`;
      } else if (type === "slot") {
        message = `New Slot Created: ${item.fromTime} - ${item.toTime}`;
      } else if (type === "booked") {
        message = `Slot Booked: ${item.slotTime || ""}`;
      }

      return {
        type,
        message,
        time: item.date,
      };
    });

    // add new on top (latest first)
    setNotifList((prev) => [...formatted, ...prev]);
    setNotifCount((prev) => prev + formatted.length);
  };

  /* ---------------------------------------
      LOGOUT
  ---------------------------------------- */
  const logout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/staff/barber-login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.primary }}>
      <View style={headerStyles.header}>
        {/* LEFT: MENU + LOGO */}
        <View style={headerStyles.leftSection}>
          <TouchableOpacity onPress={openMenu} style={headerStyles.iconBtn}>
            <Ionicons name="menu" size={27} color={colors.textDark} />
          </TouchableOpacity>
          <Image source={images.logo} style={headerStyles.logo} />
        </View>

        {/* CENTER TITLE */}
        <Text style={headerStyles.title}>
          {title ? title : `Welcome, ${barberName}`}
        </Text>

        {/* RIGHT: NOTIFICATION + LOGOUT */}
        <View style={headerStyles.rightIcons}>
          {/* 🔔 NOTIFICATION BUTTON */}
          <TouchableOpacity
            style={{ marginRight: 5 }}
            onPress={() => {
              setNotifVisible(true);
              setNotifCount(0); // clear badge when opened
            }}
          >
            <Ionicons name="notifications-outline" size={26} color="#000" />

            {notifCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -3,
                  right: -3,
                  backgroundColor: "red",
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                }}
              />
            )}
          </TouchableOpacity>

          {/* LOGOUT */}
          <TouchableOpacity style={headerStyles.iconBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={26} color={colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔔 NOTIFICATION POPUP */}
      <Modal visible={notifVisible} transparent animationType="fade">
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 30,
          }}
          onPress={() => setNotifVisible(false)}
          activeOpacity={1}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                marginBottom: 10,
                color: colors.primary,
              }}
            >
              Notifications
            </Text>

            <ScrollView>
              {notifList.length === 0 && (
                <Text style={{ textAlign: "center", marginVertical: 20 }}>
                  No new notifications
                </Text>
              )}

              {notifList.map((n, i) => (
                <View
                  key={i}
                  style={{
                    marginBottom: 12,
                    padding: 12,
                    backgroundColor: "#f7f7f7",
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>
                    {n.type.toUpperCase()}
                  </Text>
                  <Text>{n.message}</Text>
                  <Text style={{ color: "#777", marginTop: 4 }}>{n.time}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
