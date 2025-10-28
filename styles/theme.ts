// styles/theme.ts
import { StyleSheet } from "react-native";

// 🎨 Colors
export const colors = {
  background: "#000000", // App full background (black)
  primary: "#FFD700",    // Gold button
  secondary: "#FFCC00",  // Lighter gold
  textDark: "#ffffff",   // White text
  textLight: "#cccccc",  // Light gray
  cardBg: "#1a1a1a",     // Dark card background for dashboard
  inputBg: "#ffffff",
  inputBorder: "#dddddd",
  placeholder: "#777777", // extra placeholder color
  border: "#cccccc",      // generic border
};

// 🔤 Fonts
export const fonts = {
  title: {
    fontSize: 26,
    fontWeight: "bold" as const,
    color: colors.textDark,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  buttonText: {
    fontWeight: "600" as const,
    color: "#ffffff",
    fontSize: 18,
  },
};

// 🔘 Buttons
export const buttons = {
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
    alignItems: "center" as const,
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
    alignItems: "center" as const,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: colors.primary,
  },
};

// 📐 Layout
export const layout = {
  container: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 20,
    backgroundColor: colors.background,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
    resizeMode: "contain" as const,
  },
};

// 📝 Common form styles
export const commonStyles = {
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: fonts.title,
  subtitle: fonts.subtitle,
  input: {
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: "100%",
    color: "#000", // text inside input
    underlineColorAndroid: "transparent" as any,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
    alignItems: "center" as const,
  },
  buttonText: fonts.buttonText,
};

// 🗂 SubmittedScreen styles
export const submittedStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 12,
    alignItems: "center" as const,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    width: "90%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold" as const,
    marginBottom: 12,
    color: "#333",
    textAlign: "center" as const,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center" as const,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold" as const,
    fontSize: 16,
  },
};

// 📌 Header styles
export const headerStyles = {
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 4,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 8,
    resizeMode: "cover" as const,
  },
  title: {
    color: colors.textDark,
    fontSize: 18,
    fontWeight: "600" as const,
    flex: 1,
    textAlign: "center" as const,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    marginLeft: 12,
  },
};

// 📊 Dashboard card styles
export const dashboardStyles = {
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.textDark,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: colors.primary,
  },
};

export const homeStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: colors.textDark,
    marginBottom: 16,
    textAlign: "center" as const,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 10,
    color: colors.primary,
  },
  detail: {
    fontSize: 16,
    color: "#333",
    marginBottom: 6,
  },
};

// 👥 Add Staff styles
export const addStaffStyles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: colors.background },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: colors.textDark,
  },
  inputField: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.inputBg,
    color: "#000",
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: colors.textLight,
  },
  categoryRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  categoryChip: {
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    marginRight: 10,
    backgroundColor: colors.inputBg,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 15,
    color: colors.textLight,
  },
  categoryTextActive: {
    fontSize: 15,
    color: colors.background,
    fontWeight: "700",
  },
  selectedText: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 12,
    color: colors.secondary,
  },
  imageBox: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    backgroundColor: colors.inputBg,
  },
  profileImage: { width: 90, height: 90, borderRadius: 45 },
  imagePlaceholder: { color: colors.placeholder },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: { color: colors.textDark, fontWeight: "700", fontSize: 16 },
});

export const staffEditStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 16 },
  imageBox: {
    alignSelf: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 50,
    padding: 4,
    backgroundColor: colors.inputBg,
  },
  image: { width: 90, height: 90, borderRadius: 45 },
  imagePlaceholder: { color: colors.placeholder },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.inputBg,
    color: "#000",
  },
  chipContainer: { flexDirection: "row", marginBottom: 12 },
  chip: {
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    marginRight: 8,
    backgroundColor: colors.inputBg,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textLight },
  chipTextActive: { color: colors.background, fontWeight: "700" },
  saveBtn: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: {
    color: colors.textDark,
    fontWeight: "700",
    fontSize: 16,
  },
});

// 💇 Service styles
export const serviceStyles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: colors.background },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: colors.textDark,
    textAlign: "left",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: colors.inputBg,
    color: "#000",
  },
  imageBox: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: colors.cardBg,
  },
  imagePlaceholder: { color: colors.textLight },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  submitButtonText: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: colors.cardBg,
  },
  cardTitle: { color: colors.primary, fontSize: 16, fontWeight: "600" },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    marginTop: 6,
  },
  emptyText: {
    color: colors.textLight,
    textAlign: "center",
    marginTop: 20,
  },
  // ✅ New Category Chip Styles
  categoryChip: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.inputBg,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: "500",
  },
  categoryTextActive: {
    color: colors.background,
    fontWeight: "700",
  },
});

// 🖼 Images
export const images = {
  logo: require("../assets/logo.jpeg"),
};
