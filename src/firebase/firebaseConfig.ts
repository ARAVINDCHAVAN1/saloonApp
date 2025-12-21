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

// ✅ NEW Firebase configuration (from your screenshot)
const firebaseConfig = {
  apiKey: "AIzaSyB7ivMFCg1rLv-_SUTYT18OrMNRtrm0dA8",
  authDomain: "salonapp-c560e.firebaseapp.com",
  projectId: "salonapp-c560e",
  storageBucket: "salonapp-c560e.firebasestorage.app",
  messagingSenderId: "1031879219612",
  appId: "1:1031879219612:web:a852058f8523aa021a9059",
  measurementId: "G-VM0RZQENCR",
};

// ✅ Initialize App safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Initialize Auth with persistence (for Expo)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

// ✅ Firestore & Storage exports
export const db = getFirestore(app);
export const storage = getStorage(app);

export { app, auth };

// Default export (required by Expo Router)
export default app;
