import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
import MapView, { Marker } from "react-native-maps";
import { db } from "../firebaseConfig";
import { colors, serviceStyles } from "../styles/theme";

export default function ShopOwnerGallery() {
  const [salonId, setSalonId] = useState<string | null>(null);

  const [shopPic, setShopPic] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [menuCards, setMenuCards] = useState<string[]>([]);

  // default to Bangalore if no location yet
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: 12.9716,
    longitude: 77.5946,
  });
  const [address, setAddress] = useState<string>("");

  // 💰 Slot Booking Amount
  const [slotBookingAmount, setSlotBookingAmount] = useState<string>("");

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

  // Load existing gallery
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
        if (data.slotBookingAmount) setSlotBookingAmount(String(data.slotBookingAmount));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 📸 Pick images
  const pickImage = async (type: "shop" | "gallery" | "menu") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert("Permission required", "Please allow photo access.");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: type !== "shop", // shopPic = single
      quality: 0.7,
    });

    if (!result.canceled) {
      if (type === "shop") {
        setShopPic(result.assets[0].uri);
      } else if (type === "gallery") {
        setGallery([...gallery, ...result.assets.map((a) => a.uri)]);
      } else if (type === "menu") {
        setMenuCards([...menuCards, ...result.assets.map((a) => a.uri)]);
      }
    }
  };

  // 🗑️ Delete image
  const deleteImage = (type: "gallery" | "menu", uri: string) => {
    if (type === "gallery") {
      setGallery(gallery.filter((img) => img !== uri));
    } else if (type === "menu") {
      setMenuCards(menuCards.filter((img) => img !== uri));
    }
  };

  // ✅ Save all to Firestore
  const saveAll = async () => {
    if (!salonId) return;
    try {
      const ref = doc(db, "galleries", salonId);
      await setDoc(
        ref,
        {
          salonId,
          shopPic,
          gallery,
          menuCards,
          location,
          address,
          slotBookingAmount: Number(slotBookingAmount), // ✅ Save amount as number
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      Alert.alert("✅ Gallery, Location & Slot Amount saved");
    } catch (e) {
      console.error(e);
      Alert.alert("❌ Failed to save gallery");
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
                style={{
                width: "100%",       // full width
                height: 200,         // adjust as needed (banner style)
                borderRadius: 8,
                marginBottom: 1,
                }}
                resizeMode="cover"     // image will scale properly
            />
            )}

        {/* --- Shop Gallery --- */}
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
                <Text style={{ color: "white", fontSize: 12 }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* --- Menu Cards --- */}
        <Text style={{ color: colors.textLight, fontWeight: "600", marginBottom: 8 }}>
          🍽️ Menu Cards (Multiple)
        </Text>
        <TouchableOpacity style={serviceStyles.imageBox} onPress={() => pickImage("menu")}>
          <Text style={serviceStyles.imagePlaceholder}>Add Menu Cards</Text>
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
                <Text style={{ color: "white", fontSize: 12 }}>✕</Text>
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

        {/* --- Slot Booking Amount --- */}
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
        {location && (
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

        {/* Save All */}
        <TouchableOpacity style={serviceStyles.submitButton} onPress={saveAll}>
          <Text style={serviceStyles.submitButtonText}>Save Gallery, Location & Amount</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
