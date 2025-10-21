import { useState } from "react";
import { Button, Picker, Text, View } from "react-native";

export default function RoleSelectScreen({ navigation }) {
  const [role, setRole] = useState("User");

  const handleNext = () => {
    if (role === "User") {
      navigation.navigate("UserLogin");
    } else {
      navigation.navigate("ShopOwnerRegister");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Select Role:</Text>
      <Picker
        selectedValue={role}
        style={{ height: 50, width: 200 }}
        onValueChange={(itemValue) => setRole(itemValue)}
      >
        <Picker.Item label="User" value="User" />
        <Picker.Item label="Shop Owner" value="ShopOwner" />
      </Picker>

      <Button title="Next" onPress={handleNext} />
    </View>
  );
}
