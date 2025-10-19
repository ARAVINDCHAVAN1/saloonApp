// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCJ8BzldZMYU9rRTnFD5Ain0wTDsYWPelg",
  projectId: "salonapp-ae939",
  storageBucket: "salonapp-ae939.appspot.com", // 👈 fix: use .appspot.com instead of .app
  messagingSenderId: "791154333015",
  appId: "1:791154333015:web:14070368440ee515985a12",
  measurementId: "G-6BMP6CCQDJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
