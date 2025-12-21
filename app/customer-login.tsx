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

  const inputRefs = Array.from({ length: 6 }, () =>
    useRef<TextInput | null>(null)
  );

  // EMAIL VALIDATION
  const isValidEmail = (email: string) => {
    const trimmed = email.trim();
    if (!trimmed.includes("@")) return false;
    const parts = trimmed.split("@");
    if (parts.length !== 2) return false;
    if (!parts[1].includes(".")) return false;
    return true;
  };

  // CHECK LOGIN
  useEffect(() => {
    (async () => {
      const loggedIn = await AsyncStorage.getItem("isLoggedIn");
      if (loggedIn === "true") router.replace("/customer");
    })();
  }, []);

  // RESEND TIMER
  useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // SAVE CUSTOMER
  const saveCustomerToFirestore = async (email, phone, otp) => {
    try {
      const customersRef = collection(db, "customers");
      const existing = await getDocs(
        query(customersRef, where("phone", "==", phone))
      );

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

  // GET OTP
  const handleGetOtp = async () => {
    if (!email.trim()) {
      Toast.show({ type: "info", text1: "Enter Email" });
      return;
    }

    if (!isValidEmail(email)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email with @ and .",
      });
      return;
    }

    // NEW LOGIC — EMAIL VALID BUT PHONE EMPTY
    if (!phone.trim()) {
      Toast.show({
        type: "error",
        text1: "Phone Missing",
        text2: "Please enter your 10-digit phone number",
      });
      return;
    }

    if (phone.length !== 10) {
      Toast.show({
        type: "error",
        text1: "Invalid Phone Number",
        text2: "Phone must be 10 digits",
      });
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
       visibilityTime: 600000, // ⏱ 10 minutes
  autoHide: true,
    });
  };

  // RESEND OTP
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

  // VERIFY OTP
  const verifyOtp = async () => {
    const otp = otpDigits.join("");

    if (otp === generatedOtp) {
      const customerId = await saveCustomerToFirestore(
        email,
        phone,
        generatedOtp
      );

      if (customerId) {
        await AsyncStorage.setItem(
          "customer",
          JSON.stringify({ id: customerId, email, phone })
        );
        await AsyncStorage.setItem("isLoggedIn", "true");

        Toast.show({
          type: "success",
          text1: "Login Successful 🎉",
          text2: "Welcome back!",
        });

        setTimeout(() => {
          router.replace("/customer");
        }, 800);
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Invalid OTP",
        text2: "Please try again.",
      });
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
            <Text
              style={{
                textAlign: "center",
                fontSize: 26,
                fontWeight: "800",
                color: colors.primary,
                marginBottom: 25,
              }}
            >
              👤 Customer Login
            </Text>

            {!showOtp ? (
              <>
                {/* EMAIL */}
                <TextInput
                  style={[commonStyles.input, { marginBottom: 15 }]}
                  placeholder="Enter Email ID"
                  placeholderTextColor="#999"
                  value={email}
                  keyboardType="email-address"
                  onChangeText={setEmail}
                />

                {/* PHONE NUMBERS ONLY */}
                <TextInput
                  style={[commonStyles.input, { marginBottom: 25 }]}
                  placeholder="Enter 10-digit phone number"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={phone}
                  maxLength={10}
                  onChangeText={(text) => {
                    const onlyNums = text.replace(/[^0-9]/g, "");
                    setPhone(onlyNums);
                  }}
                />

                {/* GET OTP */}
                <TouchableOpacity
                  style={commonStyles.button}
                  onPress={handleGetOtp}
                >
                  <Text style={commonStyles.buttonText}>Get OTP</Text>
                </TouchableOpacity>

                {/* BACK BUTTON */}
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
                {/* OTP TITLE */}
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

                {/* OTP BOXES */}
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
                        const updated = [...otpDigits];
                        updated[index] = text;
                        setOtpDigits(updated);

                        // MOVE NEXT
                        if (text && index < 5) {
                          inputRefs[index + 1].current?.focus();
                        }
                      }}
                      onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === "Backspace") {
                          if (otpDigits[index] !== "") {
                            // CLEAR CURRENT BOX
                            const updated = [...otpDigits];
                            updated[index] = "";
                            setOtpDigits(updated);
                          } else {
                            // MOVE TO PREVIOUS
                            if (index > 0) {
                              inputRefs[index - 1].current?.focus();
                            }
                          }
                        }
                      }}
                    />
                  ))}
                </View>

                {/* VERIFY */}
                <TouchableOpacity
                  style={[commonStyles.button, { marginTop: 10 }]}
                  onPress={verifyOtp}
                >
                  <Text style={commonStyles.buttonText}>Verify OTP</Text>
                </TouchableOpacity>

                {/* RESEND OTP */}
                <TouchableOpacity
                  style={{
                    marginTop: 15,
                    alignItems: "center",
                    opacity: resendTimer > 0 ? 0.6 : 1,
                  }}
                  disabled={resendTimer > 0}
                  onPress={handleResendOtp}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: "600",
                      fontSize: 16,
                    }}
                  >
                    {resendTimer > 0
                      ? `Resend OTP in ${resendTimer}s`
                      : "Resend OTP 🔁"}
                  </Text>
                </TouchableOpacity>

                {/* BACK */}
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
