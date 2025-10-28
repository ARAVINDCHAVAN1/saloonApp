import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { buttons, fonts, images, layout } from "../styles/theme";

export default function RoleSelectScreen() {
  const router = useRouter();

  return (
    <View style={layout.container}>
      {/* Logo */}
      <Image source={images.logo} style={layout.logo} />

      

      {/* Buttons */}
      <TouchableOpacity
        style={buttons.primary}
        onPress={() => router.push("/user-login")}
      >
        <Text style={fonts.buttonText}>👤 User</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={buttons.secondary}
        onPress={() => router.push("/shop-owner-register")}
      >
        <Text style={fonts.buttonText}>🏪 Shop Owner</Text>
      </TouchableOpacity>
    </View>
  );
}
