import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { db } from "../firebaseConfig";
import { commonStyles } from "../styles/theme";

export default function ShopOwnerDelete() {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const shopId = await AsyncStorage.getItem("shopId");
      if (!shopId) return;

      const q = query(collection(db, "salons"), where("shopName", "==", shopId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = doc(db, "salons", snapshot.docs[0].id);
        await deleteDoc(docRef);

        await AsyncStorage.clear();
        Alert.alert("✅ Account deleted successfully!");
        router.replace("/"); // back to home
      }
    } catch (error) {
      console.error(error);
      Alert.alert("❌ Failed to delete account.");
    }
  };

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.title}>⚠️ Delete Account</Text>
      <Text style={commonStyles.subtitle}>
        This action cannot be undone.
      </Text>

      <TouchableOpacity
        style={[commonStyles.button, { backgroundColor: "red" }]}
        onPress={handleDelete}
      >
        <Text style={commonStyles.buttonText}>Delete My Account</Text>
      </TouchableOpacity>
    </View>
  );
}
