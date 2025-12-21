// app/shop-owner/ShopOwnerStaffTabs.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Animated,
  ScrollView,
  Image,
  TextInput,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

import { useLocalSearchParams } from "expo-router";
import { db } from "../../src/firebase/firebaseConfig";
import { colors, addStaffStyles } from "../../styles/theme";

import ShopOwnerHeader from "./ShopOwnerHeader";
import ShopOwnerBottomNav from "./ShopOwnerBottomNav";
import LeftMenu from "./LeftMenu";

const CATEGORIES = ["Men", "Women", "Spa"];
const TABS = ["Add Staff", "Staff List"];

export default function ShopOwnerStaffTabs() {
  const { barberId } = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState("Add Staff");

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
  const [staffList, setStaffList] = useState<any[]>([]);

  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [exp, setExp] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("Men");
  const [imageUri, setImageUri] = useState<string | null>(null);

  /* ---------------- LOAD INITIAL ---------------- */
  useEffect(() => {
    const load = async () => {
      const sid = await AsyncStorage.getItem("shopId");
      setSalonId(sid || "");

      fetchStaff(sid || "");
    };

    load();
  }, []);

  /* ---------------- LOAD STAFF FOR EDIT ---------------- */
  useEffect(() => {
    if (barberId) {
      setActiveTab("Add Staff");
      loadStaffForEdit(barberId.toString());
    }
  }, [barberId]);

  const loadStaffForEdit = async (id: string) => {
    const snap = await getDoc(doc(db, "barbers", id));
    if (!snap.exists()) return;

    const d: any = snap.data();

    setEditId(id);
    setName(d.name);
    setExp(d.experience);
    setPassword(d.password);
    setCategory(d.specialization);
    setImageUri(d.photoUrl);
  };

  /* ---------------- FETCH STAFF LIST ---------------- */
  const fetchStaff = async (sid: string) => {
    const q = query(collection(db, "barbers"), where("salonId", "==", sid));
    const snap = await getDocs(q);
    setStaffList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  /* ---------------- PICK IMAGE ---------------- */
  const pickImage = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  /* ---------------- SAVE STAFF ---------------- */
  const saveStaff = async () => {
    if (!name || !exp || !password)
      return Alert.alert("Error", "Fill all fields");

    if (editId) {
      await updateDoc(doc(db, "barbers", editId), {
        name,
        experience: exp,
        specialization: category,
        password,
        photoUrl: imageUri || "",
      });

      Alert.alert("Updated", "Staff updated successfully");
    } else {
      await addDoc(collection(db, "barbers"), {
        salonId,
        name,
        experience: exp,
        specialization: category,
        password,
        photoUrl: imageUri || "",
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Added", "Staff added successfully");
    }

    resetForm();
    fetchStaff(salonId);
    setActiveTab("Staff List");
  };

  /* ---------------- RESET FORM ---------------- */
  const resetForm = () => {
    setEditId(null);
    setName("");
    setExp("");
    setPassword("");
    setCategory("Men");
    setImageUri(null);
  };

  /* ---------------- DELETE STAFF ---------------- */
  const deleteStaff = async (id: string) => {
    await deleteDoc(doc(db, "barbers", id));
    fetchStaff(salonId);
  };

  /* =======================================================================================
     UI 
  ======================================================================================= */

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ShopOwnerHeader openMenu={openMenu} title="Manage Staff" />

      {/* TABS */}
      <View style={{ flexDirection: "row", margin: 12 }}>
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => {
                resetForm();
                setActiveTab(tab);
              }}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                marginHorizontal: 4,
                alignItems: "center",
                backgroundColor: active ? colors.primary : colors.cardBg,
              }}
            >
              <Text
                style={{
                  color: active ? colors.background : colors.textLight,
                  fontWeight: "600",
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ---------------- TAB 1: ADD / EDIT STAFF ---------------- */}
      {activeTab === "Add Staff" ? (
        <ScrollView style={{ padding: 16 }}>
          <Text style={[addStaffStyles.pageTitle, { color: "white" }]}>
            {editId ? "✏️ Edit Staff" : "➕ Add Staff"}
          </Text>

          {/* Name */}
          <TextInput
            placeholder="Name"
            placeholderTextColor={colors.placeholder}
            style={[addStaffStyles.inputField, { backgroundColor: colors.cardBg, color: "white" }]}
            value={name}
            onChangeText={setName}
          />

          {/* Experience */}
          <TextInput
            placeholder="Experience"
            placeholderTextColor={colors.placeholder}
            style={[addStaffStyles.inputField, { backgroundColor: colors.cardBg, color: "white" }]}
            value={exp}
            onChangeText={setExp}
          />

          {/* Password */}
          <TextInput
            placeholder="Password"
            secureTextEntry
            placeholderTextColor={colors.placeholder}
            style={[addStaffStyles.inputField, { backgroundColor: colors.cardBg, color: "white" }]}
            value={password}
            onChangeText={setPassword}
          />

          {/* Category */}
          <Text style={{ color: colors.textLight, marginVertical: 8 }}>
            Category
          </Text>

          <View style={addStaffStyles.categoryRow}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                style={[
                  addStaffStyles.categoryChip,
                  category === c && addStaffStyles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    addStaffStyles.categoryText,
                    category === c && addStaffStyles.categoryTextActive,
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Image Picker */}
          <TouchableOpacity style={addStaffStyles.imageBox} onPress={pickImage}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={addStaffStyles.profileImage}
              />
            ) : (
              <Text style={[addStaffStyles.imagePlaceholder, { color: "white" }]}>
                Pick Image
              </Text>
            )}
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity style={addStaffStyles.submitButton} onPress={saveStaff}>
            <Text style={addStaffStyles.submitButtonText}>
              {editId ? "Update Staff" : "Add Staff"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* ---------------- TAB 2: STAFF LIST ---------------- */
        <ScrollView style={{ padding: 16 }}>
          {staffList.map((b) => (
            <View
              key={b.id}
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: colors.cardBg,
                marginBottom: 12,
                flexDirection: "row",
              }}
            >
              <Image
                source={{ uri: b.photoUrl || "https://via.placeholder.com/80" }}
                style={{ width: 60, height: 60, borderRadius: 30, marginRight: 10 }}
              />

              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", color: "white" }}>{b.name}</Text>
                <Text style={{ color: colors.textLight }}>
                  {b.specialization} | {b.experience}
                </Text>

                <View style={{ flexDirection: "row", marginTop: 6 }}>
                  {/* Edit */}
                  <TouchableOpacity
                    onPress={() => {
                      loadStaffForEdit(b.id);
                      setActiveTab("Add Staff");
                    }}
                    style={{
                      backgroundColor: colors.primary,
                      padding: 8,
                      borderRadius: 6,
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ color: colors.background }}>Edit</Text>
                  </TouchableOpacity>

                  {/* Delete */}
                  <TouchableOpacity
                    onPress={() => deleteStaff(b.id)}
                    style={{
                      backgroundColor: "red",
                      padding: 8,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ color: "#fff" }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <ShopOwnerBottomNav />
      <LeftMenu visible={visible} slide={slide} closeMenu={closeMenu} />
    </View>
  );
}
