import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../firebaseConfig";
import { commonStyles } from "../styles/theme";

export default function ShopOwnerProfile() {
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const shopId = await AsyncStorage.getItem("shopId");
      if (!shopId) return;

      const q = query(collection(db, "salons"), where("shopName", "==", shopId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setOwnerName(data.ownerName || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
      }
    };
    loadData();
  }, []);

  const handleUpdate = async () => {
    try {
      const shopId = await AsyncStorage.getItem("shopId");
      if (!shopId) return;

      const q = query(collection(db, "salons"), where("shopName", "==", shopId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = doc(db, "salons", snapshot.docs[0].id);
        await updateDoc(docRef, { ownerName, email, phone });
        Alert.alert("✅ Profile updated successfully!");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("❌ Failed to update profile.");
    }
  };

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.title}>✏️ Update Profile</Text>

      <TextInput
        style={commonStyles.input}
        value={ownerName}
        onChangeText={setOwnerName}
        placeholder="Owner Name"
      />
      <TextInput
        style={commonStyles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />
      <TextInput
        style={commonStyles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone"
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={commonStyles.button} onPress={handleUpdate}>
        <Text style={commonStyles.buttonText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
}
