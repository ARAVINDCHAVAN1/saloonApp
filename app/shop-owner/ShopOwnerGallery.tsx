import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { db } from "../../src/firebase/firebaseConfig";
import { colors, serviceStyles } from "../../styles/theme";

// ✅ Conditionally import react-native-maps only for native builds
let MapView: any = null;
let Marker: any = null;
if (Platform.OS !== "web") {
  const Maps = require("react-native-maps");
  MapView = Maps.default;
  Marker = Maps.Marker;
}

export default function ShopOwnerGallery() {
  const [salonId, setSalonId] = useState<string | null>(null);
  const [shopPic, setShopPic] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [menuCards, setMenuCards] = useState<string[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: 12.9716,
    longitude: 77.5946,
  });
  const [address, setAddress] = useState<string>("");
  const [slotBookingAmount, setSlotBookingAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const CLOUD_NAME = "dxuvabjwx";
  const UPLOAD_PRESET = "expo_upload";

  useEffect(() => {
    const init = async () => {
      const sid = await AsyncStorage.getItem("shopId");
      if (sid) {
        setSalonId(sid);
        loadGallery(sid);
      }
    };
    init();
  }, []);

  // 🔹 Load data
  const loadGallery = async (sid: string) => {
    try {
      const ref = doc(db, "galleries", sid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data: any = snap.data();
        setShopPic(data.shopPic || null);
        setGallery(data.gallery || []);
        setMenuCards(data.menuCards || []);
        if (data.location) setLocation(data.location);
        if (data.address) setAddress(data.address);
        if (data.slotBookingAmount)
          setSlotBookingAmount(String(data.slotBookingAmount));
        if (data.category) setCategory(data.category);
      }
    } catch (e) {
      console.error("Error loading gallery:", e);
      Toast.show({
        type: "error",
        text1: "Failed to load data",
        text2: "Please check your internet connection.",
      });
    }
  };

  // 🔹 Upload image to Cloudinary
  const uploadToCloudinary = async (imageUri: string): Promise<string | null> => {
    try {
      const data = new FormData();
      data.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "upload.jpg",
      } as any);
      data.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (result.secure_url) return result.secure_url;

      throw new Error("Upload failed");
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      Toast.show({
        type: "error",
        text1: "Upload failed",
        text2: "Please try again later.",
      });
      return null;
    }
  };

  // 📸 Pick Image
  const pickImage = async (type: "shop" | "gallery" | "menu") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Toast.show({
        type: "info",
        text1: "Permission required",
        text2: "Please allow gallery access.",
      });
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: type !== "shop",
      quality: 0.7,
    });

    if (result.canceled) return;

    setUploading(true);
    Toast.show({
      type: "info",
      text1: "Uploading...",
      text2: "Please wait while images are uploading.",
    });

    try {
      if (type === "shop") {
        const uploaded = await uploadToCloudinary(result.assets[0].uri);
        if (uploaded) setShopPic(uploaded);
      } else {
        const uploadPromises = result.assets.map((asset) =>
          uploadToCloudinary(asset.uri)
        );
        const uploadedUrls = await Promise.all(uploadPromises);
        const validUrls = uploadedUrls.filter((url): url is string => !!url);
        if (validUrls.length > 0) {
          if (type === "gallery") setGallery((prev) => [...prev, ...validUrls]);
          if (type === "menu") setMenuCards((prev) => [...prev, ...validUrls]);
        }
      }

      Toast.show({
        type: "success",
        text1: "Upload complete",
        text2: "Images uploaded successfully!",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Upload failed",
        text2: "Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  // 🗑️ Delete image
  const deleteImage = (type: "gallery" | "menu", uri: string) => {
    if (type === "gallery") setGallery(gallery.filter((img) => img !== uri));
    else if (type === "menu") setMenuCards(menuCards.filter((img) => img !== uri));
    Toast.show({ type: "info", text1: "Image removed" });
  };

  // 💾 Save all data
  const saveAll = async () => {
    if (!salonId)
      return Toast.show({ type: "error", text1: "Salon ID missing!" });
    if (!category)
      return Toast.show({ type: "info", text1: "Please select a category!" });
    if (!shopPic)
      return Toast.show({ type: "info", text1: "Please upload a shop picture!" });
    if (!address.trim())
      return Toast.show({ type: "info", text1: "Address cannot be empty!" });
    if (!slotBookingAmount)
      return Toast.show({
        type: "info",
        text1: "Enter a slot booking amount!",
      });

    try {
      setUploading(true);

      const cleanGallery = gallery.filter((uri) => uri.startsWith("https://"));
      const cleanMenu = menuCards.filter((uri) => uri.startsWith("https://"));
      const cleanShopPic = shopPic && shopPic.startsWith("https://") ? shopPic : null;

      await setDoc(
        doc(db, "galleries", salonId),
        {
          salonId,
          shopPic: cleanShopPic,
          gallery: cleanGallery,
          menuCards: cleanMenu,
          location,
          address,
          slotBookingAmount: Number(slotBookingAmount),
          category,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      Toast.show({
        type: "success",
        text1: "Saved successfully",
        text2: "Gallery, category & location updated!",
      });
    } catch (e) {
      console.error("Error saving gallery:", e);
      Toast.show({
        type: "error",
        text1: "Failed to save",
        text2: "Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* --- Shop Picture --- */}
        <Text style={{ color: colors.textLight, fontWeight: "600", marginBottom: 8 }}>
          🏪 Shop Picture (Single)
        </Text>
        <TouchableOpacity style={serviceStyles.imageBox} onPress={() => pickImage("shop")}>
          <Text style={serviceStyles.imagePlaceholder}>
            {shopPic ? "Change Shop Picture" : "Pick Shop Picture"}
          </Text>
        </TouchableOpacity>

        {shopPic && (
          <Image
            source={{ uri: shopPic }}
            style={{ width: "100%", height: 200, borderRadius: 8, marginBottom: 10 }}
            resizeMode="cover"
          />
        )}

        {/* --- Category --- */}
        <Text style={{ color: colors.textLight, fontWeight: "600", marginBottom: 8 }}>
          🏷️ Select Category
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 16 }}>
          {["Men", "Women", "Spa"].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setCategory(item)}
              style={{
                backgroundColor: category === item ? colors.primary : "#ddd",
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  color: category === item ? "#000" : "#333",
                  fontWeight: "600",
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- Gallery --- */}
        <Text style={{ color: colors.textLight, fontWeight: "600", marginBottom: 8 }}>
          📸 Shop Gallery (Multiple)
        </Text>
        <TouchableOpacity style={serviceStyles.imageBox} onPress={() => pickImage("gallery")}>
          <Text style={serviceStyles.imagePlaceholder}>Add Gallery Images</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 12 }}>
          {gallery.map((uri, idx) => (
            <View key={idx} style={{ marginRight: 8, marginBottom: 8, position: "relative" }}>
              <Image source={{ uri }} style={serviceStyles.previewImage} />
              <TouchableOpacity
                onPress={() => deleteImage("gallery", uri)}
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  backgroundColor: "red",
                  borderRadius: 12,
                  padding: 4,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 12 }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* --- Menu --- */}
        <Text style={{ color: colors.textLight, fontWeight: "600", marginBottom: 8 }}>
          🍽️ Menu Cards (Multiple)
        </Text>
        <TouchableOpacity style={serviceStyles.imageBox} onPress={() => pickImage("menu")}>
          <Text style={serviceStyles.imagePlaceholder}>Add Menu Card Images</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 12 }}>
          {menuCards.map((uri, idx) => (
            <View key={idx} style={{ marginRight: 8, marginBottom: 8, position: "relative" }}>
              <Image source={{ uri }} style={serviceStyles.previewImage} />
              <TouchableOpacity
                onPress={() => deleteImage("menu", uri)}
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  backgroundColor: "red",
                  borderRadius: 12,
                  padding: 4,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 12 }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* --- Address --- */}
        <Text style={{ color: colors.textLight, fontWeight: "600", marginBottom: 8 }}>
          📍 Salon Address
        </Text>
        <TextInput
          placeholder="Enter salon address"
          value={address}
          onChangeText={setAddress}
          style={{
            height: 40,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 10,
            marginBottom: 10,
            color: colors.textLight,
          }}
        />

        {/* --- Booking Amount --- */}
        <Text style={{ color: colors.textLight, fontWeight: "600", marginBottom: 8 }}>
          💰 Slot Booking Amount
        </Text>
        <TextInput
          placeholder="Enter booking amount"
          keyboardType="numeric"
          value={slotBookingAmount}
          onChangeText={setSlotBookingAmount}
          style={{
            height: 40,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 10,
            marginBottom: 16,
            color: colors.textLight,
          }}
        />

        {/* --- Map --- */}
        {Platform.OS !== "web" && MapView && (
          <MapView
            style={{ width: "100%", height: 200, borderRadius: 8, marginBottom: 16 }}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker
              draggable
              coordinate={location}
              onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
            />
          </MapView>
        )}

        {/* --- Save Button --- */}
        <TouchableOpacity
          style={[serviceStyles.submitButton, uploading && { backgroundColor: "#999" }]}
          onPress={saveAll}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={serviceStyles.submitButtonText}>
              Save Gallery, Category & Location
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* ✅ Toast Component */}
      <Toast />
    </View>
  );
}
