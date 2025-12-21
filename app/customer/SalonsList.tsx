import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Stack, useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";

import menImg from "../assets/men.jpg";
import spaImg from "../assets/spa.jpg";
import unisexImg from "../assets/unisex.png";
import womenImg from "../assets/women.jpg";

const DEFAULT_IMAGE =
  "https://via.placeholder.com/200x200.png?text=Salon";

export default function SalonList() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [allSalons, setAllSalons] = useState<any[]>([]);
  const [salons, setSalons] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [mapRegion, setMapRegion] = useState<any>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [serviceCategory, setServiceCategory] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeSalonId, setActiveSalonId] = useState<string | null>(null);

  // 🔒 ensures location auto-fill happens ONLY once
  const locationFilledOnce = useRef(false);

  const categories = [
    { name: "Men", image: menImg },
    { name: "Women", image: womenImg },
    { name: "Spa", image: spaImg },
    { name: "Unisex", image: unisexImg },
  ];

  /* ---------- FETCH SALONS ---------- */
  useEffect(() => {
    (async () => {
      const snap = await getDocs(
        query(collection(db, "salons"), where("status", "==", "Approved"))
      );

      const gallerySnap = await getDocs(collection(db, "galleries"));
      const galleryMap: any = {};
      gallerySnap.docs.forEach((g) => {
        galleryMap[g.data().salonId] = g.data();
      });

      const list = snap.docs.map((d) => {
        const s: any = d.data();
        const g = galleryMap[d.id] || {};
        return {
          id: d.id,
          shopName: s.shopName,
          city: s.city,
          state: s.state,
          shopPic: g.shopPic || DEFAULT_IMAGE,
          category: g.category || "",
          rating: g.rating || 4.5,
          location:
            g.location?.latitude && g.location?.longitude
              ? {
                  latitude: g.location.latitude,
                  longitude: g.location.longitude,
                }
              : null,
        };
      });

      setAllSalons(list);
      setSalons(list);
    })();
  }, []);

  /* ---------- AUTO LOCATION (ONLY ONCE) ---------- */
  useEffect(() => {
    (async () => {
      if (locationFilledOnce.current) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setMapRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      });

      const addr = await Location.reverseGeocodeAsync(loc.coords);
      if (addr.length) {
        setSearch(
          addr[0].city ||
            addr[0].district ||
            addr[0].subregion ||
            ""
        );
        locationFilledOnce.current = true; // 🔒 lock forever
      }
    })();
  }, []);

  /* ---------- FILTER ---------- */
  useEffect(() => {
    let filtered = [...allSalons];

    if (!serviceCategory && selectedCategory) {
      filtered = filtered.filter((s) =>
        s.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.shopName.toLowerCase().includes(search.toLowerCase()) ||
          s.city?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setSalons(filtered);
  }, [search, selectedCategory, serviceCategory, allSalons]);

  /* ---------- MAP FOCUS ---------- */
  const focusOnSalon = (salon: any) => {
    if (!salon.location || !mapRef.current) return;

    setActiveSalonId(salon.id);

    mapRef.current.animateToRegion(
      {
        latitude: salon.location.latitude,
        longitude: salon.location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      600
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ================= MAP ================= */}
      {mapRegion && (
        <View style={{ height: 330 }}>
          <MapView  ref={mapRef}  style={{ flex: 1 }} region={mapRegion}>
            {salons
              .filter((s) => s.location)
              .map((s) => (
                <Marker
                  key={s.id}
                  coordinate={s.location}
                  title={s.shopName} // ✅ native label (no crop)
                  description={`${s.city}, ${s.state}`}
                />
              ))}
          </MapView>

          {/* SEARCH BAR */}
          <View
            style={{
              position: "absolute",
              top: 55,
              left: 15,
              right: 15,
              height: 56,
              backgroundColor: "#fff",
              borderRadius: 30,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              elevation: 6,
            }}
          >
            <Ionicons name="search-outline" size={22} />
            <TextInput
              value={search}
              onChangeText={(t) => setSearch(t)} // 🔒 no auto refill
              placeholder="Search salons"
              style={{ flex: 1, marginHorizontal: 10 }}
            />

            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={20} />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => setShowFilter(!showFilter)}>
              <Ionicons
                name="options-outline"
                size={22}
                color={
                  selectedCategory || serviceCategory
                    ? "#FFD700"
                    : "#000"
                }
              />
            </TouchableOpacity>
          </View>

          {/* BEAUTY THERAPIST */}
          <TouchableOpacity
            onPress={() => {
              setServiceCategory(!serviceCategory);
              setSelectedCategory(null);
            }}
            style={{
              position: "absolute",
              top: 115,
              left: 15,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: serviceCategory ? "#FFF6D6" : "#fff",
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 22,
              elevation: 4,
              borderWidth: serviceCategory ? 2 : 0,
              borderColor: "#FFD700",
            }}
          >
            <Ionicons name="medkit-outline" size={20} />
            <Text style={{ marginLeft: 8, fontWeight: "800" }}>
              Beauty Therapist
            </Text>
          </TouchableOpacity>

          {/* CATEGORY FILTER */}
          {showFilter && (
            <View
              style={{
                position: "absolute",
                top: 125,
                right: 15,
                backgroundColor: "#fff",
                borderRadius: 12,
                paddingVertical: 6,
                elevation: 6,
              }}
            >
              {categories.map((c) => {
                const active = selectedCategory === c.name;
                return (
                  <TouchableOpacity
                    key={c.name}
                    onPress={() => {
                      setSelectedCategory(active ? null : c.name);
                      setServiceCategory(false);
                      setShowFilter(false);
                    }}
                    style={{ alignItems: "center", padding: 8 }}
                  >
                    <Image
                      source={c.image}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 13,
                        borderWidth: active ? 2 : 0,
                        borderColor: colors.primary,
                      }}
                    />
                    {active && (
                      <Text style={{ fontSize: 12, fontWeight: "700" }}>
                        {c.name}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* ================= SALON LIST ================= */}
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 80 }}>
        {serviceCategory && (
          <Text style={{ textAlign: "center", marginTop: 40 }}>
            🚧 Beauty Therapist – Coming Soon
          </Text>
        )}

        {!serviceCategory &&
          salons.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => focusOnSalon(s)}
              style={{
                flexDirection: "row",
                backgroundColor: "#fff",
                borderRadius: 14,
                padding: 12,
                marginBottom: 14,
                elevation: activeSalonId === s.id ? 6 : 2,
                borderWidth: activeSalonId === s.id ? 2 : 0,
                borderColor: "#FFD700",
              }}
            >
              <Image
                source={{ uri: s.shopPic || DEFAULT_IMAGE }}
                style={{
                  width: 95,
                  height: 95,
                  borderRadius: 12,
                  marginRight: 12,
                }}
              />

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: "800" }}>
                  {s.shopName}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons
                      key={i}
                      name={
                        i <= Math.round(s.rating)
                          ? "star"
                          : "star-outline"
                      }
                      size={14}
                      color="#FFD700"
                    />
                  ))}
                  <Text style={{ marginLeft: 6, fontSize: 12 }}>
                    {s.rating.toFixed(1)}
                  </Text>
                </View>

                <Text style={{ color: "#666" }}>
                  {s.city}, {s.state}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginTop: 8,
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        `https://www.google.com/maps/dir/?api=1&destination=${s.location?.latitude},${s.location?.longitude}`
                      )
                    }
                  >
                    <Ionicons name="map-outline" size={20} />
                    <Text style={{ fontSize: 11 }}>Map</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      router.push(`/customer/salon-details?id=${s.id}`)
                    }
                    style={{ marginLeft: 20 }}
                  >
                    <Ionicons name="eye-outline" size={20} />
                    <Text style={{ fontSize: 11 }}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
}
