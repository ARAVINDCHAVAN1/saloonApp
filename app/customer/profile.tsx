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
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { db } from "../../src/firebase/firebaseConfig";
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

      Toast.show({
        type: "success",
        text1: "Profile Updated 🎉",
        text2: "Your information has been saved successfully.",
        position: "bottom",
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Something went wrong. Please try again.",
        position: "bottom",
      });
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["customer", "isLoggedIn"]);
    Toast.show({ type: "info", text1: "Logged out", position: "bottom" });
    router.replace("/customer/login");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      {/* 🔹 Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.primary,
          paddingHorizontal: 15,
          paddingTop: 45,
          paddingBottom: 15,
          elevation: 3,
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

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        {/* 👤 Avatar Section */}
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <View
            style={{
              backgroundColor: colors.primary,
              width: 100,
              height: 100,
              borderRadius: 50,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: "#fff",
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 38, fontWeight: "700", color: "#000" }}>
              {user?.email?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#333",
              marginTop: 10,
            }}
          >
            {email || "Your Email"}
          </Text>
        </View>

        {/* 📄 Personal Info */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 18,
            marginBottom: 25,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 15,
              color: colors.primary,
            }}
          >
            Personal Details
          </Text>

          {/* Email */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
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
                <Text style={{ color: "#222", fontSize: 15, marginTop: 3 }}>
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
                <Text style={{ color: "#222", fontSize: 15, marginTop: 3 }}>
                  {phone || "Not provided"}
                </Text>
              )}
            </View>
          </View>

          {/* Edit / Save Button */}
          <TouchableOpacity
            style={{
              backgroundColor: editable ? "#28a745" : colors.primary,
              borderRadius: 8,
              paddingVertical: 10,
              marginTop: 20,
              alignItems: "center",
            }}
            onPress={editable ? handleSave : () => setEditable(true)}
          >
            <Text
              style={{
                color: editable ? "#fff" : "#000",
                fontWeight: "700",
                fontSize: 15,
              }}
            >
              {editable ? "Save Changes" : "Edit Profile"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🌸 Privacy Center */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            marginBottom: 10,
            color: colors.primary,
          }}
        >
          Privacy & Help Center
        </Text>

        {/* Earn with Beauty Centre */}
        <TouchableOpacity
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            elevation: 2,
          }}
          onPress={() => router.push("/customer/earn-with-beauty")}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#333" }}>
            💅 Earn with Beauty Centre
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#777",
              marginTop: 5,
              lineHeight: 20,
            }}
          >
            Join our upcoming beauty partnership program and start earning by
            collaborating with leading salons and stylists. (Coming Soon)
          </Text>
        </TouchableOpacity>

        {/* 📜 Terms, Policies & License */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            elevation: 2,
          }}
        >
          <Text
            style={{ fontWeight: "700", fontSize: 17, color: colors.primary, marginBottom: 10 }}
          >
            Terms, Policies & License
          </Text>
          {[
            { name: "📘 Terms of Use", link: "/customer/terms" },
            { name: "🔒 Privacy Policy", link: "/customer/privacy-policy" },
            { name: "📦 Return Policy", link: "/customer/return-policy" },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={{ paddingVertical: 6 }}
              onPress={() => router.push(item.link)}
            >
              <Text style={{ color: "#555", fontSize: 14 }}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 💬 Help Center */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 20,
            elevation: 2,
            marginBottom: 40,
          }}
        >
          <Text
            style={{ fontWeight: "700", fontSize: 17, color: colors.primary, marginBottom: 10 }}
          >
            Help & Support
          </Text>
          {/* ✅ Browse FAQ redirect added */}
          <TouchableOpacity
            style={{ paddingVertical: 6 }}
            onPress={() => router.push("/customer/help-center")}
          >
            <Text style={{ color: "#555", fontSize: 14 }}>📄 Browse FAQ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ paddingVertical: 6 }}
            onPress={handleLogout}
          >
            <Text style={{ color: "red", fontSize: 14 }}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomerBottomNav />
    </View>
  );
}
