import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function ShopOwnerRegisterScreen({ navigation }) {
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = () => {
    // later: save to Firestore with "pending approval" status
    alert("Submitted! Wait for Admin Approval.");
    navigation.navigate("RoleSelect"); // redirect back
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Shop Owner Registration</Text>

      <TextInput placeholder="Shop Name" value={shopName} onChangeText={setShopName} style={styles.input} />
      <TextInput placeholder="Owner Name" value={ownerName} onChangeText={setOwnerName} style={styles.input} />
      <TextInput placeholder="Address" value={address} onChangeText={setAddress} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />

      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5
  }
};
