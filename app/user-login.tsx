import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function UserLoginScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 User Login</Text>
      <Text style={styles.subtitle}>This is a mock login (OTP will come later)</Text>

      <TouchableOpacity style={styles.button} onPress={() => alert("Logged in as User")}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>⬅ Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20, color: "#666" },
  button: { backgroundColor: "#34C759", padding: 15, borderRadius: 10, width: "80%", alignItems: "center", marginBottom: 20 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  backButton: { marginTop: 10 },
  backText: { fontSize: 16, color: "#007AFF" }
});
