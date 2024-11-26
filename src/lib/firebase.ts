import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  // Your Firebase config here (copy from Firebase Console)
  apiKey: "AIzaSyCIoRUWf_qSAWh2CxyTJlP2OvRA_gS4TZo",
  authDomain: "railway-voting-system.firebaseapp.com",
  projectId: "railway-voting-system",
  databaseURL: "https://railway-voting-system-default-rtdb.asia-southeast1.firebasedatabase.app", // Add this line
  storageBucket: "railway-voting-system.firebasestorage.app",
  messagingSenderId: "100736759573",
  appId: "1:100736759573:web:a437a30a97ce1f49b2ef0b"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);