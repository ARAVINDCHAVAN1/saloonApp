import { StyleSheet } from "react-native";

export const colors = {
  primary: "#007AFF",     // blue
  secondary: "#FF9500",   // orange
  success: "#34C759",     // green
  background: "#f9f9f9",
  text: "#222",
  subtitle: "#666",
  white: "#fff",
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: colors.subtitle,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    width: "100%",
    backgroundColor: colors.white,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 10,
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
  },
});
