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
  apiKey: "AIzaSyC-DB6B9R7yuXWJq0Tm8cc5Qe952ngHPk8",
  authDomain: "apptutor-v2.firebaseapp.com",
  projectId: "apptutor-v2",
  storageBucket: "apptutor-v2.firebasestorage.app",
  messagingSenderId: "806682205124",
  appId: "1:806682205124:web:2a32b811ec08d24adba291"
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