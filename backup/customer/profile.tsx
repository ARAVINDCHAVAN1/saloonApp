// app/customer/Profile.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Toast from "react-native-toast-message";
import { db } from "../../firebaseConfig";
import { colors } from "../../styles/theme";
import CustomerBottomNav from "./CustomerBottomNav";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [editable, setEditable] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const data = await AsyncStorage.getItem("customer");
      if (data) {
        const parsed = JSON.parse(data);
        setUser(parsed);
        setEmail(parsed.email || "");
        setPhone(parsed.phone || "");
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "customers", user.id);
      await updateDoc(userRef, { email, phone });
      const updated = { ...user, email, phone };
      await AsyncStorage.setItem("customer", JSON.stringify(updated));
      setUser(updated);
      setEditable(false);

      // Success toast
      Toast.show({
        type: "success",
        text1: "Profile Updated 🎉",
        text2: "Your information has been saved.",
        position: "bottom",
      });
    } catch (err) {
      console.error("Error updating profile:", err);

      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Could not update your profile. Try again.",
        position: "bottom",
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.primary,
          paddingHorizontal: 15,
          paddingTop: 45,
          paddingBottom: 15,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#000",
            marginLeft: 15,
          }}
        >
          My Profile
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        {/* Avatar */}
        <View
          style={{
            alignItems: "center",
            marginBottom: 20,
            marginTop: 10,
          }}
        >
          <View
            style={{
              backgroundColor: colors.primary,
              width: 100,
              height: 100,
              borderRadius: 50,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 40, fontWeight: "700", color: "#000" }}>
              {user?.email?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              marginTop: 10,
              color: "#222",
            }}
          >
            {email || "Your Email"}
          </Text>
        </View>

        {/* Personal Info Section */}
        <Text
          style={{
            fontSize: 17,
            fontWeight: "700",
            marginBottom: 10,
            color: "#333",
          }}
        >
          Personal Details
        </Text>

        {/* Email + Phone Card */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 15,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          {/* Email */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Ionicons name="mail-outline" size={22} color={colors.primary} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={{ color: "#666", fontSize: 13 }}>Email</Text>
              {editable ? (
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: "#ddd",
                    paddingVertical: 4,
                    fontSize: 15,
                    color: "#000",
                  }}
                />
              ) : (
                <Text
                  style={{
                    color: "#222",
                    fontSize: 15,
                    fontWeight: "500",
                    marginTop: 3,
                  }}
                >
                  {email || "Not provided"}
                </Text>
              )}
            </View>
          </View>

          {/* Phone */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="call-outline" size={22} color={colors.primary} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={{ color: "#666", fontSize: 13 }}>Phone</Text>
              {editable ? (
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: "#ddd",
                    paddingVertical: 4,
                    fontSize: 15,
                    color: "#000",
                  }}
                />
              ) : (
                <Text
                  style={{
                    color: "#222",
                    fontSize: 15,
                    fontWeight: "500",
                    marginTop: 3,
                  }}
                >
                  {phone || "Not provided"}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Edit / Save Button */}
        {!editable ? (
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center",
              marginBottom: 18,
            }}
            onPress={() => setEditable(true)}
          >
            <Text style={{ color: "#000", fontWeight: "700" }}>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: "#28a745",
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center",
              marginBottom: 18,
            }}
            onPress={handleSave}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Save Changes</Text>
          </TouchableOpacity>
        )}

        {/* Terms & Conditions Header */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            marginBottom: 8,
            color: "#333",
          }}
        >
          Terms & Conditions
        </Text>

        {/* Terms Card */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 15,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 1,
            marginBottom: 30,
          }}
        >
          <Text
            style={{
              color: "#555",
              fontSize: 14,
              lineHeight: 22,
            }}
          >
            • Appointments once confirmed cannot be canceled less than 2 hours
            before the scheduled time.{"\n"}
            • Payment once made is non-refundable (unless salon cancels).{"\n"}
            • Please arrive at least 10 minutes before your appointment time.{"\n"}
            • Salon reserves the right to change prices or timings without prior notice.{"\n"}
            • Misbehavior or misconduct will result in termination of service without refund.{"\n"}
            {"\n"}
            By using this app you agree to the salon's policies and accept
            responsibility for providing accurate contact details.
          </Text>
        </View>

        {/* Small helper action: Logout */}
        <TouchableOpacity
          style={{
            alignItems: "center",
            marginBottom: 10,
          }}
          onPress={async () => {
            await AsyncStorage.removeItem("customer");
            await AsyncStorage.removeItem("isLoggedIn");
            Toast.show({ type: "info", text1: "Logged out", position: "bottom" });
            router.replace("/customer/login");
          }}
        >
        </TouchableOpacity>
      </ScrollView>

      <CustomerBottomNav />
    </View>
  );
}
