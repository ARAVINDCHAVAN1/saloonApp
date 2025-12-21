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
import { Ionicons } from "@expo/vector-icons";
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
          flex: 1, justifyContent: "center", alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textLight, marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[layout.container, { paddingTop: 40 }]}>

      {/* 🔵 TOP ICONS ROW */}
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 20,
        }}
      >
        {/* Shop Owner Icon (SMALLER) */}
        <TouchableOpacity onPress={() => router.push("./shop-owner/ShopOwnerLoginScreen")}>
          <Ionicons name="storefront-outline" size={28} color={colors.primary} />
        </TouchableOpacity>

        {/* Staff Icon (SMALLER) */}
        <TouchableOpacity onPress={() => router.push("/staff/barber-login")}>
          <Ionicons name="people-circle-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 🔵 LOGO MIDDLE */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", width: "100%" }}>
        <Image
          source={images.logo}
          style={{
            width: width * 0.8,
            height: width * 0.8,
            resizeMode: "contain",
          }}
        />

        {/* 🔵 FULL-WIDTH LOGIN BUTTON (100%) */}
        <TouchableOpacity
          style={[
            buttons.primary,
            {
             
              width: "50%",      // FULL WIDTH
              alignSelf: "center",
              paddingHorizontal: 20, // slight inner padding
            },
          ]}
          onPress={() => router.push("/customer-login")}
        >
          <Text style={[fonts.buttonText, { fontSize: 18, textAlign: "center" }]}>
            Login
          </Text>
        </TouchableOpacity>

       
      </View>
    </View>
  );
}
