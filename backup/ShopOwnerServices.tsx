import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
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
import { db } from "../firebaseConfig";
import { colors, serviceStyles } from "../styles/theme";
import ShopOwnerHeader from "./ShopOwnerHeader";

// ✅ Categories: Men, Women, Spa
const CATEGORIES = ["Men", "Women", "Spa"];

export default function ShopOwnerServices() {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams();
  const [salonId, setSalonId] = useState<string | null>(null);
  const [newService, setNewService] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [category, setCategory] = useState("Men"); // ✅ default category
  const [editing, setEditing] = useState(false);

  // Load salonId + service if editing
  useEffect(() => {
    const init = async () => {
      const sid = await AsyncStorage.getItem("shopId");
      setSalonId(sid);

      if (serviceId) {
        setEditing(true);
        const ref = doc(db, "services", serviceId as string);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data: any = snap.data();
          setNewService(data.name || "");
          setPrice(String(data.price || ""));
          setImages(data.images || []);
          setCategory(data.category || "Men");
        }
      }
    };
    init();
  }, [serviceId]);

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
      setImages([...images, ...result.assets.map((a) => a.uri)]);
    }
  };

  // 🗑️ Delete image
  const deleteImage = (uri: string) => {
    setImages(images.filter((img) => img !== uri));
  };

  // Save Service (Add or Update)
  const saveService = async () => {
    if (!newService || !price || !category)
      return Alert.alert("⚠️ Enter service, price and category");

    try {
      if (editing && serviceId) {
        // 🔄 Update
        await updateDoc(doc(db, "services", serviceId as string), {
          name: newService,
          price: Number(price),
          category,
          images,
          updatedAt: new Date().toISOString(),
        });
        Alert.alert("✅ Service updated");
      } else {
        // ➕ Add
        const newDoc = {
          salonId: salonId || "global",
          name: newService,
          price: Number(price),
          category,
          images,
          createdAt: new Date().toISOString(),
        };
        await addDoc(collection(db, "services"), newDoc);
        Alert.alert("✅ Service added");
      }

      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert("❌ Failed to save service");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ShopOwnerHeader title={editing ? "✏️ Edit Service" : "➕ Add Service"} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Service Name */}
        <TextInput
          placeholder="Service Name"
          placeholderTextColor={colors.placeholder}
          style={serviceStyles.input}
          value={newService}
          onChangeText={setNewService}
        />

        {/* Price */}
        <TextInput
          placeholder="Price"
          placeholderTextColor={colors.placeholder}
          style={serviceStyles.input}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        {/* ✅ Category Selection */}
        <Text
          style={{
            color: colors.textLight,
            marginBottom: 6,
            fontWeight: "600",
          }}
        >
          Select Category (Currently: {category})
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
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
                    fontWeight: active ? "700" : "500",
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

        {/* Preview selected images with delete option */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
          {images.map((uri, idx) => (
            <View key={idx} style={{ position: "relative", marginRight: 8, marginBottom: 8 }}>
              <Image source={{ uri }} style={serviceStyles.previewImage} />
              {/* Delete Button */}
              <TouchableOpacity
                onPress={() => deleteImage(uri)}
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  backgroundColor: "red",
                  borderRadius: 12,
                  padding: 4,
                }}
              >
                <Text style={{ color: "white", fontSize: 12 }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Save */}
        <TouchableOpacity style={serviceStyles.submitButton} onPress={saveService}>
          <Text style={serviceStyles.submitButtonText}>
            {editing ? "Update Service" : "Add Service"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
