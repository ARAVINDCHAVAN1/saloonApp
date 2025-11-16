// src/firebase/firebaseConfig.ts

import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJ8BzldZMYU9rRTnFD5Ain0wTDsYWPelg",
  authDomain: "salonapp-ae939.firebaseapp.com",
  projectId: "salonapp-ae939",
  storageBucket: "salonapp-ae939.appspot.com",
  messagingSenderId: "791154333015",
  appId: "1:791154333015:web:14070368440ee515985a12",
  measurementId: "G-6BMP6CCQDJ",
};

// ✅ Initialize app safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Initialize Auth with persistence (safe retry if already initialized)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

// ✅ Firestore & Storage
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app, auth };

// ✅ Default export for Expo Router (fixes missing default export warning)
export default app;
