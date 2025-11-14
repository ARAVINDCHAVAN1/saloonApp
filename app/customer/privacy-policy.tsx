import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../styles/theme";

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 🔹 Header (matches Profile + Terms page) */}
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
            flex: 1,
            textAlign: "center",
            fontSize: 20,
            fontWeight: "700",
            color: "#000",
            marginRight: 34,
          }}
        >
          Privacy Policy
        </Text>
      </View>

      {/* 📜 Policy Content */}
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 50,
        }}
      >
        {/* Introduction */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: colors.primary,
            marginBottom: 10,
          }}
        >
          Your Privacy Matters to Us 💛
        </Text>

        <Text style={styles.paragraph}>
          Beauty Centre ("we," "our," or "us") is committed to protecting your
          privacy. This Privacy Policy explains how we collect, use, and protect
          your personal information when you use our mobile app and related
          services.
        </Text>

        {/* Section 1 */}
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          • Personal details like your name, email address, phone number, and
          location (when you allow access).{"\n"}
          • Booking and payment information for appointments.{"\n"}
          • Device data (such as app version and device type) to improve
          performance.
        </Text>

        {/* Section 2 */}
        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          • To process bookings and communicate with you about appointments.{"\n"}
          • To personalize your app experience and show salons near your
          location.{"\n"}
          • To improve our platform, features, and user experience.{"\n"}
          • To send updates, offers, or alerts (only if you’ve opted in).
        </Text>

        {/* Section 3 */}
        <Text style={styles.sectionTitle}>3. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement strict technical and organizational measures to safeguard
          your personal information against unauthorized access, misuse, or
          disclosure. However, no system can be 100% secure, so we encourage you
          to use the app responsibly.
        </Text>

        {/* Section 4 */}
        <Text style={styles.sectionTitle}>4. Sharing Your Information</Text>
        <Text style={styles.paragraph}>
          • We may share limited information with trusted service providers (for
          example, payment gateways or notification partners).{"\n"}
          • We never sell or rent your data to third parties.{"\n"}
          • If required by law, we may disclose data to government authorities.
        </Text>

        {/* Section 5 */}
        <Text style={styles.sectionTitle}>5. Your Rights & Choices</Text>
        <Text style={styles.paragraph}>
          • You can update your information anytime from your profile.{"\n"}
          • You can disable location access in your device settings.{"\n"}
          • You can request account deletion by contacting our support team.
        </Text>

        {/* Section 6 */}
        <Text style={styles.sectionTitle}>6. Cookies & Tracking</Text>
        <Text style={styles.paragraph}>
          We may use cookies or similar technologies to analyze trends, track
          user activity, and remember preferences to enhance your app
          experience.
        </Text>

        {/* Section 7 */}
        <Text style={styles.sectionTitle}>7. Policy Updates</Text>
        <Text style={styles.paragraph}>
          This Privacy Policy may be updated periodically to reflect new
          features or legal requirements. Changes will be posted within the app,
          and continued use constitutes your acceptance of the updated policy.
        </Text>

        {/* Section 8 */}
        <Text style={styles.sectionTitle}>8. Contact Us</Text>
        <Text style={styles.paragraph}>
          For questions or concerns regarding your privacy, please contact us at{" "}
          <Text style={{ color: colors.primary, fontWeight: "600" }}>
            support@beautycentre.com
          </Text>
        </Text>

        {/* Footer */}
        <Text
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "#888",
            marginTop: 30,
          }}
        >
          © {new Date().getFullYear()} Beauty Centre. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}

/* ✨ Common Styles */
const styles = {
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginTop: 15,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },
};
