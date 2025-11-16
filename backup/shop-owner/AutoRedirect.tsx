import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { colors } from "../../styles/theme";
import { checkSession } from "../utils/authUtils";

export default function AutoRedirectShopOwner() {
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      const loggedIn = await checkSession("isShopOwnerLoggedIn");
      if (loggedIn) router.replace("/ShopOwnerDashboard");
      else router.replace("/ShopOwnerLoginScreen");
    };
    verify();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
