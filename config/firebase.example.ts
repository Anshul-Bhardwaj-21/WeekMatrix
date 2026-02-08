import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
// You can either use environment variables or replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "", // Your API key
  authDomain: "", // Auth Domain
  projectId: "", // Project Id
  storageBucket: "", // Storage Bucket
  messagingSenderId: "", // Messaging Sender Id
  appId: "", // App Is
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
