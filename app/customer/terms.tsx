import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../styles/theme";

export default function TermsOfUse() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 🔹 Header (same style as Profile) */}
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
            marginRight: 34, // balances arrow space
          }}
        >
          Terms of Use
        </Text>
      </View>

      {/* 📜 Terms Content */}
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
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
          Welcome to Beauty Centre 💅
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: "#555",
            lineHeight: 22,
            marginBottom: 15,
          }}
        >
          These Terms of Use ("Terms") govern your access and use of the Beauty
          Centre mobile application and services. By accessing or using our
          platform, you agree to comply with and be bound by these Terms. If you
          do not agree, please discontinue using the app.
        </Text>

        {/* Section 1 */}
        <Text style={styles.sectionTitle}>1. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          • You agree to provide accurate and up-to-date information during
          registration and booking.{"\n"}
          • Misuse, fraudulent activity, or attempts to disrupt services are
          strictly prohibited.{"\n"}
          • You are responsible for maintaining confidentiality of your login
          credentials.
        </Text>

        {/* Section 2 */}
        <Text style={styles.sectionTitle}>2. Appointments & Payments</Text>
        <Text style={styles.paragraph}>
          • Appointment slots are subject to salon confirmation and availability.{"\n"}
          • Cancellations within 2 hours of the scheduled appointment may not be
          refunded.{"\n"}
          • Payments once made are non-refundable unless the salon cancels or
          reschedules.
        </Text>

        {/* Section 3 */}
        <Text style={styles.sectionTitle}>3. User Conduct</Text>
        <Text style={styles.paragraph}>
          • Please maintain respectful behavior towards staff and customers.{"\n"}
          • Offensive language, harassment, or misconduct will result in
          permanent account termination without refund.{"\n"}
          • Beauty Centre reserves the right to suspend or restrict any account
          for misuse.
        </Text>

        {/* Section 4 */}
        <Text style={styles.sectionTitle}>4. Service Modifications</Text>
        <Text style={styles.paragraph}>
          • Beauty Centre reserves the right to update, change, or discontinue
          any feature or service without prior notice.{"\n"}
          • Continued use of the app after changes means you accept the updated
          Terms.
        </Text>

        {/* Section 5 */}
        <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          • Beauty Centre acts only as a booking intermediary between users and
          salons.{"\n"}
          • We are not liable for any direct or indirect damages, service issues,
          or disputes arising between you and any salon partner.
        </Text>

        {/* Section 6 */}
        <Text style={styles.sectionTitle}>6. Contact Information</Text>
        <Text style={styles.paragraph}>
          For questions or clarifications regarding these Terms, please contact
          us at{" "}
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

/* 🪄 Common Styles */
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
