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
import Toast from "react-native-toast-message";
import { db } from "../src/firebase/firebaseConfig";
import { colors, commonStyles } from "../styles/theme";

export default function CustomerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [showOtp, setShowOtp] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = Array.from({ length: 6 }, () => useRef<any>());

  // ✅ Check login
  useEffect(() => {
    const checkLogin = async () => {
      const loggedIn = await AsyncStorage.getItem("isLoggedIn");
      if (loggedIn === "true") router.replace("/customer");
    };
    checkLogin();
  }, []);

  // ✅ Timer countdown for resend button
  useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // ✅ Save or update Firestore
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
      Toast.show({ type: "error", text1: "Error saving data" });
      return null;
    }
  };

  // ✅ Generate OTP and Save
  const handleGetOtp = async () => {
    if (!email.trim() || !phone.trim()) {
      Toast.show({ type: "info", text1: "Enter Email & Phone Number" });
      return;
    }
    if (phone.length !== 10) {
      Toast.show({ type: "info", text1: "Enter a valid 10-digit number" });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setShowOtp(true);
    setResendTimer(15);
    await saveCustomerToFirestore(email, phone, otp);

    Toast.show({
      type: "success",
      text1: "OTP Sent ✅",
      text2: `Demo OTP: ${otp}`,
    });
  };

  // ✅ Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setResendTimer(15);
    await saveCustomerToFirestore(email, phone, otp);

    Toast.show({
      type: "success",
      text1: "OTP Resent 🔁",
      text2: `Demo OTP: ${otp}`,
    });
  };

  // ✅ Verify OTP
  const verifyOtp = async () => {
    const otp = otpDigits.join("");

    if (otp === generatedOtp) {
      const customerId = await saveCustomerToFirestore(email, phone, generatedOtp);

      if (customerId) {
        await AsyncStorage.setItem("customer", JSON.stringify({ id: customerId, email, phone }));
        await AsyncStorage.setItem("isLoggedIn", "true");

        Toast.show({
          type: "success",
          text1: "Login Successful 🎉",
          text2: "Welcome back!",
        });

        setTimeout(() => {
          router.replace("/customer");
        }, 800);
      } else {
        Toast.show({ type: "error", text1: "Something went wrong!" });
      }
    } else {
      Toast.show({ type: "error", text1: "Invalid OTP", text2: "Please try again." });
    }
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
            {/* ✅ Page Title */}
            <Text
              style={{
                textAlign: "center",
                fontSize: 26,
                fontWeight: "800",
                color: colors.primary,
                marginBottom: 25, // ✅ Added spacing below title
              }}
            >
              👤 Customer Login
            </Text>

            {!showOtp ? (
              <>
                {/* ✅ Email */}
                <TextInput
                  style={[commonStyles.input, { marginBottom: 15 }]} // extra spacing
                  placeholder="Enter Email ID"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />

                {/* ✅ Phone */}
                <TextInput
                  style={[commonStyles.input, { marginBottom: 25 }]} // more space before button
                  placeholder="Enter 10-digit phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={10}
                />

                {/* ✅ Get OTP */}
                <TouchableOpacity style={commonStyles.button} onPress={handleGetOtp}>
                  <Text style={commonStyles.buttonText}>Get OTP</Text>
                </TouchableOpacity>

                {/* ✅ Back Button */}
                <View style={{ marginTop: 25, alignItems: "center" }}>
                  <TouchableOpacity onPress={() => router.replace("/")}>
                    <Text
                      style={{
                        color: colors.primary,
                        fontSize: 22,
                        fontWeight: "700",
                      }}
                    >
                      ⬅
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {/* ✅ Enter OTP Title */}
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 18,
                    fontWeight: "600",
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                >
                  Enter OTP
                </Text>

                {/* ✅ OTP Inputs */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginVertical: 15,
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
                        marginHorizontal: 5,
                        backgroundColor: "#fff",
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

                {/* ✅ Verify OTP */}
                <TouchableOpacity
                  style={[commonStyles.button, { marginTop: 10 }]}
                  onPress={verifyOtp}
                >
                  <Text style={commonStyles.buttonText}>Verify OTP</Text>
                </TouchableOpacity>

                {/* 🔁 Resend OTP */}
                <TouchableOpacity
                  style={{
                    marginTop: 15,
                    alignItems: "center",
                    opacity: resendTimer > 0 ? 0.6 : 1,
                  }}
                  disabled={resendTimer > 0}
                  onPress={handleResendOtp}
                >
                  <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 16 }}>
                    {resendTimer > 0
                      ? `Resend OTP in ${resendTimer}s`
                      : "Resend OTP 🔁"}
                  </Text>
                </TouchableOpacity>

                {/* ✅ Back Button */}
                <View
                  style={{
                    marginTop: 25,
                    alignItems: "center",
                    marginBottom: 40,
                  }}
                >
                  <TouchableOpacity onPress={() => router.replace("/")}>
                    <Text
                      style={{
                        color: colors.primary,
                        fontSize: 22,
                        fontWeight: "700",
                      }}
                    >
                      ⬅
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Toast />
    </>
  );
}
