import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, Text, TouchableOpacity, View } from "react-native";
import { loginStyles, popupStyles } from "../styles/theme";

export default function Selectcustomerorbarbar() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setShowPopup(true);
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, []);

  const navigateTo = (nextRoute: string) => {
    Animated.timing(scaleValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      router.push(nextRoute);
    });
  };

  const closeAndGoBack = () => {
    Animated.timing(scaleValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  return (
    <View style={loginStyles.container}>
      <Text style={loginStyles.title}>👤 Select User</Text>
      <Text style={loginStyles.subtitle}>Choose your role below:</Text>

      <Modal transparent visible={showPopup} animationType="fade">
        <View style={popupStyles.overlay}>
          <Animated.View
            style={[
              popupStyles.popup,
              { transform: [{ scale: scaleValue }], position: "relative" },
            ]}
          >
            <TouchableOpacity
              onPress={closeAndGoBack}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 10,
                padding: 5,
              }}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            <Text
              style={{
                ...popupStyles.popupTitle,
                marginBottom: 15,
                textAlign: "center",
              }}
            >
              Are you a...
            </Text>

            <TouchableOpacity
              style={popupStyles.optionBtn}
              onPress={() => navigateTo("/shop-owner/ShopOwnerLoginScreen")}
            >
              <Text style={popupStyles.optionText}>🏪 Shop Owner</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={popupStyles.optionBtn}
              onPress={() => navigateTo("/staff/barber-login")}
            >
              <Text style={popupStyles.optionText}>💈 Staff</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
