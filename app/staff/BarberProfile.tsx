// app/staff/BarberProfile.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Animated,
} from "react-native";
import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";

// Header / Footer / Menu
import BarberHeader from "./BarberHeader";
import BarberBottomNav from "./BarberBottomNav";
import LeftMenu from "./LeftMenu";

export default function BarberProfile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [specialization, setSpecialization] = useState("");

  // LEFT MENU
  const [menuVisible, setMenuVisible] = useState(false);
  const slide = useRef(new Animated.Value(-270)).current;

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slide, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slide, {
      toValue: -270,
      duration: 180,
      useNativeDriver: false,
    }).start(() => setMenuVisible(false));
  };

  // LOAD BARBER DATA
  useEffect(() => {
    const loadData = async () => {
      const barberId = await AsyncStorage.getItem("barberId");
      if (!barberId) return;

      const snap = await getDoc(doc(db, "barbers", barberId));
      if (!snap.exists()) return;

      const d: any = snap.data();

      setName(d.name || "");
      setEmail(d.email || "");
      setPhone(d.phone || "");
      setExperience(d.experience || "");
      setSpecialization(d.specialization || "");
    };

    loadData();
  }, []);

  const Item = ({ label, value }) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: "#777", fontSize: 14, marginBottom: 4 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 18, color: "#222", fontWeight: "600" }}>
        {value || "—"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER */}
      <BarberHeader openMenu={openMenu} />

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 150,
        }}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: "700",
            color: colors.primary,
            textAlign: "center",
            marginBottom: 25,
          }}
        >
          Barber Profile
        </Text>

        {/* PROFILE INFO */}
        <Item label="Name" value={name} />
        <Item label="Email" value={email} />
        <Item label="Phone" value={phone} />
        <Item label="Experience" value={experience} />
        <Item label="Specialization" value={specialization} />

        {/* TERMS & CONDITIONS BELOW PROFILE */}
        <Text
          style={{
            color: colors.primary,
            fontSize: 22,
            textAlign: "center",
            fontWeight: "bold",
            marginVertical: 22,
          }}
        >
          Terms & Conditions
        </Text>

        <View
          style={{
            backgroundColor: "#111",
            borderRadius: 10,
            padding: 14,
            marginBottom: 15,
            borderWidth: 1,
            borderColor: "#222",
          }}
        >
          <Text style={{ fontSize: 16, color: colors.primary, fontWeight: "700", marginBottom: 6 }}>
            1. Work & Scheduling Rules
          </Text>
          <Text style={{ color: "#ccc" }}>• Follow allotted slots strictly.</Text>
          <Text style={{ color: "#ccc" }}>• Maintain proper timing and professionalism.</Text>
          <Text style={{ color: "#ccc" }}>• Update barber availability honestly.</Text>
        </View>

        <View
          style={{
            backgroundColor: "#111",
            borderRadius: 10,
            padding: 14,
            marginBottom: 15,
            borderWidth: 1,
            borderColor: "#222",
          }}
        >
          <Text style={{ fontSize: 16, color: colors.primary, fontWeight: "700", marginBottom: 6 }}>
            2. Leave & Permission
          </Text>
          <Text style={{ color: "#ccc" }}>• Apply leave only through the app.</Text>
          <Text style={{ color: "#ccc" }}>• Emergency leave requires owner approval.</Text>
          <Text style={{ color: "#ccc" }}>• Repeated absence may affect duties.</Text>
        </View>

        <View
          style={{
            backgroundColor: "#111",
            borderRadius: 10,
            padding: 14,
            marginBottom: 15,
            borderWidth: 1,
            borderColor: "#222",
          }}
        >
          <Text style={{ fontSize: 16, color: colors.primary, fontWeight: "700", marginBottom: 6 }}>
            3. Customer Handling
          </Text>
          <Text style={{ color: "#ccc" }}>• Behave respectfully with customers.</Text>
          <Text style={{ color: "#ccc" }}>• Complaints should be avoided.</Text>
          <Text style={{ color: "#ccc" }}>• Maintain hygiene & professionalism.</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FOOTER */}
      <BarberBottomNav />

      {/* LEFT MENU */}
      <LeftMenu visible={menuVisible} slide={slide} closeMenu={closeMenu} />
    </SafeAreaView>
  );
}
