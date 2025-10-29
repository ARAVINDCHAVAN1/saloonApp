// app/shop-owner-register.tsx
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { db } from "../firebaseConfig";
import { colors, commonStyles } from "../styles/theme";

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

  const validateFields = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const pincodeRegex = /^[0-9]{6}$/;

    if (!shopName) {
      Toast.show({ type: "error", text1: "⚠️ Missing Field", text2: "Shop Name is required." });
      return false;
    }
    if (!ownerName) {
      Toast.show({ type: "error", text1: "⚠️ Missing Field", text2: "Owner Name is required." });
      return false;
    }
    if (!email) {
      Toast.show({ type: "error", text1: "⚠️ Missing Field", text2: "Email is required." });
      return false;
    }
    if (!emailRegex.test(email)) {
      Toast.show({ type: "error", text1: "⚠️ Invalid Email", text2: "Enter a valid email address." });
      return false;
    }
    if (!phone) {
      Toast.show({ type: "error", text1: "⚠️ Missing Field", text2: "Phone number is required." });
      return false;
    }
    if (!phoneRegex.test(phone)) {
      Toast.show({ type: "error", text1: "⚠️ Invalid Phone", text2: "Phone must be 10 digits." });
      return false;
    }
    if (!address) {
      Toast.show({ type: "error", text1: "⚠️ Missing Field", text2: "Address is required." });
      return false;
    }
    if (!city) {
      Toast.show({ type: "error", text1: "⚠️ Missing Field", text2: "City is required." });
      return false;
    }
    if (!state) {
      Toast.show({ type: "error", text1: "⚠️ Missing Field", text2: "State is required." });
      return false;
    }
    if (!pincode) {
      Toast.show({ type: "error", text1: "⚠️ Missing Field", text2: "Pincode is required." });
      return false;
    }
    if (!pincodeRegex.test(pincode)) {
      Toast.show({ type: "error", text1: "⚠️ Invalid Pincode", text2: "Pincode must be 6 digits." });
      return false;
    }
    if (!password) {
      Toast.show({ type: "error", text1: "⚠️ Missing Field", text2: "Password is required." });
      return false;
    }
    if (password.length < 6) {
      Toast.show({ type: "error", text1: "⚠️ Weak Password", text2: "Password must be at least 6 characters." });
      return false;
    }

    return true;
  };

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
        password, // ⚠️ hash this in production
        status: "pending",
        createdAt: serverTimestamp(),
      });

      Toast.show({
        type: "success",
        text1: "✅ Submitted",
        text2: "Please wait for Admin Approval.",
      });

      // ✅ Redirect to submitted confirmation page
      router.push("/submitted");
    } catch (error) {
      console.error("Firestore error:", error);
      Toast.show({
        type: "error",
        text1: "❌ Failed",
        text2: "Something went wrong. Try again.",
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={commonStyles.scrollContainer}>
      <Text style={commonStyles.title}>🏪 Shop Owner Registration</Text>
      <Text style={commonStyles.subtitle}>Fill in your details below</Text>

      <TextInput placeholder="Shop Name" value={shopName} onChangeText={setShopName} style={commonStyles.input} />
      <TextInput placeholder="Owner Name" value={ownerName} onChangeText={setOwnerName} style={commonStyles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={commonStyles.input} />
      <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="numeric" style={commonStyles.input} />
      <TextInput placeholder="Address" value={address} onChangeText={setAddress} style={commonStyles.input} />
      <TextInput placeholder="City" value={city} onChangeText={setCity} style={commonStyles.input} />
      <TextInput placeholder="State" value={state} onChangeText={setState} style={commonStyles.input} />
      <TextInput placeholder="Pincode" value={pincode} onChangeText={setPincode} keyboardType="numeric" style={commonStyles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={commonStyles.input} />

      <TouchableOpacity style={commonStyles.button} onPress={handleSubmit}>
        <Text style={commonStyles.buttonText}>Submit</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.push("/Selectcustomerorbarbar")}>
        <Text style={{ color: colors.primary, fontSize: 16 }}>
          🔑 Already registered? Click here to Login
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
