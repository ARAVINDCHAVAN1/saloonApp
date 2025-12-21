// app/shop-owner/ShopOwnerGallery.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image, Platform, ScrollView, Text, TextInput,
  TouchableOpacity, View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Toast from "react-native-toast-message";
import { db } from "../../src/firebase/firebaseConfig";
import { colors, serviceStyles } from "../../styles/theme";
import LeftMenu from "./LeftMenu";
import ShopOwnerBottomNav from "./ShopOwnerBottomNav";
import ShopOwnerHeader from "./ShopOwnerHeader";

export default function ShopOwnerGallery() {
  const [salonId, setSalonId] = useState<string | null>(null);
  const [shopPic, setShopPic] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [menuCards, setMenuCards] = useState<string[]>([]);
  const [location, setLocation] = useState({ latitude: 12.9716, longitude: 77.5946 });

  const [address, setAddress] = useState("");
  const [fullMapAddress, setFullMapAddress] = useState("");

  const [slotBookingAmount, setSlotBookingAmount] = useState("");
  const [advanceBookingAmount, setAdvanceBookingAmount] = useState("");
  const [category, setCategory] = useState("");

  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const slide = useRef(new Animated.Value(-270)).current;

  const CLOUD_NAME = "dxuvabjwx";
  const UPLOAD_PRESET = "expo_upload";

  useEffect(() => {
    (async () => {
      const sid = await AsyncStorage.getItem("shopId");
      if (sid) {
        setSalonId(sid);
        loadGallery(sid);
      }
    })();
  }, []);

  const loadGallery = async (sid: string) => {
    try {
      const snap = await getDoc(doc(db, "galleries", sid));
      if (snap.exists()) {
        const d: any = snap.data();
        setShopPic(d.shopPic || null);
        setGallery(d.gallery || []);
        setMenuCards(d.menuCards || []);
        if (d.location) setLocation(d.location);

        if (d.address) setAddress(d.address);
        if (d.fullMapAddress) setFullMapAddress(d.fullMapAddress);

        if (d.category) setCategory(d.category);
        if (d.slotBookingAmount) setSlotBookingAmount(String(d.slotBookingAmount));
        if (d.advanceBookingAmount) setAdvanceBookingAmount(String(d.advanceBookingAmount));
      }
    } catch {
      Toast.show({ type: "error", text1: "Load failed" });
    }
  };

  const updateAddressFromCoords = async (coords: any) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const res = await Location.reverseGeocodeAsync(coords);
      if (res.length > 0) {
        const a = res[0];
        const full = [a.name, a.street, a.city, a.region, a.postalCode].filter(Boolean).join(", ");

        setAddress(full);
        setFullMapAddress(full);
      }
    } catch {}
  };

  const uploadToCloudinary = async (uri: string) => {
    try {
      const fd = new FormData();
      fd.append("file", { uri, type: "image/jpeg", name: "img.jpg" } as any);
      fd.append("upload_preset", UPLOAD_PRESET);

      const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: fd,
      });

      const j = await r.json();
      return j.secure_url || null;
    } catch {
      Toast.show({ type: "error", text1: "Upload failed" });
      return null;
    }
  };

  const pickImage = async (type: "shop" | "gallery" | "menu") => {
    if (!editMode) return Toast.show({ type: "info", text1: "Enable edit mode" });

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Toast.show({ type: "error", text1: "Permission denied" });

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: type !== "shop",
      quality: 0.7,
    });

    if (res.canceled) return;

    setUploading(true);

    if (type === "shop") {
      const up = await uploadToCloudinary(res.assets[0].uri);
      if (up) setShopPic(up);
    } else {
      const ups = await Promise.all(res.assets.map((i) => uploadToCloudinary(i.uri)));
      const v = ups.filter(Boolean) as string[];
      if (type === "gallery") setGallery([...gallery, ...v]);
      else setMenuCards([...menuCards, ...v]);
    }

    setUploading(false);
  };

  const deleteImage = (type: "gallery" | "menu", uri: string) => {
    if (!editMode) return;
    if (type === "gallery") setGallery(gallery.filter((i) => i !== uri));
    else setMenuCards(menuCards.filter((i) => i !== uri));
  };

  const saveAll = async () => {
    if (!editMode) return;
    if (!salonId) return;

    try {
      setUploading(true);

      await setDoc(
        doc(db, "galleries", salonId),
        {
          salonId,
          shopPic,
          gallery,
          menuCards,
          location,
          address,
          fullMapAddress,
          category,
          slotBookingAmount: Number(slotBookingAmount || 0),
          advanceBookingAmount: Number(advanceBookingAmount || 0),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setEditMode(false);
      Toast.show({ type: "success", text1: "Saved successfully" });
    } catch {
      Toast.show({ type: "error", text1: "Save failed" });
    }
    setUploading(false);
  };

const [searchPlace, setSearchPlace] = useState("");
const [searchingPlace, setSearchingPlace] = useState(false);

const searchLocationOnMap = async () => {
  if (!searchPlace.trim()) {
    Toast.show({ type: "info", text1: "Enter a location" });
    return;
  }

  try {
    setSearchingPlace(true);

    const res = await Location.geocodeAsync(searchPlace);

    if (res.length === 0) {
      Toast.show({ type: "error", text1: "Location not found" });
      return;
    }

    const coords = {
      latitude: res[0].latitude,
      longitude: res[0].longitude,
    };

    setLocation(coords);
    await updateAddressFromCoords(coords);

  } catch {
    Toast.show({ type: "error", text1: "Search failed" });
  } finally {
    setSearchingPlace(false);
  }
};


const handleMapPress = async (e: any) => {
  if (!editMode) return;

  const coords = e.nativeEvent.coordinate;

  setLocation({
    latitude: coords.latitude,
    longitude: coords.longitude,
  });

  await updateAddressFromCoords(coords);
};

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ShopOwnerHeader
        title="Gallery"
        openMenu={() => {
          setMenuVisible(true);
          Animated.timing(slide, { toValue: 0, duration: 200, useNativeDriver: false }).start();
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 160 }}>
        <TouchableOpacity
          onPress={() => setEditMode(!editMode)}
          style={{
            backgroundColor: editMode ? "orange" : colors.primary,
            padding: 10, borderRadius: 8, alignSelf: "flex-end", marginBottom: 20,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            {editMode ? "Editing Enabled" : "Enable Edit"}
          </Text>
        </TouchableOpacity>

        <Text style={st.label}>Shop Picture</Text>
        <TouchableOpacity style={serviceStyles.imageBox} onPress={() => pickImage("shop")}>
          <Text style={serviceStyles.imagePlaceholder}>Upload / Change</Text>
        </TouchableOpacity>
        {shopPic && <Image source={{ uri: shopPic }} style={st.mainImg} />}

        <Text style={st.label}>Category</Text>
        <View style={st.row}>
          {["Men", "Women", "Spa", "Unisex"].map((c) => (   // ⭐ ADDED UNISEX HERE
            <TouchableOpacity
              key={c}
              onPress={() => editMode && setCategory(c)}
              style={[st.catBtn, { backgroundColor: category === c ? colors.primary : "#ccc" }]}
            >
              <Text>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={st.label}>Gallery Images</Text>
        <TouchableOpacity style={serviceStyles.imageBox} onPress={() => pickImage("gallery")}>
          <Text style={serviceStyles.imagePlaceholder}>Add Images</Text>
        </TouchableOpacity>

        <View style={st.wrap}>
          {gallery.map((u, i) => (
            <View key={i} style={st.imgWrap}>
              <Image source={{ uri: u }} style={serviceStyles.previewImage} />
              {editMode && (
                <TouchableOpacity style={st.delBtn} onPress={() => deleteImage("gallery", u)}>
                  <Text style={st.delTxt}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <Text style={st.label}>Menu Cards</Text>
        <TouchableOpacity style={serviceStyles.imageBox} onPress={() => pickImage("menu")}>
          <Text style={serviceStyles.imagePlaceholder}>Add Menu Cards</Text>
        </TouchableOpacity>

        <View style={st.wrap}>
          {menuCards.map((u, i) => (
            <View key={i} style={st.imgWrap}>
              <Image source={{ uri: u }} style={serviceStyles.previewImage} />
              {editMode && (
                <TouchableOpacity style={st.delBtn} onPress={() => deleteImage("menu", u)}>
                  <Text style={st.delTxt}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <Text style={st.label}>Slot Amount</Text>
        <TextInput
          editable={editMode}
          value={slotBookingAmount}
          onChangeText={setSlotBookingAmount}
          placeholder="Amount"
          keyboardType="numeric"
          style={serviceStyles.input}
        />

        <Text style={st.label}>Advance Booking Amount</Text>
        <TextInput
          editable={editMode}
          value={advanceBookingAmount}
          onChangeText={setAdvanceBookingAmount}
          placeholder="Advance Amount"
          keyboardType="numeric"
          style={serviceStyles.input}
        />
<Text style={st.label}>Search Location</Text>

<View style={{ flexDirection: "row", gap: 8 }}>
  <TextInput
    placeholder="Search area, city, landmark"
    value={searchPlace}
    onChangeText={setSearchPlace}
    style={[serviceStyles.input, { flex: 1 }]}
  />

  <TouchableOpacity
    onPress={searchLocationOnMap}
    style={{
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      justifyContent: "center",
      borderRadius: 8,
    }}
  >
    {searchingPlace ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <Text style={{ color: "#fff", fontWeight: "700" }}>Go</Text>
    )}
  </TouchableOpacity>
</View>


{Platform.OS !== "web" && (
  <MapView
    
  style={st.map}
  region={{
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  }}
  onPress={handleMapPress}
  >
    <Marker
      coordinate={location}
      draggable={editMode}
      onDragEnd={async (e) => {
        const coords = e.nativeEvent.coordinate;
        setLocation(coords);
        await updateAddressFromCoords(coords);
      }}
    />
  </MapView>
)}


        <Text style={st.label}>Full Map Address (Google Maps)</Text>
        <TextInput
          editable={editMode}
          placeholder="Full Google Maps Address"
          value={fullMapAddress}
          onChangeText={setFullMapAddress}
          style={serviceStyles.input}
        />

        {editMode && (
          <TouchableOpacity
            style={[serviceStyles.submitButton, uploading && { opacity: 0.5 }]}
            onPress={saveAll}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={serviceStyles.submitButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      <ShopOwnerBottomNav />

      <LeftMenu
        visible={menuVisible}
        slide={slide}
        closeMenu={() => {
          Animated.timing(slide, { toValue: -270, duration: 200, useNativeDriver: false }).start(
            () => setMenuVisible(false)
          );
        }}
      />

      <Toast />
    </View>
  );
}

const st = {
  label: { color: colors.textLight, marginTop: 20 },
  row: { flexDirection: "row", marginVertical: 12 },
  catBtn: { padding: 10, marginRight: 10, borderRadius: 10 },
  wrap: { flexDirection: "row", flexWrap: "wrap" },
  imgWrap: { margin: 6 },
  delBtn: {
    backgroundColor: "red", position: "absolute", right: -6, top: -6,
    padding: 4, borderRadius: 12,
  },
  delTxt: { color: "#fff" },
  mainImg: { width: "100%", height: 200, borderRadius: 8 },
  map: {
    width: "100%", height: 200, borderRadius: 10, marginTop: 20, marginBottom: 20,
  },
};
