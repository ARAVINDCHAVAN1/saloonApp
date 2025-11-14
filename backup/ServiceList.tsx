import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../firebaseConfig";
import { colors, serviceStyles } from "../styles/theme";

export default function ServiceList() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [salonId, setSalonId] = useState("");

  useEffect(() => {
    const load = async () => {
      const sid = await AsyncStorage.getItem("shopId");
      if (!sid) return;
      setSalonId(sid);
      await fetchServices(sid);
    };
    load();
  }, []);

  const fetchServices = async (sid: string) => {
    const q = query(collection(db, "services"), where("salonId", "==", sid));
    const snap = await getDocs(q);
    setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Delete Service", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "services", id));
            setServices((prev) => prev.filter((s) => s.id !== id));
          } catch (err) {
            Alert.alert("❌ Error", "Failed to delete service");
          }
        },
      },
    ]);
  };

  return (
    <FlatList
      data={services}
      keyExtractor={(item) => item.id}
      style={serviceStyles.screen}
      renderItem={({ item }) => (
        <View
          style={[
            serviceStyles.card,
            {
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
            },
          ]}
        >
          {/* Left side → Service Info */}
          <View style={{ flex: 1 }}>
            <Text style={serviceStyles.cardTitle}>
              {item.name} - ₹{item.price}
            </Text>

            {/* ✅ Category */}
            <Text style={{ color: colors.textLight, fontSize: 13, marginTop: 2 }}>
              Category: {item.category || "N/A"}
            </Text>

            {/* Images */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: 6,
              }}
            >
              {item.images?.map((url: string, idx: number) => (
                <Image
                  key={idx}
                  source={{ uri: url }}
                  style={serviceStyles.cardImage}
                />
              ))}
            </View>
          </View>

          {/* Right side → Action Buttons */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Edit */}
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/ShopOwnerServices", // ✅ redirect to Add/Edit page
                  params: { serviceId: item.id },
                })
              }
              style={{ marginHorizontal: 6 }}
            >
              <MaterialIcons name="edit" size={24} color={colors.primary} />
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={{ marginHorizontal: 6 }}
            >
              <MaterialIcons name="delete" size={24} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <Text style={serviceStyles.emptyText}>No services yet.</Text>
      }
    />
  );
}
