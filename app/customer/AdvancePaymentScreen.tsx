// app/customer/AdvancePaymentScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";

import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";

const RAZORPAY_KEY = "rzp_live_Rl65VFlmszaAzA";

export default function AdvancePaymentScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    id?: string;
    salonId?: string;
    userId?: string;
  }>();

  const bookingId = params.id ? String(params.id) : undefined;

  const [booking, setBooking] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [salonName, setSalonName] = useState("Salon");

  /* ✅ LIVE ADVANCE BOOKING */
  useEffect(() => {
    if (!bookingId) {
      Alert.alert("Error", "Invalid booking ID");
      router.back();
      return;
    }

    const ref = doc(db, "advanceBookings", bookingId);

    const unsub = onSnapshot(ref, async snap => {
      if (snap.exists()) {
        const data = snap.data();
        setBooking({ id: snap.id, ...data });

        // ✅ Fetch Salon Name if not stored
        if (data.salonId && !data.salonName) {
          const salonSnap = await getDoc(doc(db, "salons", String(data.salonId)));
          if (salonSnap.exists()) {
            setSalonName(salonSnap.data()?.shopName || "Salon");
          }
        } else {
          setSalonName(data.salonName || "Salon");
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [bookingId]);

  /* ✅ PAYMENT HISTORY */
  useEffect(() => {
    if (!bookingId) return;

    const loadPayments = async () => {
      const q = query(
        collection(db, "payments"),
        where("advanceBookingId", "==", bookingId)
      );
      const snap = await getDocs(q);
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    loadPayments();
  }, [bookingId]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 60 }} />;
  }

  if (!booking) {
    return (
      <Text style={{ marginTop: 60, textAlign: "center" }}>
        Booking not found.
      </Text>
    );
  }

  const status = String(booking.status || "").toLowerCase();
  const isPaid = booking.paymentStatus === "paid";

  /* ✅ PAYMENT */
  const confirmPayment = async () => {
    if (!booking?.amount) {
      Alert.alert("Invalid amount");
      return;
    }

    setPaying(true);

    const options = {
      description: "Advance Booking Payment",
      currency: "INR",
      key: RAZORPAY_KEY,
      amount: Number(booking.amount) * 100,
      name: "Advance Booking",
      theme: { color: colors.primary },
    };

    RazorpayCheckout.open(options)
      .then(async (data: any) => {

        await updateDoc(doc(db, "advanceBookings", booking.id), {
          paymentStatus: "paid",
          paymentId: data.razorpay_payment_id,
          paidAt: new Date(),
        });

        await addDoc(collection(db, "payments"), {
          advanceBookingId: booking.id,
          amount: booking.amount,
          paymentId: data.razorpay_payment_id,
          status: "paid",
          date: new Date().toDateString(),
          userId: booking.userId,
          salonId: booking.salonId,
          createdAt: new Date(),
        });

        Alert.alert("✅ Payment Successful");
      })
      .catch(() => Alert.alert("Payment Cancelled"))
      .finally(() => setPaying(false));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>

      {/* HEADER */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary,
        paddingTop: 45,
        paddingBottom: 12,
        paddingHorizontal: 15,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: "700", marginLeft: 15 }}>
          Advance Payment
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>

        <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 16 }}>
          Advance Booking Details
        </Text>

        {/* ✅ FIXED SALON NAME */}
        <Text>Salon: {salonName}</Text>
        <Text>Date: {booking.date}</Text>
        <Text>Slot: {booking.fromTime} - {booking.toTime}</Text>
        <Text>Amount: ₹{booking.amount}</Text>

        {/* CANCELLED */}
        {status === "cancelled" && (
          <View style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 10,
            backgroundColor: "#ffeaea",
            borderWidth: 1,
            borderColor: "#ffbcbc"
          }}>
            <Text style={{ color: "red", fontWeight: "800", fontSize: 16 }}>
              ❌ Booking Cancelled
            </Text>
            <Text style={{ marginTop: 6 }}>Reason:</Text>
            <Text style={{ fontWeight: "700", marginTop: 4 }}>
              {booking.cancelReason || "No reason provided"}
            </Text>
          </View>
        )}

        {/* PAID */}
        {isPaid && (
          <Text style={{ color: "green", marginTop: 14, fontWeight: "700" }}>
            ✅ Payment Completed
          </Text>
        )}

        {/* APPROVED */}
        {status === "approved" && !isPaid && (
          <>
            <Text style={{ marginTop: 14, color: "orange", fontWeight: "700" }}>
              ✅ Approved – Payment Required
            </Text>

            <TouchableOpacity
              onPress={confirmPayment}
              disabled={paying}
              style={{
                backgroundColor: colors.primary,
                marginTop: 20,
                padding: 14,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              {paying ? <ActivityIndicator /> : <Text>Pay Now</Text>}
            </TouchableOpacity>
          </>
        )}

        {/* WAITING */}
        {status !== "approved" && status !== "cancelled" && !isPaid && (
          <Text style={{ marginTop: 14, color: "#777" }}>
            Waiting for salon approval...
          </Text>
        )}

        {/* PAYMENT HISTORY */}
        {payments.length > 0 && (
          <View style={{ marginTop: 25 }}>
            <Text style={{ fontWeight: "800", marginBottom: 10 }}>
              Payment History
            </Text>

            {payments.map((p) => (
              <View
                key={p.id}
                style={{
                  borderWidth: 1,
                  borderRadius: 8,
                  borderColor: "#ddd",
                  padding: 10,
                  marginBottom: 8,
                }}
              >
                <Text>₹{p.amount}</Text>
                <Text>Date: {p.date}</Text>
                <Text>Status: {p.status}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}
