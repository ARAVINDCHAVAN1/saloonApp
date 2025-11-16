import { Button, Text, View } from "react-native";

export default function UserLoginScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>User Login Page (OTP coming later)</Text>
      <Button title="Mock Login" onPress={() => alert("Logged in as User")} />
    </View>
  );
}
