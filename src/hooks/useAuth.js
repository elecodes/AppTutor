import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, emailLogin, emailSignup, googleLogin, logout } from "../../firebase/firebase";
import UserService from "../services/UserService";

/**
 * Hook to manage authentication state and user data
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser(firebaseUser);
        
        // Create or fetch user profile in Firestore
        try {
          await UserService.createUserProfile(firebaseUser);
          const profile = await UserService.getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error("Error loading user profile:", err);
        }
      } else {
        // User is signed out
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      await emailLogin(email, password);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await emailSignup(email, password);
      // Create profile immediately after signup
      await UserService.createUserProfile(result.user);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await googleLogin();
      await UserService.createUserProfile(result.user);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut: signOutUser,
    setUserProfile // Allow manual updates to local profile state if needed
  };
}
