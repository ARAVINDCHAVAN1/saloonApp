import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { buttons, colors, fonts, images, layout } from "../styles/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
        const role = await AsyncStorage.getItem("role");

        if (isLoggedIn === "true") {
          if (role === "barber") {
            router.replace("/staff/BarberDashboard");
            return;
          } else if (role === "customer") {
            router.replace("/customer/customer-dashboard");
            return;
          }
        }
      } catch (e) {
        console.error("Session check failed:", e);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textLight, marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

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

      {/* ✅ Customer Login */}
      <TouchableOpacity
        style={[
          buttons.primary,
          { width: "80%", alignSelf: "center", marginBottom: 10 },
        ]}
        onPress={() => router.push("/customer-login")}
      >
        <Text style={[fonts.buttonText, { fontSize: 18 }]}>👤 Customer</Text>
      </TouchableOpacity>

      {/* ✅ Shop Owner / Staff */}
      <TouchableOpacity
        style={[buttons.secondary, { width: "80%", alignSelf: "center" }]}
        onPress={() => router.push("/Selectcustomerorbarbar")}
      >
        <Text style={[fonts.buttonText, { fontSize: 18 }]}>
          🏪 Shop Owner / Staff
        </Text>
      </TouchableOpacity>
    </View>
  );
}
