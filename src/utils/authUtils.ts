import AsyncStorage from "@react-native-async-storage/async-storage";

/** Save user session */
export const setSession = async (role: string, data: any) => {
  await AsyncStorage.multiSet([
    ["isLoggedIn", "true"],
    ["role", role],
    ["userId", data.id || ""],
    ["userName", data.name || ""],
  ]);
};

/** Check session (returns role if logged in) */
export const checkSession = async () => {
  const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
  const role = await AsyncStorage.getItem("role");
  if (isLoggedIn === "true") return role;
  return null;
};

/** Clear session */
export const clearSession = async () => {
  await AsyncStorage.multiRemove([
    "isLoggedIn",
    "role",
    "userId",
    "userName",
    "salonId",
    "shopName",
  ]);
};
