import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { db } from "../firebaseConfig";
import { commonStyles } from "../styles/theme";

export default function CustomerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [showOtp, setShowOtp] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const inputRefs = Array.from({ length: 6 }, () => useRef<any>());

  // ✅ Skip login if already logged in
  useEffect(() => {
    const checkLogin = async () => {
      const loggedIn = await AsyncStorage.getItem("isLoggedIn");
      if (loggedIn === "true") {
        router.replace("/customer");
      }
    };
    checkLogin();
  }, []);

  // ✅ Save or update Firestore data
  const saveCustomerToFirestore = async (email: string, phone: string, otp: string) => {
    try {
      const customersRef = collection(db, "customers");
      const existing = await getDocs(query(customersRef, where("phone", "==", phone)));

      if (!existing.empty) {
        const docSnap = existing.docs[0];
        await updateDoc(doc(customersRef, docSnap.id), {
          otp,
          email,
          phone,
          updatedAt: serverTimestamp(),
        });
        return docSnap.id;
      } else {
        const newDoc = await addDoc(customersRef, {
          email,
          phone,
          otp,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return newDoc.id;
      }
    } catch (error) {
      console.error("❌ Error saving customer:", error);
      Alert.alert("Error", "Failed to save customer data.");
      return null;
    }
  };

  // ✅ Get OTP
  const handleGetOtp = async () => {
    if (!email.trim() || !phone.trim()) {
      Alert.alert("⚠️ Missing Details", "Please enter both email and phone number.");
      return;
    }
    if (phone.length !== 10) {
      Alert.alert("⚠️ Invalid Phone", "Please enter a valid 10-digit phone number.");
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setShowOtp(true);
    await saveCustomerToFirestore(email, phone, otp);
    Alert.alert("📩 OTP Sent", `Demo OTP: ${otp}`);
  };

  // ✅ Verify OTP
  const verifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp === generatedOtp) {
      const customerId = await saveCustomerToFirestore(email, phone, generatedOtp);
      if (customerId) {
        const payload = { id: customerId, email, phone };
        await AsyncStorage.setItem("customer", JSON.stringify(payload));
        await AsyncStorage.setItem("isLoggedIn", "true"); // ✅ Save session
        router.replace("/customer");
      } else Alert.alert("Error", "Could not save customer. Try again.");
    } else Alert.alert("❌ Invalid OTP", "Please enter the correct OTP.");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={commonStyles.scrollContainer}>

            {!showOtp ? (
              <>
                <TextInput
                  style={commonStyles.input}
                  placeholder="Enter Email ID"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                <TextInput
                  style={commonStyles.input}
                  placeholder="Enter 10-digit phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={10}
                />
                <TouchableOpacity style={commonStyles.button} onPress={handleGetOtp}>
                  <Text style={commonStyles.buttonText}>Get OTP</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 18,
                    fontWeight: "600",
                    marginTop: 25,
                  }}
                >
                  Enter OTP
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginVertical: 20,
                  }}
                >
                  {otpDigits.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={inputRefs[index]}
                      style={{
                        width: 45,
                        height: 50,
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 10,
                        textAlign: "center",
                        fontSize: 20,
                        color: "#000",
                        backgroundColor: "#fff",
                        marginHorizontal: 5,
                        elevation: 2,
                      }}
                      keyboardType="numeric"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => {
                        const newOtp = [...otpDigits];
                        newOtp[index] = text;
                        setOtpDigits(newOtp);
                        if (text && index < 5) inputRefs[index + 1].current?.focus();
                      }}
                    />
                  ))}
                </View>

                <View
                  style={{
                    alignItems: "center",
                    marginBottom: 20,
                    backgroundColor: "#e8f4ff",
                    paddingVertical: 10,
                    borderRadius: 8,
                    marginHorizontal: 60,
                  }}
                >
                  <Text style={{ color: "#007aff", fontSize: 16, fontWeight: "bold" }}>
                    Demo OTP: {generatedOtp}
                  </Text>
                </View>

                <TouchableOpacity style={commonStyles.button} onPress={verifyOtp}>
                  <Text style={commonStyles.buttonText}>Verify OTP</Text>
                </TouchableOpacity>
              </>
            )}

          
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
}
