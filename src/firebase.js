import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD8gW44V6iQ39aww9ErVUheVZVteZMVxH8",
  authDomain: "react-firebase-chat-app-cc64c.firebaseapp.com",
  projectId: "react-firebase-chat-app-cc64c",
  storageBucket: "react-firebase-chat-app-cc64c.appspot.com",
  messagingSenderId: "67690789740",
  appId: "1:67690789740:web:0ac0c30f829d5025f8d149",
  measurementId: "G-D0E81275SB",
  databaseURL:
    "https://react-firebase-chat-app-cc64c-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth();
