import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { db } from "../../src/firebase/firebaseConfig";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const [emailVerified, setEmailVerified] = useState(false);

  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([...Array(6)].map(() => React.createRef()));

  const [newPassword, setNewPassword] = useState("");
  const [salonDocId, setSalonDocId] = useState("");

  const router = useRouter();

  /* -------------------------------------------------------
        GENERATE AND SEND OTP (TOAST)
  ------------------------------------------------------- */
 const generateAndSendOtp = async () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  setGeneratedOtp(otp);

  // Reset OTP input boxes
  setOtpDigits(["", "", "", "", "", ""]);
  inputRefs.current[0].current?.focus();

  // 📧 SEND OTP EMAIL USING PHP BACKEND
  try {
    const response = await fetch("https://beautysaloncare.com/forgot-password-otp.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const result = await response.json();

    if (result.success) {
      Toast.show({
        type: "success",
        text1: "OTP Sent 📩",
        text2: "Please check your Inbox or Spam folder",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Failed to Send OTP",
        text2: result.message,
      });
    }
  } catch (e) {
    Toast.show({
      type: "error",
      text1: "Network Error",
      text2: "Unable to send OTP email",
    });
  }
};

  /* -------------------------------------------------------
        STEP 1 — VERIFY EMAIL
  ------------------------------------------------------- */
  const verifyEmail = async () => {
    if (!email.trim()) {
      Toast.show({ type: "error", text1: "Enter Email" });
      return;
    }

    setSending(true);

    try {
      const q = query(
        collection(db, "salons"),
        where("email", "==", email.toLowerCase())
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Toast.show({
          type: "error",
          text1: "Email Not Found",
          text2: "No account found with this email.",
        });
        setSending(false);
        return;
      }

      const salonDoc = snapshot.docs[0];
      setSalonDocId(salonDoc.id);

      setEmailVerified(true);
      generateAndSendOtp();

    } catch {
      Toast.show({
        type: "error",
        text1: "Server Error",
      });
    }

    setSending(false);
  };

  /* -------------------------------------------------------
        STEP 2 — VERIFY OTP
  ------------------------------------------------------- */
  const verifyOtp = () => {
    const otp = otpDigits.join("");

    if (otp === generatedOtp) {
      setOtpVerified(true);
      Toast.show({ type: "success", text1: "OTP Verified ✔" });
    } else {
      Toast.show({ type: "error", text1: "Invalid OTP" });
    }
  };

  /* -------------------------------------------------------
        STEP 3 — RESET PASSWORD
  ------------------------------------------------------- */
  const resetPassword = async () => {
    if (!newPassword.trim()) {
      Toast.show({ type: "error", text1: "Enter new password" });
      return;
    }

    try {
      await updateDoc(doc(db, "salons", salonDocId), {
        password: newPassword,
      });

      Toast.show({ type: "success", text1: "Password Updated Successfully" });

      setTimeout(() => {
        router.replace("/shop-owner/ShopOwnerLoginScreen");
      }, 1000);
    } catch {
      Toast.show({ type: "error", text1: "Failed to update password" });
    }
  };

  /* -------------------------------------------------------
        RENDER UI
  ------------------------------------------------------- */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      {/* ENTER EMAIL */}
      {!emailVerified && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter Registered Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity style={styles.btn} onPress={verifyEmail}>
            {sending ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.btnText}>Verify Email</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {/* ENTER OTP */}
      {emailVerified && !otpVerified && (
        <>
          <Text style={styles.otpLabel}>Enter OTP</Text>

          <View style={styles.otpContainer}>
            {otpDigits.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputRefs.current[index]}
                style={styles.otpBox}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(text) => {
                  const updated = [...otpDigits];
                  updated[index] = text;
                  setOtpDigits(updated);

                  if (text && index < 5) {
                    inputRefs.current[index + 1].current?.focus();
                  }
                }}
                onKeyPress={({ nativeEvent }) => {
                  if (
                    nativeEvent.key === "Backspace" &&
                    otpDigits[index] === "" &&
                    index > 0
                  ) {
                    inputRefs.current[index - 1].current?.focus();
                  }
                }}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.btn} onPress={verifyOtp}>
            <Text style={styles.btnText}>Verify OTP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 10 }}
            onPress={generateAndSendOtp}
          >
            <Text style={styles.resendText}>Resend OTP 🔁</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ENTER NEW PASSWORD */}
      {otpVerified && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter New Password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <TouchableOpacity style={styles.btn} onPress={resetPassword}>
            <Text style={styles.btnText}>Reset Password</Text>
          </TouchableOpacity>
        </>
      )}

      <Toast />
    </View>
  );
}

/* ------------------------------------------
      STYLES
-------------------------------------------*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFD600",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#FFD600",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
  },

  /* OTP BOXES */
  otpLabel: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  otpBox: {
    width: 50,
    height: 55,
    backgroundColor: "#fff",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
  },
  resendText: {
    color: "#FFD600",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
