// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";
import { 
  getAuth, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";

// Your web app's Firebase configuration
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Autenticación
export const auth = getAuth(app);

// Firestore (lo usaremos para memoria del usuario)
export const db = getFirestore(app);

// Storage (Reemplazado por Cloudinary)
// export const storage = getStorage(app);

// Providers (Google login opcional)
export const googleProvider = new GoogleAuthProvider();

// Funciones para Login / Signup
export const emailSignup = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const emailLogin = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const googleLogin = () => signInWithPopup(auth, googleProvider);

export const logout = () => signOut(auth);