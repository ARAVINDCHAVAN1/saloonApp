import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection } from "firebase/firestore";
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
import { db } from "../../src/firebase/firebaseConfig";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";

// ✅ import your theme styles
import { addStaffStyles } from "../../styles/theme";

const CATEGORIES = ["Men", "Women", "Spa"];

export default function AddStaff() {
  const [salonId, setSalonId] = useState("");
  const [newName, setNewName] = useState("");
  const [newExp, setNewExp] = useState("");
  const [newPassword, setNewPassword] = useState("");   // ✅ New state for password
  const [newCategory, setNewCategory] = useState("Men");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const sid = await AsyncStorage.getItem("shopId");
      if (!sid) return Alert.alert("Missing", "shopId not found.");
      setSalonId(sid);
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

  const addBarber = async () => {
    if (!newName || !newExp || !newPassword) {
      return Alert.alert("⚠️ Error", "Please fill all staff fields including password.");
    }

    try {
      setUploading(true);
      let photoUrl = "";
      if (imageUri) {
        photoUrl = await uploadToCloudinary(imageUri);
      }

      await addDoc(collection(db, "barbers"), {
        salonId,
        name: newName,
        experience: newExp,
        specialization: newCategory,
        password: newPassword,   // ✅ Save password
        photoUrl,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("✅ Success", "Staff added successfully.");
      setNewName("");
      setNewExp("");
      setNewPassword("");   // ✅ Clear password after submit
      setNewCategory("Men");
      setImageUri(null);
    } catch (e: any) {
      console.error("Add staff error:", e);
      Alert.alert("❌ Error", e.message || "Failed to add staff.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={addStaffStyles.screen}>
      <Text style={addStaffStyles.pageTitle}>➕ Add New Staff</Text>

      <TextInput
        placeholder="Name"
        style={addStaffStyles.inputField}
        value={newName}
        onChangeText={setNewName}
      />

      <TextInput
        placeholder="Experience (e.g., 5 years)"
        style={addStaffStyles.inputField}
        value={newExp}
        onChangeText={setNewExp}
      />

      {/* ✅ Password Field */}
      <TextInput
        placeholder="Set Password"
        style={addStaffStyles.inputField}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      {/* Category Section */}
      <Text style={addStaffStyles.sectionLabel}>Select Category</Text>
      <View style={addStaffStyles.categoryRow}>
        {CATEGORIES.map((c) => {
          const active = c === newCategory;
          return (
            <TouchableOpacity
              key={c}
              onPress={() => setNewCategory(c)}
              style={[
                addStaffStyles.categoryChip,
                active && addStaffStyles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  addStaffStyles.categoryText,
                  active && addStaffStyles.categoryTextActive,
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Show Selected Category */}
      <Text style={addStaffStyles.selectedText}>
        Currently selected: {newCategory}
      </Text>

      {/* Image Upload */}
      <Text style={addStaffStyles.sectionLabel}>Profile Image</Text>
      <TouchableOpacity style={addStaffStyles.imageBox} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={addStaffStyles.profileImage} />
        ) : (
          <Text style={addStaffStyles.imagePlaceholder}>Pick Profile Image</Text>
        )}
      </TouchableOpacity>

      {/* Submit */}
      <TouchableOpacity
        style={[addStaffStyles.submitButton, uploading && { opacity: 0.6 }]}
        onPress={addBarber}
        disabled={uploading}
      >
        <Text style={addStaffStyles.submitButtonText}>
          {uploading ? "Uploading..." : "Submit Staff"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
