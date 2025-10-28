import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebaseConfig";
import { staffEditStyles } from "../styles/theme"; // ✅ import theme styles
import { uploadToCloudinary } from "../utils/uploadToCloudinary";
import Header from "./ShopOwnerHeader";

const CATEGORIES = ["Men", "Women", "Spa"];

export default function StaffEdit() {
  const { barberId } = useLocalSearchParams();
  const router = useRouter();
  const [staff, setStaff] = useState<any>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // ✅ Load staff details
  useEffect(() => {
    const load = async () => {
      if (!barberId) return;
      const ref = doc(db, "barbers", barberId as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setStaff(data);
        setImageUri(data.photoUrl || null);
      }
    };
    load();
  }, [barberId]);

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

  const updateStaff = async () => {
    if (!staff) return;
    try {
      setUploading(true);

      let photoUrl = staff.photoUrl;
      if (imageUri && imageUri !== staff.photoUrl) {
        photoUrl = await uploadToCloudinary(imageUri);
      }

      await updateDoc(doc(db, "barbers", staff.id), {
        name: staff.name,
        experience: staff.experience,
        specialization: staff.specialization,
        photoUrl,
      });

      Alert.alert("✅ Staff updated");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Error updating staff");
    } finally {
      setUploading(false);
    }
  };

  if (!staff) return <Text style={{ margin: 16, color: "#fff" }}>Loading staff...</Text>;

  return (
    <View style={staffEditStyles.screen}>
      <Header title="Edit Staff" showBack onBackPress={() => router.back()} />

      <View style={staffEditStyles.container}>
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
          value={staff.name}
          onChangeText={(t) => setStaff({ ...staff, name: t })}
          placeholder="Staff Name"
          style={staffEditStyles.input}
        />

        {/* Experience */}
        <TextInput
          value={staff.experience}
          onChangeText={(t) => setStaff({ ...staff, experience: t })}
          placeholder="Experience"
          style={staffEditStyles.input}
        />

        {/* Category */}
        <View style={staffEditStyles.chipContainer}>
          {CATEGORIES.map((c) => {
            const active = c === staff.specialization;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setStaff({ ...staff, specialization: c })}
                style={[staffEditStyles.chip, active && staffEditStyles.chipActive]}
              >
                <Text
                  style={[staffEditStyles.chipText, active && staffEditStyles.chipTextActive]}
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
          onPress={updateStaff}
          disabled={uploading}
        >
          <Text style={staffEditStyles.saveBtnText}>
            {uploading ? "Updating..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
