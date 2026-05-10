// firebase.js — Firebase の初期化（共通）
 
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
 
const firebaseConfig = {
  apiKey: "AIzaSyAHsN_Yxi13_06QVCnU-MSabdM9dFzJlO4",
  authDomain: "kakecafe-25695.firebaseapp.com",
  projectId: "kakecafe-25695",
  storageBucket: "kakecafe-25695.firebasestorage.app",
  messagingSenderId: "761704680546",
  appId: "1:761704680546:web:5266850af1bafb7ea1953b",
  measurementId: "G-HLSN74RB33"
};
 
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
 