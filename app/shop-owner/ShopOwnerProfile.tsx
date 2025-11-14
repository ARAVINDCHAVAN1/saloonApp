import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { db } from "../../src/firebase/firebaseConfig";
import { colors, commonStyles } from "../../styles/theme";

export default function ShopOwnerProfile() {
  const [shop, setShop] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const id = await AsyncStorage.getItem("shopId");
      if (!id) return;

      const snap = await getDoc(doc(db, "salons", id));
      if (snap.exists()) {
        setShop({ id: snap.id, ...snap.data() });
      }
    };
    loadData();
  }, []);

  const updateProfile = async () => {
    if (!shop) return;

    try {
      await updateDoc(doc(db, "salons", shop.id), {
        shopName: shop.shopName,
        ownerName: shop.ownerName,
        email: shop.email,
        phone: shop.phone,
        address: shop.address,
        city: shop.city,
        state: shop.state,
        pincode: shop.pincode,
      });

      Toast.show({
        type: "success",
        text1: "Profile Updated ✅",
      });

      setEditMode(false);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Update Failed ❌",
      });
    }
  };

  if (!shop)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );

  // ✅ VERY CLEAN FIELDS — NO BOX, NO ELEVATION
  const Field = ({ label, value, keyName }) => (
    <View style={{ marginBottom: 25 }}>
      <Text style={{ fontSize: 14, color: "#777", marginBottom: 4 }}>
        {label}
      </Text>

      {!editMode ? (
        <Text style={{ fontSize: 18, color: "#222", fontWeight: "500" }}>
          {value || "—"}
        </Text>
      ) : (
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 14,
            fontSize: 16,
            backgroundColor: "#fff",
          }}
          value={value}
          onChangeText={(t) => setShop({ ...shop, [keyName]: t })}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 140,
        }}
      >
        {/* ✅ Title */}
        <Text
          style={{
            fontSize: 26,
            fontWeight: "700",
            color: colors.primary,
            textAlign: "center",
            marginBottom: 25,
          }}
        >
          Shop Owner Profile
        </Text>

        {/* ✅ CLEAN FIELDS */}
        <Field label="Shop Name" value={shop.shopName} keyName="shopName" />
        <Field label="Owner Name" value={shop.ownerName} keyName="ownerName" />
        <Field label="Email" value={shop.email} keyName="email" />
        <Field label="Phone" value={shop.phone} keyName="phone" />
        <Field label="Address" value={shop.address} keyName="address" />
        <Field label="City" value={shop.city} keyName="city" />
        <Field label="State" value={shop.state} keyName="state" />
        <Field label="Pincode" value={shop.pincode} keyName="pincode" />
      </ScrollView>

      {/* ✅ BUTTON AREA */}
      <View
        style={{
          padding: 20,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderColor: "#eee",
        }}
      >
        {!editMode ? (
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: colors.primary }]}
            onPress={() => setEditMode(true)}
          >
            <Text style={commonStyles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: colors.primary }]}
            onPress={updateProfile}
          >
            <Text style={commonStyles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>

      <Toast />
    </SafeAreaView>
  );
}
