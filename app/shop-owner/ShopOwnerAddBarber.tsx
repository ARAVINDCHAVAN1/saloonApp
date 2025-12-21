// app/shop-owner/AddStaff.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { db } from "../../src/firebase/firebaseConfig";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import { addStaffStyles, colors } from "../../styles/theme";
import { useLocalSearchParams, useRouter } from "expo-router";

// HEADER + FOOTER + LEFT MENU
import ShopOwnerHeader from "./ShopOwnerHeader";
import ShopOwnerBottomNav from "./ShopOwnerBottomNav";
import LeftMenu from "./LeftMenu";

const CATEGORIES = ["Men", "Women", "Spa"];

export default function AddStaff() {
  const router = useRouter();
  const { barberId } = useLocalSearchParams();

  /* ---------------- MENU ---------------- */
  const [visible, setVisible] = useState(false);
  const slide = useRef(new Animated.Value(-270)).current;

  const openMenu = () => {
    setVisible(true);
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
    }).start(() => setVisible(false));
  };

  /* ---------------- STATES ---------------- */
  const [salonId, setSalonId] = useState("");
  const [newName, setNewName] = useState("");
  const [newExp, setNewExp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newCategory, setNewCategory] = useState("Men");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  /* ---------------- LOAD STAFF FOR EDIT ---------------- */
  useEffect(() => {
    const load = async () => {
      const sid = await AsyncStorage.getItem("shopId");
      if (!sid) return Alert.alert("Missing", "shopId not found.");

      setSalonId(sid);

      // If editing staff
      if (barberId) {
        const snap = await getDoc(doc(db, "barbers", barberId as string));
        if (snap.exists()) {
          const d: any = snap.data();
          setNewName(d.name);
          setNewExp(d.experience);
          setNewPassword(d.password);
          setNewCategory(d.specialization);
          setImageUri(d.photoUrl);
        }
      }
    };

    load();
  }, [barberId]);

  /* ---------------- PICK IMAGE ---------------- */
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

  /* ---------------- SAVE STAFF (ADD / UPDATE) ---------------- */
  const saveStaff = async () => {
    if (!newName || !newExp || !newPassword) {
      return Alert.alert("⚠️ Error", "Please fill all fields.");
    }

    setUploading(true);
    let finalImage = imageUri;

    // Upload image only if it's new (not a URL)
    if (imageUri && !imageUri.startsWith("https://")) {
      finalImage = await uploadToCloudinary(imageUri);
    }

    try {
      if (barberId) {
        // UPDATE STAFF
        await updateDoc(doc(db, "barbers", barberId as string), {
          name: newName,
          experience: newExp,
          specialization: newCategory,
          password: newPassword,
          photoUrl: finalImage || "",
        });

        Alert.alert("Updated", "Staff updated successfully.");
      } else {
        // ADD NEW STAFF
        await addDoc(collection(db, "barbers"), {
          salonId,
          name: newName,
          experience: newExp,
          specialization: newCategory,
          password: newPassword,
          photoUrl: finalImage || "",
          createdAt: new Date().toISOString(),
        });

        Alert.alert("Success", "Staff added successfully.");
      }

      router.back(); // Go back to list
    } catch (e) {
      Alert.alert("Error", "Failed to save staff.");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <View style={{ flex: 1 }}>
      <ShopOwnerHeader openMenu={openMenu} title={barberId ? "Edit Staff" : "Add Staff"} />

      <ScrollView style={addStaffStyles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={addStaffStyles.pageTitle}>
          {barberId ? "✏️ Edit Staff" : "➕ Add Staff"}
        </Text>

        <TextInput
          placeholder="Name"
          style={addStaffStyles.inputField}
          value={newName}
          onChangeText={setNewName}
        />

        <TextInput
          placeholder="Experience"
          style={addStaffStyles.inputField}
          value={newExp}
          onChangeText={setNewExp}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={addStaffStyles.inputField}
          value={newPassword}
          onChangeText={setNewPassword}
        />

        {/* Category */}
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

        {/* Image */}
        <TouchableOpacity style={addStaffStyles.imageBox} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={addStaffStyles.profileImage} />
          ) : (
            <Text style={addStaffStyles.imagePlaceholder}>Pick Image</Text>
          )}
        </TouchableOpacity>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={[
            addStaffStyles.submitButton,
            uploading && { opacity: 0.6 },
          ]}
          disabled={uploading}
          onPress={saveStaff}
        >
          <Text style={addStaffStyles.submitButtonText}>
            {uploading ? "Saving..." : barberId ? "Update Staff" : "Add Staff"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FOOTER */}
      <ShopOwnerBottomNav />

      {/* LEFT MENU */}
      <LeftMenu visible={visible} slide={slide} closeMenu={closeMenu} />
    </View>
  );
}
