import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, loginStyles, popupStyles } from "../styles/theme";

export default function UserLoginScreen() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const scaleValue = useRef(new Animated.Value(0)).current;

  // 🔥 Open popup immediately when screen loads
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

  // 🔙 Close popup and go back
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
      <Text style={loginStyles.title}>👤 User Login</Text>
      <Text style={loginStyles.subtitle}>
        Select whether you are a Shop Owner or Staff
      </Text>

      {/* Popup Modal */}
      <Modal transparent visible={showPopup} animationType="fade">
        <View style={popupStyles.overlay}>
          <Animated.View
            style={[
              popupStyles.popup,
              {
                transform: [{ scale: scaleValue }],
                position: "relative",
              },
            ]}
          >
            {/* ❌ Close Icon at Top-Right */}
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
              style={[
                popupStyles.optionBtn,
                {
                  backgroundColor: colors.primary,
                  borderWidth: 0,
                },
              ]}
              onPress={() => navigateTo("/ShopOwnerLoginScreen")}
            >
              <Text
                style={{
                  ...popupStyles.optionText,
                  color: "#000",
                  fontWeight: "700",
                }}
              >
                🏪 Shop Owner
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                popupStyles.optionBtn,
                {
                  backgroundColor: "#fff",
                  borderWidth: 1.2,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => navigateTo("/barber-login")}
            >
              <Text
                style={{
                  ...popupStyles.optionText,
                  color: colors.primary,
                  fontWeight: "700",
                }}
              >
                💈 Staff
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
