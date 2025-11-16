import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { submittedStyles } from "../styles/theme";

export default function SubmittedScreen() {
  const router = useRouter();

  return (
    <View style={submittedStyles.container}>
      <View style={submittedStyles.card}>
        <Text style={submittedStyles.title}>🎉 Shop Registered Successfully!</Text>
        <Text style={submittedStyles.message}>
          Please wait our team will call you shortly
        </Text>

        <TouchableOpacity 
          style={submittedStyles.button} 
          onPress={() => router.push("/ShopOwnerLoginScreen")}
        >
          <Text style={submittedStyles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
