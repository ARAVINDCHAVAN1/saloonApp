// app/staff/BarberHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  collection,
  DocumentData,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../src/firebase/firebaseConfig";
import { colors, headerStyles, images } from "../../styles/theme";

/* ----------------------------------------------------------
    CLEAN TOKEN (REMOVE NARROW SPACES)
----------------------------------------------------------- */
const NBSP = /\u202F/g;
function clean(str: string) {
  return str.replace(NBSP, " ").trim();
}

/* ----------------------------------------------------------
    MANUAL PARSE OF "Wed Nov 12 2025" + "12:09 PM"
----------------------------------------------------------- */
const MONTHS: any = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

function parseStart(dateStr: string, slotTime: string): Date | null {
  try {
    const cleaned = clean(slotTime);
    const [from] = cleaned.split("-"); // "12:09 PM"

    const parts = dateStr.split(" "); // ["Wed", "Nov", "12", "2025"]
    const month = MONTHS[parts[1]];
    const day = parseInt(parts[2], 10);
    const year = parseInt(parts[3], 10);

    if (month === undefined || !day || !year) return null;

    // Convert "12:09 PM"
    const [time, mer] = from.trim().split(" ");
    let [h, m] = time.split(":").map(Number);

    if (mer.toUpperCase() === "PM" && h < 12) h += 12;
    if (mer.toUpperCase() === "AM" && h === 12) h = 0;

    const d = new Date(year, month, day, h, m);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/* ----------------------------------------------------------
    BOOKING TYPE
----------------------------------------------------------- */
interface Booking extends DocumentData {
  id: string;
  date: string;            // "Wed Nov 12 2025"
  slotTime: string;        // "12:09 PM - 5:09 PM"
  status: string;          // "paid"
  paymentStatus: string;   // "success"
  barberId: string;
}

export default function BarberHeader() {
  const navigation: any = useNavigation();
  const router = useRouter();

  const [name, setName] = useState("Barber");
  const [barberId, setBarberId] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifVisible, setNotifVisible] = useState(false);

  /* ---------------------------------------------------------
        LOAD BARBER NAME + ID
  ---------------------------------------------------------- */
  useEffect(() => {
    (async () => {
      const barberName =
        (await AsyncStorage.getItem("barberName")) || "Barber";
      const id = await AsyncStorage.getItem("barberId");

      setName(barberName);
      if (id) setBarberId(id);
    })();
  }, []);

  /* ---------------------------------------------------------
        REAL-TIME BOOKINGS LISTENER
  ---------------------------------------------------------- */
  useEffect(() => {
    if (!barberId) return;

    const qy = query(
      collection(db, "userBookings"),
      where("barberId", "==", barberId)
    );

    const unsub = onSnapshot(qy, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setBookings(list);
    });

    return () => unsub();
  }, [barberId]);

  /* ---------------------------------------------------------
        UPCOMING BOOKINGS  —  FIXED PARSE LOGIC
  ---------------------------------------------------------- */
  const upcoming = useMemo(() => {
    const now = new Date();

    return bookings
      .filter(
        (b) =>
          b.status?.toLowerCase() === "paid" ||
          b.paymentStatus?.toLowerCase() === "success"
      )
      .map((b) => ({
        ...b,
        _start: parseStart(b.date, b.slotTime),
      }))
      .filter((b) => b._start && b._start.getTime() > now.getTime())
      .sort((a, b) => b._start.getTime() - a._start.getTime());
  }, [bookings]);

  const unread = upcoming.length > 0;

  /* ---------------------------------------------------------
        LOGOUT
  ---------------------------------------------------------- */
  const logout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/");
        },
      },
    ]);
  };

  /* ---------------------------------------------------------
        UI
  ---------------------------------------------------------- */
  return (
    <SafeAreaView style={{ backgroundColor: colors.primary }}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          style={{ marginRight: 10 }}
        >
          <Ionicons name="menu" size={30} color={colors.textDark} />
        </TouchableOpacity>

        <Image source={images.logo} style={headerStyles.logo} />

        <Text style={headerStyles.title}>Welcome, {name}</Text>

        <View style={styles.rightRow}>
          <TouchableOpacity
            onPress={() => setNotifVisible(true)}
            style={{ marginRight: 10, position: "relative" }}
          >
            <Ionicons
              name="notifications-outline"
              size={28}
              color={colors.textDark}
            />
            {unread && <View style={styles.redDot} />}
          </TouchableOpacity>

          <TouchableOpacity style={headerStyles.iconBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color={colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------------- NOTIFICATION POPUP ---------------- */}
      <Modal
        visible={notifVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotifVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setNotifVisible(false)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.card}>
                <Text style={styles.modalTitle}>Upcoming Bookings</Text>

                {upcoming.length === 0 ? (
                  <Text style={{ color: "#555", paddingVertical: 10 }}>
                    No upcoming bookings.
                  </Text>
                ) : (
                  upcoming.map((b) => (
                    <View key={b.id} style={styles.itemRow}>
                      <Text style={{ fontSize: 15 }}>📅 {b.date}</Text>
                      <Text style={{ fontSize: 15 }}>
                        ⏰ {clean(b.slotTime)}
                      </Text>
                    </View>
                  ))
                )}

                <TouchableOpacity
                  onPress={() => setNotifVisible(false)}
                  style={{ alignSelf: "flex-end", paddingTop: 12 }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

/* ----------------------------------------------------------
    STYLES
----------------------------------------------------------- */
const styles = StyleSheet.create({
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  redDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    backgroundColor: "red",
    borderRadius: 20,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "92%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  itemRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
});
