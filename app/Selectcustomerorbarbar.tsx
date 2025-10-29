import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { loginStyles, popupStyles } from "../styles/theme";

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

  // 🔙 Close and go back to index
  const closeAndGoBack = () => {
    Animated.timing(scaleValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      router.back(); // ⬅️ navigates back to index
    });
  };

  return (
    <View style={loginStyles.container}>
      <Text style={loginStyles.title}>👤 User Login</Text>
      <Text style={loginStyles.subtitle}>
        Select whether you are a Shop Owner or Staff
      </Text>

      {/* Popup Modal */}
      <Modal transparent visible={showPopup} animationType="fade" onRequestClose={() => {}}>
        <View style={popupStyles.overlay}>
          <Animated.View
            style={[
              popupStyles.popup,
              { transform: [{ scale: scaleValue }] },
            ]}
          >
            <Text style={popupStyles.popupTitle}>Are you a...</Text>

            <TouchableOpacity
              style={popupStyles.optionBtn}
              onPress={() => navigateTo("/ShopOwnerLoginScreen")}
            >
              <Text style={popupStyles.optionText}>🏪 Shop Owner</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={popupStyles.optionBtn}
              onPress={() => navigateTo("/barber-login")}
            >
              <Text style={popupStyles.optionText}>💈 Staff</Text>
            </TouchableOpacity>

            {/* ❌ Close Button */}
            <TouchableOpacity style={{ marginTop: 16, padding: 10 }} onPress={closeAndGoBack}>
              <Text style={popupStyles.cancelText}>⬅ Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
