import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../src/firebase/firebaseConfig";

export default function StaffList() {
  const router = useRouter();
  const [salonId, setSalonId] = useState("");
  const [barbers, setBarbers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const sid = await AsyncStorage.getItem("shopId");
      if (!sid) return Alert.alert("Missing", "shopId not found.");
      setSalonId(sid);
      await refreshBarbers(sid);
    };
    load();
  }, []);

  const refreshBarbers = async (sid = salonId) => {
    if (!sid) return;
    const q = query(collection(db, "barbers"), where("salonId", "==", sid));
    const snap = await getDocs(q);
    setBarbers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📋 Existing Staff</Text>
      {barbers.map((b) => (
        <View key={b.id} style={styles.staffCard}>
          <Image source={{ uri: b.photoUrl || "https://via.placeholder.com/80" }} style={styles.staffImage} />
          <View style={{ flex: 1 }}>
            <Text style={styles.staffName}>{b.name}</Text>
            <Text style={styles.staffDetail}>{b.specialization} | {b.experience}</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.iconBtn, { backgroundColor: "#ffa726" }]} onPress={() => router.push({ pathname: "/StaffEdit", params: { barberId: b.id } })}>
                <MaterialIcons name="edit" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, { backgroundColor: "#1e88e5" }]} onPress={() => router.push({ pathname: "/StaffSlots", params: { barberId: b.id } })}>
                <MaterialIcons name="schedule" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: "red" }]}
                onPress={() =>
                  Alert.alert("Delete Staff", "Are you sure?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await deleteDoc(doc(db, "barbers", b.id));
                          await refreshBarbers();
                        } catch (err) {
                          Alert.alert("❌ Error", "Failed to delete staff");
                        }
                      },
                    },
                  ])
                }
              >
                <MaterialIcons name="delete" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  staffCard: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#eee", padding: 10, borderRadius: 8, marginBottom: 10 },
  staffImage: { width: 60, height: 60, borderRadius: 30, marginRight: 10 },
  staffName: { fontSize: 16, fontWeight: "700" },
  staffDetail: { fontSize: 14, color: "#666" },
  actionRow: { flexDirection: "row", marginTop: 8 },
  iconBtn: { padding: 8, borderRadius: 6, marginRight: 8, alignItems: "center", justifyContent: "center" },
});
