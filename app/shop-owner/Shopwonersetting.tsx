// app/Settings.tsx
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import ShopOwnerHeader from "./ShopOwnerHeader";
import ShopOwnerBottomNav from "./ShopOwnerBottomNav";
import LeftMenu from "./LeftMenu";
import { colors } from "../../styles/theme";

export default function Settings() {
  // LEFT MENU ANIMATION
  const [menuVisible, setMenuVisible] = useState(false);
  const slide = useRef(new Animated.Value(-270)).current;

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slide, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slide, {
      toValue: -270,
      duration: 200,
      useNativeDriver: false,
    }).start(() => setMenuVisible(false));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* ⭐ HEADER */}
      <ShopOwnerHeader title="Settings" openMenu={openMenu} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Salon Terms & Conditions</Text>

        <View style={styles.box}>
          <Text style={styles.title}>1. Booking & Appointment Rules</Text>
          <Text style={styles.text}>• Salon owners must update available slots daily.</Text>
          <Text style={styles.text}>• Any change in operating hours must be updated immediately.</Text>
          <Text style={styles.text}>• Barbers must follow assigned time schedules strictly.</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.title}>2. Payment & Billing</Text>
          <Text style={styles.text}>• Service charges must be updated in the system correctly.</Text>
          <Text style={styles.text}>• All completed bookings must be marked as "paid" within the app.</Text>
          <Text style={styles.text}>• No hidden charges or offline irregular payments are allowed.</Text>
          <Text style={styles.text}>• Refunds should be issued within 24 hours for cancelled services.</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.title}>3. Staff / Barber Terms</Text>
          <Text style={styles.text}>• Barbers must apply for leave through the app only.</Text>
          <Text style={styles.text}>• Emergency leave must be approved by the shop owner.</Text>
          <Text style={styles.text}>• Barbers must maintain cleanliness and professional behaviour.</Text>
          <Text style={styles.text}>• Repeated absence without approval can lead to suspension.</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.title}>4. Customer Handling</Text>
          <Text style={styles.text}>• Customers must be treated with respect and professionalism.</Text>
          <Text style={styles.text}>• No abusive behaviour will be tolerated.</Text>
          <Text style={styles.text}>• Complaints raised by users must be addressed within 24 hours.</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.title}>5. Cancellation & Refund Policy</Text>
          <Text style={styles.text}>• Customers can cancel appointments 30 minutes before the start time.</Text>
          <Text style={styles.text}>• If the barber is unavailable, the shop must provide instant refund.</Text>
          <Text style={styles.text}>• Repeated cancellations by barber may impact their profile rating.</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.title}>6. Data & System Usage</Text>
          <Text style={styles.text}>• Shop owners must not share their login credentials.</Text>
          <Text style={styles.text}>• All records in the app are monitored for business transparency.</Text>
          <Text style={styles.text}>• Any misuse may result in account suspension.</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.title}>7. Privacy Policy</Text>
          <Text style={styles.text}>
            • Customer phone numbers and details must not be shared or misused.
          </Text>
          <Text style={styles.text}>
            • All personal information is secured and used only for booking purposes.
          </Text>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ⭐ FOOTER NAV */}
      <ShopOwnerBottomNav />

      {/* ⭐ LEFT MENU */}
      <LeftMenu slide={slide} visible={menuVisible} closeMenu={closeMenu} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 150,
  },
  heading: {
    color: colors.primary,
    fontSize: 22,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
  },
  box: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#222",
  },
  title: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "700",
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 3,
  },
});
