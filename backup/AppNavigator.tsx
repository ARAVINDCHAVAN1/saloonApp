import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { colors } from "../styles/theme";
import ShopOwnerDashboard from "./ShopOwnerDashboard";
import ShopOwnerLoginScreen from "./ShopOwnerLoginScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const sid = await AsyncStorage.getItem("shopId");
      setIsLoggedIn(!!sid);
      setIsChecking(false);
    };
    checkLogin();
  }, []);

  if (isChecking) {
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
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Dashboard" component={ShopOwnerDashboard} />
        ) : (
          <Stack.Screen name="Login" component={ShopOwnerLoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
