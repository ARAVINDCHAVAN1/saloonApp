import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    LayoutAnimation,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";
import { colors } from "../../styles/theme";

// 🪄 Enable smooth animation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HelpCenter() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How can I cancel my booking?",
      answer:
        "You can cancel your booking by visiting the 'My Bookings' section before 2 hours of your appointment time. Cancellations made after that period are non-refundable.",
    },
    {
      question: "What happens if the salon cancels my booking?",
      answer:
        "If your salon cancels due to unforeseen reasons, you will receive a full refund or a credit in your Beauty Centre wallet within 5–7 business days.",
    },
    {
      question: "How long will my refund take?",
      answer:
        "Refunds are processed immediately after approval and typically reflect in your account within 5–10 business days depending on your payment provider.",
    },
    {
      question: "Can I reschedule my appointment?",
      answer:
        "Yes! You can reschedule directly through the 'My Bookings' page up to 2 hours before your appointment time, depending on the salon’s availability.",
    },
    {
      question: "How do I report a problem or complaint?",
      answer:
        "If you encounter an issue, go to the 'Profile > Help Center' and contact support at support@beautycentre.com. We’ll resolve your issue as quickly as possible.",
    },
  ];

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

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
          Help Center
        </Text>
      </View>

      {/* 📚 FAQ List */}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: colors.primary,
            marginBottom: 10,
          }}
        >
          Browse Frequently Asked Questions 💬
        </Text>

        <Text
          style={{
            color: "#555",
            fontSize: 14,
            marginBottom: 20,
            lineHeight: 20,
          }}
        >
          Find quick answers to common questions about bookings, refunds, and
          salon policies.
        </Text>

        {/* 🔸 FAQ Accordion */}
        {faqs.map((item, index) => (
          <View
            key={index}
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              marginBottom: 10,
              elevation: 2,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 2,
              overflow: "hidden",
            }}
          >
            <TouchableOpacity
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 15,
              }}
              onPress={() => toggleExpand(index)}
            >
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 15,
                  color: "#333",
                  flex: 1,
                }}
              >
                {item.question}
              </Text>
              <Ionicons
                name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                size={20}
                color="#000"
              />
            </TouchableOpacity>

            {expandedIndex === index && (
              <View
                style={{
                  backgroundColor: "#fafafa",
                  paddingHorizontal: 15,
                  paddingBottom: 15,
                }}
              >
                <Text
                  style={{
                    color: "#555",
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  {item.answer}
                </Text>
              </View>
            )}
          </View>
        ))}

        {/* 📞 Contact Info */}
        <View style={{ marginTop: 25, padding: 15, borderTopWidth: 1, borderTopColor: "#eee" }}>
          <Text
            style={{
              textAlign: "center",
              color: "#777",
              fontSize: 13,
              lineHeight: 20,
            }}
          >
            Still need help? Contact us at{" "}
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              support@beautycentre.com
            </Text>
          </Text>
        </View>

        {/* Footer */}
        <Text
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "#888",
            marginTop: 20,
          }}
        >
          © {new Date().getFullYear()} Beauty Centre. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}
