// app/shop-owner/ShopOwnerProfile.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Animated,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";

import ShopOwnerHeader from "./ShopOwnerHeader";
import ShopOwnerBottomNav from "./ShopOwnerBottomNav";
import LeftMenu from "./LeftMenu";
import { db } from "../../src/firebase/firebaseConfig";
import { colors, commonStyles } from "../../styles/theme";

export default function ShopOwnerProfile() {
  /* ---------------- MENU ---------------- */
  const [visible, setVisible] = useState(false);
  const slide = useRef(new Animated.Value(-270)).current;

  const openMenu = () => {
    setVisible(true);
    Animated.timing(slide, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };
  const closeMenu = () => {
    Animated.timing(slide, { toValue: -270, duration: 200, useNativeDriver: false }).start(() =>
      setVisible(false)
    );
  };

  /* ---------------- STATES ---------------- */
  const [shop, setShop] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);

  // BANK SECTION
  const [bankMode, setBankMode] = useState(false);
  const [bank, setBank] = useState<any>({
    holderName: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",
    branch: "",
  });

  /* ---------------- LOAD PROFILE ---------------- */
  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem("shopId");
      if (!id) return;

      const snap = await getDoc(doc(db, "salons", id));
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setShop(data);
        setForm(data);

        if (data.bankDetails) {
          setBank(data.bankDetails);
        }
      }
    })();
  }, []);

  /* ---------------- SAVE PROFILE ---------------- */
  const updateProfile = async () => {
    try {
      await updateDoc(doc(db, "salons", form.id), {
        shopName: form.shopName,
        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      });

      setShop(form);
      setEditMode(false);
      Toast.show({ type: "success", text1: "Profile Updated" });
    } catch (err) {
      Toast.show({ type: "error", text1: "Update Failed" });
    }
  };

  /* ---------------- SAVE BANK DETAILS ---------------- */
  const saveBankDetails = async () => {
    try {
      await updateDoc(doc(db, "salons", shop.id), {
        bankDetails: bank,
      });

      Toast.show({ type: "success", text1: "Bank Details Updated" });
      setBankMode(false);
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to Update Bank Details" });
    }
  };

  if (!shop || !form)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );

  /* FIELD COMPONENT */
  const Field = ({ label, value, keyName }: any) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 14, color: "#777", marginBottom: 4 }}>{label}</Text>

      {!editMode ? (
        <Text style={{ fontSize: 18, color: "#222", fontWeight: "500" }}>{value || "—"}</Text>
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
          onChangeText={(t) => setForm({ ...form, [keyName]: t })}
        />
      )}
    </View>
  );

  /* BANK FIELD */
  const BankField = ({ label, value, keyName }: any) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>{label}</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          padding: 10,
          fontSize: 16,
          backgroundColor: "#fff",
        }}
        value={value}
        onChangeText={(t) => setBank({ ...bank, [keyName]: t })}
      />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <ShopOwnerHeader openMenu={openMenu} title="Profile" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 200 }}
            keyboardShouldPersistTaps="always"
          >
            <Text
              style={{
                fontSize: 26,
                fontWeight: "700",
                color: colors.primary,
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              Shop Owner Profile
            </Text>

            {/* NORMAL PROFILE FIELDS */}
            {!bankMode && (
              <>
                <Field label="Shop Name" value={form.shopName} keyName="shopName" />
                <Field label="Owner Name" value={form.ownerName} keyName="ownerName" />
                <Field label="Email" value={form.email} keyName="email" />
                <Field label="Phone" value={form.phone} keyName="phone" />
                <Field label="Address" value={form.address} keyName="address" />
                <Field label="City" value={form.city} keyName="city" />
                <Field label="State" value={form.state} keyName="state" />
                <Field label="Pincode" value={form.pincode} keyName="pincode" />
              </>
            )}

            {/* BANK DETAILS SECTION */}
            {bankMode && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 10 }}>
                  Bank Account Details
                </Text>

                <BankField label="Account Holder Name" value={bank.holderName} keyName="holderName" />
                <BankField label="Account Number" value={bank.accountNumber} keyName="accountNumber" />
                <BankField label="IFSC Code" value={bank.ifsc} keyName="ifsc" />
                <BankField label="Bank Name" value={bank.bankName} keyName="bankName" />
                <BankField label="Branch" value={bank.branch} keyName="branch" />
              </View>
            )}
          </ScrollView>

          {/* BUTTON SECTION */}
          <View
            style={{
              padding: 20,
              borderTopWidth: 1,
              borderColor: "#eee",
              marginBottom: 70,
            }}
          >
            {/* Bank Mode Buttons */}
            {bankMode ? (
              <TouchableOpacity
                style={[commonStyles.button, { backgroundColor: colors.primary }]}
                onPress={saveBankDetails}
              >
                <Text style={commonStyles.buttonText}>Save Bank Details</Text>
              </TouchableOpacity>
            ) : (
              <>
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

                {/* Update Bank Details */}
                <TouchableOpacity
                  style={[
                    commonStyles.button,
                    { backgroundColor: "#444", marginTop: 12 },
                  ]}
                  onPress={() => setBankMode(true)}
                >
                  <Text style={commonStyles.buttonText}>Update Bank Details</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <Toast />
        </SafeAreaView>
      </KeyboardAvoidingView>

      <ShopOwnerBottomNav />
      <LeftMenu visible={visible} slide={slide} closeMenu={closeMenu} />
    </View>
  );
}
