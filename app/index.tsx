import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function RoleSelectScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Beauty Salon And Spa💇‍♀️💇‍♂️</Text>
      <Text style={styles.subtitle}>Please select your role to continue</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/user-login")}>
        <Text style={styles.buttonText}>👤 User</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/shop-owner-register")}>
        <Text style={styles.buttonText}>🏪 Shop Owner</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#f7f7f7" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 10, color: "#222" },
  subtitle: { fontSize: 16, marginBottom: 30, color: "#666" },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" }
});
