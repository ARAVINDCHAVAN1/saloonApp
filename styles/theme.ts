// styles/theme.ts
import { Dimensions, StyleSheet } from "react-native";
const { width } = Dimensions.get("window");

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
// 👤 User Login styles
export const loginStyles = {



  
  container: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    marginBottom: 10,
    color: colors.textDark,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: colors.textLight,
    textAlign: "center" as const,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center" as const,
    marginBottom: 20,
  },
  buttonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: "600" as const,
  },
  backButton: {
    marginTop: 10,
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
  },
};
// 🔲 Popup / Modal Styles
export const popupStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
cancelText: {
  fontSize: 16,
  fontWeight: "600",
  color: "red",
  borderWidth: 1,
  borderColor: "red",
  borderRadius: 6,
  paddingVertical: 6,
  paddingHorizontal: 12,
  textAlign: "center",
},



  popup: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    elevation: 5,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#000",
  },
  optionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 6,
    width: "100%",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
 cancelText: {
  fontSize: 16,
  fontWeight: "600",
  color: "red",
  borderWidth: 1,
  borderColor: "red",
  borderRadius: 6,
  paddingVertical: 6,
  paddingHorizontal: 12,
  textAlign: "center",
},

  
});


// 📌 Leaves Approval styles
export const leavesApprovalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.cardBg,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: {
    color: colors.primary,
    fontWeight: "bold",
  },
  timeText: {
    color: colors.textLight,
  },
  reason: {
    color: colors.textDark,
  },
  status: {
    marginTop: 4,
    fontWeight: "600",
  },
  approveBtn: {
    flex: 1,
    backgroundColor: "lightgreen",
    padding: 10,
    borderRadius: 6,
    marginRight: 5,
    alignItems: "center",
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: "red",
    padding: 10,
    borderRadius: 6,
    marginLeft: 5,
    alignItems: "center",
  },
  approveText: {
    textAlign: "center",
    color: "#000",
    fontWeight: "bold",
  },
  rejectText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 10,
  },
});

export const customerDashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 5,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingHorizontal: 8,
    color: "#000",
  },
  homeButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
    elevation: 2,
  },
  content: {
    padding: 15,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 15,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  cardSubtitle: {
    color: "#666",
    marginTop: 5,
  },
});


export const salonDetailsStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light },

  heroContainer: { position: "relative", height: 300 },
  heroImage: { width: "100%", height: "100%" },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  heroTextContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
  },
  heroTitle: { color: "#fff", fontSize: 30, fontWeight: "700" },
  heroSubtitle: { color: "#ddd", marginTop: 6, fontSize: 15, lineHeight: 20 },
  bookButton: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 14,
    alignSelf: "flex-start",
  },
  bookButtonText: { color: "#fff", fontWeight: "600", marginLeft: 6 },

  aboutCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  aboutText: { color: "#555", fontSize: 15, lineHeight: 20, textAlign: "justify" },

  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingLeft: 10,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Gallery
  galleryImage: {
    width: width / 1.6,
    height: 160,
    borderRadius: 10,
    marginRight: 10,
  },

  // ✨ Menu Card (Modern Style)
  menuCardContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10,
    elevation: 4,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 1, height: 3 },
    alignItems: "center",
    justifyContent: "center",
  },
  menuCardImage: {
    width: width / 1.3,
    height: 300,
    borderRadius: 10,
  },
  menuCardPlaceholder: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 30,
    alignItems: "center",
    elevation: 2,
  },
  menuCardPlaceholderText: {
    color: "#999",
    marginTop: 10,
    fontSize: 14,
  },

  barberGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  barberCard: {
    backgroundColor: "#fff",
    width: "48%",
    alignItems: "center",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  barberImg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
    backgroundColor: "#eee",
  },
barberProfileCard: {
  width: "48%",
  borderRadius: 16,
  marginBottom: 16,
  elevation: 4,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 5,
  shadowOffset: { width: 1, height: 3 },
},
barberGradient: {
  borderRadius: 16,
  paddingVertical: 18,
  alignItems: "center",
  justifyContent: "center",
},


barberProfileImg: {
  width: 90,
  height: 90,
  borderRadius: 45,
  marginBottom: 10,
  backgroundColor: "#eee",
},
barberInfo: {
  alignItems: "center",
},

barberProfileName: {
  fontSize: 16,
  fontWeight: "700",
  color: "#222",
  marginBottom: 6,
},
barberProfileExp: {
  fontSize: 13,
  color: "#555",
  marginTop: 4,
},

barberChip: {
  backgroundColor: "#eaf7ff",
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 14,
  marginHorizontal: 4,
  fontSize: 12,
  color: "#005f8f",
  fontWeight: "600",
},

  barberName: { fontSize: 15, fontWeight: "600", color: "#222" },
  barberExp: { fontSize: 13, color: "#777", marginTop: 2 },

  serviceCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
  },
  serviceName: { fontSize: 15, color: "#333" },
  servicePrice: { fontSize: 15, fontWeight: "700", color: colors.primary },
  emptyText: { textAlign: "center", color: "#777", marginVertical: 10 },

  bottomBookNow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginBottom: 30,
    borderRadius: 25,
    paddingVertical: 14,
    elevation: 3,
  },
  bottomBookText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
});


// 🖼 Images
export const images = {
  logo: require("../assets/logo.jpeg"),
};
