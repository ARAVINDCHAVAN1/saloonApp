import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../src/firebase/firebaseConfig";
import { colors, serviceStyles } from "../../styles/theme";
import ServiceList from "./ServiceList";

// ✅ Categories
const CATEGORIES = ["Men", "Women", "Spa"];
const TABS = ["Add Service", "Service List"];

export default function ShopOwnerServicesTabs() {
  const [activeTab, setActiveTab] = useState("Add Service");
  const [salonId, setSalonId] = useState<string | null>(null);
  const [newService, setNewService] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [category, setCategory] = useState("Men"); // ✅ default category

  useEffect(() => {
    const init = async () => {
      const sid = await AsyncStorage.getItem("shopId");
      setSalonId(sid);
    };
    init();
  }, []);

  // 📸 Pick multiple images
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow photo access.");
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

  // ➕ Add new service
  const addService = async () => {
    if (!newService || !price || !category)
      return Alert.alert("⚠️ Enter service, price and category");
    try {
      const newDoc = {
        salonId: salonId || "global",
        name: newService,
        price: Number(price),
        category, // ✅ Save category
        images,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "services"), newDoc);

      Alert.alert("✅ Service added");
      setNewService("");
      setPrice("");
      setImages([]);
      setCategory("Men");
      setActiveTab("Service List"); // switch to list tab
    } catch (e) {
      console.error(e);
      Alert.alert("❌ Failed to add service");
    }
  };

  return (
    <View style={serviceStyles.screen}>
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

      {/* Tab Content */}
      {activeTab === "Add Service" ? (
        <View>
          <Text style={serviceStyles.title}>➕ Add Service</Text>

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

          {/* ✅ Category Section */}
          <Text
            style={{
              color: colors.textLight,
              marginBottom: 6,
              fontWeight: "600",
            }}
          >
            Select Category (Currently: {category})
          </Text>

          <View
            style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}
          >
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
                style={[
                  serviceStyles.categoryText,
                  { color: active ? colors.background : colors.textLight }, 
                ]}
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

          {/* Preview selected images */}
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            {images.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={serviceStyles.previewImage} />
            ))}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={serviceStyles.submitButton}
            onPress={addService}
          >
            <Text style={serviceStyles.submitButtonText}>Add Service</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ServiceList /> // ✅ Dedicated Service List with edit + delete
      )}
    </View>
  );
}
