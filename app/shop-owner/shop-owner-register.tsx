import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";

export default function ShopOwnerRegisterScreen() {
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [password, setPassword] = useState("");

  const [submittedMsg, setSubmittedMsg] = useState(""); // ✅ SHOW MESSAGE HERE

  const router = useRouter();

  /* ------------------- VALIDATION ------------------- */
  const validateFields = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const pinRegex = /^[0-9]{6}$/;

    if (!shopName) return showError("Shop name required");
    if (!ownerName) return showError("Owner name required");
    if (!emailRegex.test(email)) return showError("Invalid email");
    if (!phoneRegex.test(phone)) return showError("Phone must be 10 digits");
    if (!address) return showError("Address required");
    if (!city) return showError("City required");
    if (!state) return showError("State required");
    if (!pinRegex.test(pincode)) return showError("Pincode must be 6 digits");
    if (!password) return showError("Password required");

    return true;
  };

  const showError = (msg) => {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: msg,
    });
    return false;
  };

  /* ------------------- SUBMIT ------------------- */
  const handleSubmit = async () => {
    console.log("Submit clicked");

    if (!validateFields()) return;

    try {
      await addDoc(collection(db, "salons"), {
        shopName,
        ownerName,
        email: email.toLowerCase(),
        phone,
        address,
        city,
        state,
        pincode,
        password,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Show toast
      Toast.show({
        type: "success",
        text1: "Registration Successful 🎉",
        text2: "Admin will approve your shop soon.",
      });

      // Show message on the page
      setSubmittedMsg("✔ Your shop registration is submitted. Admin will approve it soon.");

      // Clear fields
      setShopName("");
      setOwnerName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setCity("");
      setState("");
      setPincode("");
      setPassword("");

    } catch (err) {
      console.log("Firebase Error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong",
      });
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#000" }}
      contentContainerStyle={{ padding: 20, paddingTop: 60 }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "700",
          textAlign: "center",
          color: colors.primary,
          marginBottom: 10,
        }}
      >
        Register Your Shop
      </Text>

      {/* INPUTS */}
      {[
        { placeholder: "Shop Name", value: shopName, set: setShopName },
        { placeholder: "Owner Name", value: ownerName, set: setOwnerName },
        { placeholder: "Email", value: email, set: setEmail, type: "email" },
        { placeholder: "Phone Number", value: phone, set: setPhone, type: "numeric" },
        { placeholder: "Address", value: address, set: setAddress },
        { placeholder: "City", value: city, set: setCity },
        { placeholder: "State", value: state, set: setState },
        { placeholder: "Pincode", value: pincode, set: setPincode, type: "numeric" },
      ].map((item, index) => (
        <TextInput
          key={index}
          placeholder={item.placeholder}
          placeholderTextColor="#777"
          value={item.value}
          onChangeText={item.set}
          keyboardType={
            item.type === "numeric"
              ? "number-pad"
              : item.type === "email"
              ? "email-address"
              : "default"
          }
          style={{
            backgroundColor: "#111",
            color: "#fff",
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}
        />
      ))}

      <TextInput
        placeholder="Password"
        placeholderTextColor="#777"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          backgroundColor: "#111",
          color: "#fff",
          padding: 12,
          borderRadius: 8,
          marginBottom: 20,
        }}
      />

      {/* SUBMIT BUTTON */}
      <TouchableOpacity
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 10,
        }}
        onPress={handleSubmit}
      >
        <Text
          style={{
            color: "#000",
            textAlign: "center",
            fontSize: 18,
            fontWeight: "700",
          }}
        >
          Submit
        </Text>
      </TouchableOpacity>

      {/* SUCCESS MESSAGE BELOW BUTTON */}
      {submittedMsg !== "" && (
        <Text
          style={{
            color: colors.primary,
            fontSize: 16,
            textAlign: "center",
            marginTop: 18,
            fontWeight: "600",
          }}
        >
          {submittedMsg}
        </Text>
      )}

      {/* LOGIN LINK */}
      <TouchableOpacity
        onPress={() => router.push("/")}
        style={{ marginTop: 20 }}
      >
        <Text
          style={{
            color: colors.primary,
            fontSize: 16,
            textAlign: "center",
          }}
        >
          Already registered? Login here
        </Text>
      </TouchableOpacity>

      <Toast />
    </ScrollView>
  );
}
