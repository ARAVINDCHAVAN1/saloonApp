import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { loginStyles } from "../styles/theme";

export default function CustomerHome() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

  // Generate and show OTP in console
  const sendOtp = () => {
    if (phone.length < 10) {
      Alert.alert("❌ Invalid Phone", "Please enter a valid phone number");
      return;
    }
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
    setGeneratedOtp(otpCode);
    console.log("📲 OTP for", phone, "is:", otpCode);
    Alert.alert("✅ OTP Sent", "Check console for demo OTP");
  };

  // Verify OTP
  const verifyOtp = () => {
    if (otp === generatedOtp) {
      Alert.alert("🎉 Success", "Login successful!");
      router.push("/customer-dashboard");
    } else {
      Alert.alert("❌ Error", "Invalid OTP, please try again");
    }
  };

  return (
    <View style={loginStyles.container}>
      <Text style={loginStyles.title}>📱 Customer Login</Text>
      <Text style={loginStyles.subtitle}>Enter your phone number to continue</Text>

      {/* Phone Number */}
      <TextInput
        style={loginStyles.input}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      {/* Get OTP Button */}
      <TouchableOpacity style={loginStyles.button} onPress={sendOtp}>
        <Text style={loginStyles.buttonText}>Get OTP</Text>
      </TouchableOpacity>

      {/* OTP Input */}
      {generatedOtp && (
        <>
          <TextInput
            style={loginStyles.input}
            placeholder="Enter 4-digit OTP"
            keyboardType="numeric"
            maxLength={4}
            value={otp}
            onChangeText={setOtp}
          />

          <TouchableOpacity style={loginStyles.button} onPress={verifyOtp}>
            <Text style={loginStyles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Back */}
      <TouchableOpacity style={loginStyles.backButton} onPress={() => router.back()}>
        <Text style={loginStyles.backText}>⬅ Back</Text>
      </TouchableOpacity>
    </View>
  );
}
