import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
// You can either use environment variables or replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBUPcNlHfI7CD63Q8T9dQ6M34-OKFmc4L4",
  authDomain: "weekmatrix.firebaseapp.com",
  projectId: "weekmatrix",
  storageBucket: "weekmatrix.firebasestorage.app",
  messagingSenderId: "541264842906",
  appId: "1:541264842906:web:edce8eb9badd973b938f23",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
