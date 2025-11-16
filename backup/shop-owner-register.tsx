// app/shop-owner-register.tsx
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
import { db } from "../firebaseConfig";
import { colors } from "../styles/theme";

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
  const router = useRouter();

  // ✅ Validation
  const validateFields = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const pincodeRegex = /^[0-9]{6}$/;

    if (!shopName) return showError("Shop Name is required.");
    if (!ownerName) return showError("Owner Name is required.");
    if (!email) return showError("Email is required.");
    if (!emailRegex.test(email)) return showError("Enter a valid email address.");
    if (!phone) return showError("Phone number is required.");
    if (!phoneRegex.test(phone)) return showError("Phone must be 10 digits.");
    if (!address) return showError("Address is required.");
    if (!city) return showError("City is required.");
    if (!state) return showError("State is required.");
    if (!pincode) return showError("Pincode is required.");
    if (!pincodeRegex.test(pincode)) return showError("Pincode must be 6 digits.");
    if (!password) return showError("Password is required.");
    if (password.length < 6)
      return showError("Password must be at least 6 characters.");
    return true;
  };

  const showError = (msg: string) => {
    Toast.show({
      type: "error",
      text1: "⚠️ Validation Error",
      text2: msg,
    });
    return false;
  };

  // ✅ Submit to Firebase
  const handleSubmit = async () => {
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
        password, // ⚠️ should be hashed in production
        status: "pending",
        createdAt: serverTimestamp(),
      });

      Toast.show({
        type: "success",
        text1: "✅ Submitted Successfully",
        text2: "Please wait for Admin Approval.",
      });

      router.push("/submitted");
    } catch (error) {
      console.error("Firestore error:", error);
      Toast.show({
        type: "error",
        text1: "❌ Submission Failed",
        text2: "Something went wrong. Try again.",
      });
    }
  };

  // ✅ UI
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#000" }}
      contentContainerStyle={{ padding: 22, paddingTop: 60 }}
    >
      {/* 🔹 Title Section */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: "800",
          textAlign: "center",
          color: colors.primary,
          marginBottom: 6,
        }}
      >
        🏪 Register Your Shop
      </Text>

      <Text
        style={{
          fontSize: 15,
          textAlign: "center",
          color: "#aaa",
          marginBottom: 30,
        }}
      >
        Fill in your shop details to get started
      </Text>

      {/* 🔹 Input Fields */}
      {[
        { placeholder: "Shop Name", value: shopName, set: setShopName },
        { placeholder: "Owner Name", value: ownerName, set: setOwnerName },
        { placeholder: "Email", value: email, set: setEmail, type: "email" },
        { placeholder: "Phone Number", value: phone, set: setPhone, type: "phone" },
        { placeholder: "Address", value: address, set: setAddress },
        { placeholder: "City", value: city, set: setCity },
        { placeholder: "State", value: state, set: setState },
        { placeholder: "Pincode", value: pincode, set: setPincode, type: "numeric" },
      ].map((item, idx) => (
        <TextInput
          key={idx}
          placeholder={item.placeholder}
          placeholderTextColor="#777"
          value={item.value}
          onChangeText={item.set}
          keyboardType={
            item.type === "numeric"
              ? "numeric"
              : item.type === "email"
              ? "email-address"
              : "default"
          }
          autoCapitalize={item.type === "email" ? "none" : "sentences"}
          style={{
            backgroundColor: "#111",
            color: "#fff",
            borderRadius: 8,
            paddingVertical: 12,
            paddingHorizontal: 14,
            marginBottom: 12,
            fontSize: 15,
          }}
        />
      ))}

      <TextInput
        placeholder="Password"
        placeholderTextColor="#777"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          backgroundColor: "#111",
          color: "#fff",
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 14,
          marginBottom: 20,
          fontSize: 15,
        }}
      />

      {/* 🔹 Submit Button */}
      <TouchableOpacity
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 10,
          marginTop: 10,
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

      {/* 🔹 Login Link */}
      <TouchableOpacity
        onPress={() => router.push("/shop-owner-login")}
        style={{ marginTop: 20 }}
      >
        <Text
          style={{
            color: colors.primary,
            fontSize: 16,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          🔑 Already registered? Login here
        </Text>
      </TouchableOpacity>

      {/* 🔹 Back Button Centered */}
      <View
        style={{
          marginTop: 40,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 40,
        }}
      >
        <TouchableOpacity
          style={{
           
           
           
            alignItems: "center",
          }}
          onPress={() => router.replace("/Selectcustomerorbarbar")}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            ⬅ 
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
