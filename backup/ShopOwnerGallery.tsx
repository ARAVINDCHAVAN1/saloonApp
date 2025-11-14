import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebaseConfig";
import { colors, serviceStyles } from "../styles/theme";

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
  const [uploading, setUploading] = useState(false);

  // ✅ Cloudinary Config
  const CLOUD_NAME = "dxuvabjwx";
  const UPLOAD_PRESET = "expo_upload";

  // 🔹 Load salonId & existing data
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

  // 🔹 Load gallery data from Firestore
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
      }
    } catch (e) {
      console.error("Error loading gallery:", e);
    }
  };

  // 🔹 Upload image to Cloudinary
  const uploadToCloudinary = async (imageUri: string, retry = false): Promise<string | null> => {
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

      if (result.secure_url) {
        console.log("✅ Uploaded to Cloudinary:", result.secure_url);
        return result.secure_url;
      } else {
        console.error("❌ Upload failed:", result);
        if (!retry) return uploadToCloudinary(imageUri, true);
        return null;
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      if (!retry) return uploadToCloudinary(imageUri, true);
      return null;
    }
  };

  // 📸 Pick image for shop/gallery/menu (✅ Promise.all fixed version)
  const pickImage = async (type: "shop" | "gallery" | "menu") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert("Permission required", "Please allow photo access.");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: type !== "shop",
      quality: 0.7,
    });

    if (result.canceled) return;

    setUploading(true);
    Alert.alert("⏳ Uploading...", "Please wait while images are uploading...");

    try {
      if (type === "shop") {
        // Single upload
        const uploaded = await uploadToCloudinary(result.assets[0].uri);
        if (uploaded) setShopPic(uploaded);
      } else {
        // Multiple upload handled in parallel
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

      Alert.alert("✅ Upload complete!");
    } catch (error) {
      console.error("❌ Upload error:", error);
      Alert.alert("Upload failed", "Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // 🗑️ Delete image from preview
  const deleteImage = (type: "gallery" | "menu", uri: string) => {
    if (type === "gallery") setGallery(gallery.filter((img) => img !== uri));
    else if (type === "menu") setMenuCards(menuCards.filter((img) => img !== uri));
  };

  // 💾 Save all to Firestore (✅ filters out local URIs)
  const saveAll = async () => {
    if (!salonId) return Alert.alert("Salon ID missing!");
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
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      console.log("✅ Firestore updated with Cloudinary URLs only");
      setUploading(false);
      Alert.alert("✅ All data saved successfully!");
    } catch (e) {
      console.error("Error saving gallery:", e);
      setUploading(false);
      Alert.alert("❌ Failed to save gallery data");
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

        {/* --- Gallery Section --- */}
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

        {/* --- Menu Cards --- */}
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

        {/* --- Address Input --- */}
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

        {/* --- Map Section (Native Only) --- */}
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
          style={[
            serviceStyles.submitButton,
            uploading && { backgroundColor: "#999" },
          ]}
          onPress={saveAll}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={serviceStyles.submitButtonText}>
              Save Gallery, Location & Amount
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
