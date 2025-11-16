import { useRouter } from "expo-router";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import { buttons, fonts, images, layout } from "../styles/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { width } = Dimensions.get("window");

  return (
    <View style={layout.container}>
      <Image
        source={images.logo}
        style={[
          layout.logo,
          {
            width: width * 0.65,
            height: width * 0.65,
            alignSelf: "center",
            resizeMode: "contain",
          },
        ]}
      />

      {/* Customer Button */}
      <TouchableOpacity
        style={[buttons.primary, { width: "80%", alignSelf: "center", marginBottom: 10 }]}
        onPress={() => router.push("/customer-login")}
      >
        <Text style={[fonts.buttonText, { fontSize: 18 }]}>👤 Customer</Text>
      </TouchableOpacity>

      {/* Shop Owner Button */}
      <TouchableOpacity
        style={[buttons.secondary, { width: "80%", alignSelf: "center" }]}
        onPress={() => router.push("/Selectcustomerorbarbar")}
      >
        <Text style={[fonts.buttonText, { fontSize: 18 }]}>🏪 Shop Owner</Text>
      </TouchableOpacity>
    </View>
  );
}
