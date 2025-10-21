import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity } from "react-native";

// Import theme
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { commonStyles } from "../styles/theme";

export default function ShopOwnerRegisterScreen() {
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    if (!shopName || !ownerName || !address || !email || !phone) {
      alert("⚠️ Please fill all fields before submitting.");
      return;
    }

    try {
      await addDoc(collection(db, "salons"), {
        shopName,
        ownerName,
        address,
        email,
        phone,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      alert("✅ Submitted! Please wait for Admin Approval.");
      router.push("/");
    } catch (error) {
      alert("❌ Failed to submit. Try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={commonStyles.scrollContainer}>
      <Text style={commonStyles.title}>🏪 Shop Owner Registration</Text>
      <Text style={commonStyles.subtitle}>Fill in your details below</Text>

      <TextInput placeholder="Shop Name" value={shopName} onChangeText={setShopName} style={commonStyles.input} />
      <TextInput placeholder="Owner Name" value={ownerName} onChangeText={setOwnerName} style={commonStyles.input} />
      <TextInput placeholder="Address" value={address} onChangeText={setAddress} style={commonStyles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={commonStyles.input} keyboardType="email-address" />
      <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} style={commonStyles.input} keyboardType="phone-pad" />

      <TouchableOpacity style={commonStyles.button} onPress={handleSubmit}>
        <Text style={commonStyles.buttonText}>Submit</Text>
      </TouchableOpacity>

     <TouchableOpacity
  style={{ marginTop: 20 }}
  onPress={() => router.push("/ShopOwnerLoginScreen")}
>
  <Text style={{ color: "#007AFF", fontSize: 16 }}>
    🔑 Already registered? Click here to Login
  </Text>
</TouchableOpacity>
    </ScrollView>
  );
}
