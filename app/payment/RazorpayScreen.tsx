// app/customer/payment.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

export default function PaymentScreen() {
  const router = useRouter();
  const [showWebView, setShowWebView] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);

  const amount = 100; // ₹1.00 = 100 paise
  const currency = "INR";
  const keyId = "rzp_test_1234567890"; // 🔑 Replace with your Razorpay Test Key ID

  // create dummy order id for demo (in production from backend)
  useEffect(() => {
    setOrderId("order_" + Date.now());
  }, []);

  // HTML for Razorpay Checkout
  const razorpayHTML = useMemo(() => `
    <!DOCTYPE html>
    <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
      <body>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
          const options = {
            key: "${keyId}",
            amount: "${amount}",
            currency: "${currency}",
            name: "FlyZone",
            description: "Service Payment",
            order_id: "${orderId}",
            prefill: {
              name: "Test User",
              email: "user@example.com",
              contact: "9999999999"
            },
            theme: { color: "#3399cc" },
            handler: function (response){
              window.ReactNativeWebView.postMessage(JSON.stringify({
                event: "success",
                response: response
              }));
            },
            modal: {
              ondismiss: function(){
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  event: "cancel"
                }));
              }
            }
          };
          const rzp = new Razorpay(options);
          rzp.open();
        </script>
      </body>
    </html>
  `, [orderId]);

  // Handle WebView messages
  const handleWebMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.event === "success") {
      setShowWebView(false);
      alert("✅ Payment successful!\nPayment ID: " + data.response.razorpay_payment_id);
      router.push("/customer/customer-dashboard"); // redirect after payment
    } else if (data.event === "cancel") {
      setShowWebView(false);
      alert("❌ Payment cancelled by user.");
    }
  };

  if (showWebView) {
    return (
      <WebView
        originWhitelist={["*"]}
        source={{ html: razorpayHTML }}
        onMessage={handleWebMessage}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pay ₹1.00 (Test Payment)</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowWebView(true)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Pay Now</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20, marginBottom: 20 },
  button: { backgroundColor: "#111", padding: 14, borderRadius: 8 },
  btnText: { color: "#fff", fontSize: 16 },
});
