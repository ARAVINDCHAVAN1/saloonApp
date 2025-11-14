// app/staff/BarberProfile.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { db } from "../../src/firebase/firebaseConfig";
import { colors, commonStyles } from "../../styles/theme";

export default function BarberProfile() {
  const [editMode, setEditMode] = useState(false);

  // ✅ Independent fields (fixes keyboard closing)
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [password, setPassword] = useState("");

  /* -------------------------------------------------------------
      LOAD BARBER PROFILE
  ------------------------------------------------------------- */
  useEffect(() => {
    const loadData = async () => {
      const barberId = await AsyncStorage.getItem("barberId");
      if (!barberId) return;

      const snap = await getDoc(doc(db, "barbers", barberId));
      if (!snap.exists()) return;

      const data = snap.data();

      setId(barberId);
      setName(data.name ?? "");
      setEmail(data.email ?? "");
      setPhone(data.phone ?? "");
      setExperience(data.experience ?? "");
      setSpecialization(data.specialization ?? "");
      setPassword(data.password ?? "");
    };

    loadData();
  }, []);

  /* -------------------------------------------------------------
      UPDATE PROFILE
  ------------------------------------------------------------- */
  const updateProfile = async () => {
    try {
      await updateDoc(doc(db, "barbers", id), {
        name,
        email,
        phone,
        experience,
        specialization,
        password,
      });

      Toast.show({
        type: "success",
        text1: "Profile Updated ✅",
      });

      setEditMode(false);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Update Failed ❌",
      });
    }
  };

  // ✅ REUSABLE FIELD COMPONENT
  const Field = ({ label, value, onChangeText }) => (
    <View style={{ marginBottom: 25 }}>
      <Text style={{ fontSize: 14, color: "#777", marginBottom: 4 }}>
        {label}
      </Text>

      {!editMode ? (
        <Text style={{ fontSize: 18, color: "#222", fontWeight: "500" }}>
          {value || "—"}
        </Text>
      ) : (
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 14,
            fontSize: 16,
            backgroundColor: "#fff",
          }}
          value={value}
          onChangeText={onChangeText}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
      >
        {/* ✅ Title */}
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

        {/* ✅ Fields */}
        <Field label="Name" value={name} onChangeText={setName} />
        <Field label="Email" value={email} onChangeText={setEmail} />
        <Field label="Phone" value={phone} onChangeText={setPhone} />
        <Field label="Experience" value={experience} onChangeText={setExperience} />
        <Field
          label="Specialization"
          value={specialization}
          onChangeText={setSpecialization}
        />
        <Field label="Password" value={password} onChangeText={setPassword} />
      </ScrollView>

      {/* ✅ Buttons (Edit / Save) */}
      <View
        style={{
          padding: 20,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderColor: "#eee",
        }}
      >
        {!editMode ? (
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: colors.primary }]}
            onPress={() => setEditMode(true)}
          >
            <Text style={commonStyles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: colors.primary }]}
            onPress={updateProfile}
          >
            <Text style={commonStyles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        )}

        
      </View>

      <Toast />
    </SafeAreaView>
  );
}
