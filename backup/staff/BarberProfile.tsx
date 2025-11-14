// app/staff/BarberProfile.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { db } from "../../firebaseConfig";
import { staffEditStyles } from "../../styles/theme";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import BarberHeader from "./BarberHeader";

const CATEGORIES = ["Men", "Women", "Spa"];

export default function BarberProfile() {
  const [barber, setBarber] = useState<any>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const load = async () => {
      const barberId = await AsyncStorage.getItem("barberId");
      if (!barberId) return Alert.alert("Error", "No barber session found");

      const ref = doc(db, "barbers", barberId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setBarber(data);
        setImageUri(data.photoUrl || null);
      }
    };
    load();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow photo access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const updateProfile = async () => {
    if (!barber) return;
    try {
      setUploading(true);

      let photoUrl = barber.photoUrl;
      if (imageUri && imageUri !== barber.photoUrl) {
        photoUrl = await uploadToCloudinary(imageUri);
      }

      await updateDoc(doc(db, "barbers", barber.id), {
        name: barber.name,
        experience: barber.experience,
        specialization: barber.specialization,
        password: barber.password,
        photoUrl,
      });

      Alert.alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Error updating profile");
    } finally {
      setUploading(false);
    }
  };

  if (!barber)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#fff" }}>Loading profile...</Text>
      </View>
    );

  return (
    <View style={staffEditStyles.screen}>
      <BarberHeader />
      <ScrollView contentContainerStyle={staffEditStyles.container}>
        {/* Profile Image */}
        <TouchableOpacity onPress={pickImage} style={staffEditStyles.imageBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={staffEditStyles.image} />
          ) : (
            <Text style={staffEditStyles.imagePlaceholder}>Pick Profile Image</Text>
          )}
        </TouchableOpacity>

        {/* Name */}
        <TextInput
          value={barber.name}
          onChangeText={(t) => setBarber({ ...barber, name: t })}
          placeholder="Barber Name"
          style={staffEditStyles.input}
        />

        {/* Experience */}
        <TextInput
          value={barber.experience}
          onChangeText={(t) => setBarber({ ...barber, experience: t })}
          placeholder="Experience (e.g. 5 years)"
          style={staffEditStyles.input}
        />

        {/* Password + Toggle */}
        <View style={{ position: "relative", width: "100%" }}>
          <TextInput
            value={barber.password}
            onChangeText={(t) => setBarber({ ...barber, password: t })}
            placeholder="Password"
            secureTextEntry={!showPassword}
            style={[staffEditStyles.input, { paddingRight: 40 }]}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", right: 10, top: 18 }}
          >
            <Icon
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color="#777"
            />
          </TouchableOpacity>
        </View>

        {/* Specialization */}
        <View style={staffEditStyles.chipContainer}>
          {CATEGORIES.map((c) => {
            const active = c === barber.specialization;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setBarber({ ...barber, specialization: c })}
                style={[staffEditStyles.chip, active && staffEditStyles.chipActive]}
              >
                <Text
                  style={[
                    staffEditStyles.chipText,
                    active && staffEditStyles.chipTextActive,
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[staffEditStyles.saveBtn, uploading && { opacity: 0.6 }]}
          onPress={updateProfile}
          disabled={uploading}
        >
          <Text style={staffEditStyles.saveBtnText}>
            {uploading ? "Updating..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
