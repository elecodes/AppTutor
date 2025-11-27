// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8tcidJsblicI_u2c77zHR6NRUnzwRtEE",
  authDomain: "apptutor-a4230.firebaseapp.com",
  projectId: "apptutor-a4230",
  storageBucket: "apptutor-a4230.firebasestorage.app",
  messagingSenderId: "615122073666",
  appId: "1:615122073666:web:25054fde560ce9dde395db",
  measurementId: "G-RKSKS0CYRR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Autenticación
export const auth = getAuth(app);

// Firestore (lo usaremos para memoria del usuario)
export const db = getFirestore(app);

// Providers (Google login opcional)
export const googleProvider = new GoogleAuthProvider();

// Funciones para Login / Signup
export const emailSignup = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const emailLogin = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const googleLogin = () => signInWithPopup(auth, googleProvider);

export const logout = () => signOut(auth);