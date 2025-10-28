import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity } from "react-native";
import { db } from "../firebaseConfig";
import { colors, commonStyles } from "../styles/theme";

export default function ShopOwnerProfile() {
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const shopId = await AsyncStorage.getItem("shopId");
      if (!shopId) return;

      const docRef = doc(db, "salons", shopId);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setShopName(data.shopName || "");
        setOwnerName(data.ownerName || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setCity(data.city || "");
        setState(data.state || "");
        setPincode(data.pincode || "");
      }
    };
    loadData();
  }, []);

  const handleUpdate = async () => {
    try {
      const shopId = await AsyncStorage.getItem("shopId");
      if (!shopId) return;

      const docRef = doc(db, "salons", shopId);
      await updateDoc(docRef, {
        shopName,
        ownerName,
        email,
        phone,
        address,
        city,
        state,
        pincode,
      });

      await AsyncStorage.setItem("shopName", shopName);
      await AsyncStorage.setItem("shopOwnerName", ownerName);
      await AsyncStorage.setItem("shopEmail", email);
      await AsyncStorage.setItem("shopPhone", phone);

      Alert.alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error(error);
      Alert.alert("❌ Failed to update profile.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: colors.background,
        padding: 20,
        alignItems: "stretch", // 👈 makes inputs full width
      }}
    >
      <Text style={[commonStyles.title, { textAlign: "left", marginBottom: 20 }]}>
        🏪 Shop Profile
      </Text>

      {/* Shop Name */}
      <Text style={{ color: colors.textLight, marginBottom: 4, textAlign: "left" }}>
        Shop Name
      </Text>
      <TextInput
        style={commonStyles.input}
        value={shopName}
        onChangeText={setShopName}
        placeholder="Enter Shop Name"
      />

      {/* Owner Name */}
      <Text style={{ color: colors.textLight, marginBottom: 4, textAlign: "left" }}>
        Owner Name
      </Text>
      <TextInput
        style={commonStyles.input}
        value={ownerName}
        onChangeText={setOwnerName}
        placeholder="Enter Owner Name"
      />

      {/* Email */}
      <Text style={{ color: colors.textLight, marginBottom: 4, textAlign: "left" }}>
        Email
      </Text>
      <TextInput
        style={commonStyles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter Email"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Phone */}
      <Text style={{ color: colors.textLight, marginBottom: 4, textAlign: "left" }}>
        Phone
      </Text>
      <TextInput
        style={commonStyles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter Phone"
        keyboardType="phone-pad"
      />

      {/* Address */}
      <Text style={{ color: colors.textLight, marginBottom: 4, textAlign: "left" }}>
        Address
      </Text>
      <TextInput
        style={commonStyles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Enter Address"
      />

      {/* City */}
      <Text style={{ color: colors.textLight, marginBottom: 4, textAlign: "left" }}>
        City
      </Text>
      <TextInput
        style={commonStyles.input}
        value={city}
        onChangeText={setCity}
        placeholder="Enter City"
      />

      {/* State */}
      <Text style={{ color: colors.textLight, marginBottom: 4, textAlign: "left" }}>
        State
      </Text>
      <TextInput
        style={commonStyles.input}
        value={state}
        onChangeText={setState}
        placeholder="Enter State"
      />

      {/* Pincode */}
      <Text style={{ color: colors.textLight, marginBottom: 4, textAlign: "left" }}>
        Pincode
      </Text>
      <TextInput
        style={commonStyles.input}
        value={pincode}
        onChangeText={setPincode}
        placeholder="Enter Pincode"
        keyboardType="numeric"
      />

      <TouchableOpacity style={commonStyles.button} onPress={handleUpdate}>
        <Text style={commonStyles.buttonText}>Update Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
