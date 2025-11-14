import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../styles/theme";

export default function ReturnPolicy() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
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
            flex: 1,
            textAlign: "center",
            fontSize: 20,
            fontWeight: "700",
            color: "#000",
            marginRight: 34,
          }}
        >
          Return Policy
        </Text>
      </View>

      {/* 📜 Return Policy Content */}
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
          Beauty Centre Refund & Return Policy 💅
        </Text>

        <Text style={styles.paragraph}>
          At Beauty Centre, we aim to provide the best salon experience to our
          customers. This Return & Refund Policy explains the conditions under
          which refunds or returns may be applicable for your bookings and
          purchases made through the app.
        </Text>

        {/* Section 1 */}
        <Text style={styles.sectionTitle}>1. Service Bookings</Text>
        <Text style={styles.paragraph}>
          • Bookings once confirmed are **non-refundable**, unless canceled by
          the salon.{"\n"}
          • If you need to reschedule your appointment, please contact the salon
          at least **2 hours before** your scheduled time.{"\n"}
          • Failure to show up without prior notice will not be eligible for a
          refund or reschedule.
        </Text>

        {/* Section 2 */}
        <Text style={styles.sectionTitle}>2. Salon Cancellations</Text>
        <Text style={styles.paragraph}>
          • In rare cases, salons may need to cancel or reschedule due to
          unavoidable reasons (staff unavailability, equipment issues, etc.).{"\n"}
          • In such cases, the **full amount** paid will either be refunded or
          credited to your account for future use.{"\n"}
          • Refunds are processed within **5–7 business days**.
        </Text>

        {/* Section 3 */}
        <Text style={styles.sectionTitle}>3. Product Returns</Text>
        <Text style={styles.paragraph}>
          • If you purchase products (such as cosmetics or beauty tools) via the
          app, please ensure they are unused and in original packaging for
          returns.{"\n"}
          • Returns are accepted **within 7 days** of delivery, provided the
          product is defective or damaged upon receipt.{"\n"}
          • Used or opened products are **not eligible** for return due to
          hygiene reasons.
        </Text>

        {/* Section 4 */}
        <Text style={styles.sectionTitle}>4. Refund Process</Text>
        <Text style={styles.paragraph}>
          • Approved refunds will be initiated through the **original payment
          method**.{"\n"}
          • Depending on your bank or payment provider, the amount may take
          5–10 working days to reflect.{"\n"}
          • You will receive an email or notification once your refund is
          processed successfully.
        </Text>

        {/* Section 5 */}
        <Text style={styles.sectionTitle}>5. Non-Refundable Conditions</Text>
        <Text style={styles.paragraph}>
          • Late arrival resulting in missed appointments.{"\n"}
          • Dissatisfaction with a service that was delivered as booked.{"\n"}
          • Services that have already been started or completed.{"\n"}
          • Change of mind after service initiation.
        </Text>

        {/* Section 6 */}
        <Text style={styles.sectionTitle}>6. Need Assistance?</Text>
        <Text style={styles.paragraph}>
          For any refund or return-related questions, please reach out to our
          support team at{" "}
          <Text style={{ color: colors.primary, fontWeight: "600" }}>
            support@beautycentre.com
          </Text>{" "}
          or contact the salon directly.
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
