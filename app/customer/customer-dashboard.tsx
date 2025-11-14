import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomerBottomNav from "./CustomerBottomNav";
import CustomerHeader from "./CustomerHeader";
import SalonList from "./SalonsList";

export default function CustomerDashboard() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* ✅ Header with Search */}
      <CustomerHeader search={search} setSearch={setSearch} />

      {/* ✅ Salon List */}
      <SalonList search={search} />

      {/* ✅ Pay Now Button (for testing Razorpay) */}
      <View style={styles.paymentContainer}>
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={() => router.push("/customer/payment")} // navigate to payment page
        >
          <Text style={styles.paymentText}>💳 Pay Now (Test)</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Bottom Navigation */}
      <CustomerBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  paymentContainer: {
    backgroundColor: "#000",
    alignItems: "center",
    paddingVertical: 12,
  },
  paymentButton: {
    backgroundColor: "#3399cc",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  paymentText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
