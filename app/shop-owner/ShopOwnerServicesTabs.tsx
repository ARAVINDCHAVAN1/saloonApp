// app/shop-owner/ShopOwnerServicesTabs.tsx
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
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import { db } from "../../src/firebase/firebaseConfig";
import { colors, serviceStyles } from "../../styles/theme";

import ServiceList from "./ServiceList";
import ShopOwnerHeader from "./ShopOwnerHeader";
import ShopOwnerBottomNav from "./ShopOwnerBottomNav";
import LeftMenu from "./LeftMenu";

// Categories
const CATEGORIES = ["Men", "Women", "Spa"];
const TABS = ["Add Service", "Service List"];

export default function ShopOwnerServicesTabs() {
  const { serviceId } = useLocalSearchParams(); // 👈 read passed ID

  const [activeTab, setActiveTab] = useState("Add Service");
  const [salonId, setSalonId] = useState<string | null>(null);
  const [serviceDocId, setServiceDocId] = useState<string | null>(null);

  // Form fields
  const [newService, setNewService] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [category, setCategory] = useState("Men");

  /* ---------- MENU ---------- */
  const [visible, setVisible] = useState(false);
  const slide = useRef(new Animated.Value(-270)).current;

  const openMenu = () => {
    setVisible(true);
    Animated.timing(slide, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const closeMenu = () =>
    Animated.timing(slide, { toValue: -270, duration: 200, useNativeDriver: false }).start(() =>
      setVisible(false)
    );

  /* ---------- Load Salon ID ---------- */
  useEffect(() => {
    const init = async () => {
      const sid = await AsyncStorage.getItem("shopId");
      setSalonId(sid);
    };
    init();
  }, []);

  /* ---------- If editing, load the service ---------- */
  useEffect(() => {
    if (!serviceId) return;

    setActiveTab("Add Service"); // switch tab automatically
    loadServiceData(serviceId.toString());
  }, [serviceId]);

  const loadServiceData = async (id: string) => {
    try {
      const snap = await getDoc(doc(db, "services", id));
      if (!snap.exists()) return;

      const data: any = snap.data();

      setServiceDocId(id); // store for updating
      setNewService(data.name);
      setPrice(String(data.price));
      setImages(data.images || []);
      setCategory(data.category || "Men");
    } catch (err) {
      console.log("Error loading edit service:", err);
    }
  };

  /* ---------- Image Picker ---------- */
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Enable photo access to continue.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages(result.assets.map((a) => a.uri));
    }
  };

  /* ---------- SAVE / UPDATE SERVICE ---------- */
  const saveService = async () => {
    if (!newService || !price)
      return Alert.alert("⚠️ Enter all details");

    try {
      if (serviceDocId) {
        // UPDATE MODE
        await updateDoc(doc(db, "services", serviceDocId), {
          name: newService,
          price: Number(price),
          category,
          images,
        });

        Alert.alert("✅ Service Updated");
      } else {
        // ADD MODE
        await addDoc(collection(db, "services"), {
          salonId: salonId || "global",
          name: newService,
          price: Number(price),
          category,
          images,
          createdAt: new Date().toISOString(),
        });

        Alert.alert("✅ Service Added");
      }

      // Reset
      setServiceDocId(null);
      setNewService("");
      setPrice("");
      setImages([]);
      setCategory("Men");

      setActiveTab("Service List");
    } catch (err) {
      console.log(err);
      Alert.alert("❌ Error", "Failed to save service");
    }
  };

  /* -------------------------------------------------------------------------- */

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ShopOwnerHeader openMenu={openMenu} title="Manage Services" />

      <View style={{ flex: 1, padding: 16 }}>
        {/* Tabs */}
        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          {TABS.map((tab) => {
            const active = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
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

        {/* ---------- TAB: Add / Edit Service ---------- */}
        {activeTab === "Add Service" ? (
          <View>
            <Text style={serviceStyles.title}>
              {serviceDocId ? "✏️ Edit Service" : "➕ Add Service"}
            </Text>

            <TextInput
              placeholder="Service Name"
              placeholderTextColor={colors.placeholder}
              style={serviceStyles.input}
              value={newService}
              onChangeText={setNewService}
            />

            <TextInput
              placeholder="Price"
              placeholderTextColor={colors.placeholder}
              style={serviceStyles.input}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            {/* Category */}
            <Text style={{ color: colors.textLight, marginBottom: 6 }}>
              Category (Now: {category})
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}>
              {CATEGORIES.map((c) => {
                const active = c === category;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[
                      serviceStyles.categoryChip,
                      active && serviceStyles.categoryChipActive,
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? colors.background : colors.textLight,
                        fontWeight: "600",
                      }}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Image Picker */}
            <TouchableOpacity style={serviceStyles.imageBox} onPress={pickImages}>
              <Text style={serviceStyles.imagePlaceholder}>📸 Pick Images</Text>
            </TouchableOpacity>

            {/* Preview */}
            <View style={{ flexDirection: "row", marginBottom: 12 }}>
              {images.map((uri, idx) => (
                <Image key={idx} source={{ uri }} style={serviceStyles.previewImage} />
              ))}
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity style={serviceStyles.submitButton} onPress={saveService}>
              <Text style={serviceStyles.submitButtonText}>
                {serviceDocId ? "Update Service" : "Add Service"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ServiceList />
        )}
      </View>

      <ShopOwnerBottomNav />

      <LeftMenu visible={visible} slide={slide} closeMenu={closeMenu} />
    </View>
  );
}
