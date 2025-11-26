import { doc, setDoc, getDoc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase/firebase";

/**
 * Service to handle user data in Firestore
 */
const UserService = {
  /**
   * Create or update user profile in Firestore
   * @param {Object} user - Firebase Auth user object
   * @param {Object} additionalData - Extra data to save
   */
  async createUserProfile(user, additionalData = {}) {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { email, displayName, photoURL } = user;
      const createdAt = serverTimestamp();

      try {
        await setDoc(userRef, {
          email,
          displayName,
          photoURL,
          createdAt,
          lastActive: createdAt,
          level: "beginner",
          learnedPhrases: [],
          history: [],
          preferences: {
            theme: "light",
            notifications: true
          },
          ...additionalData
        });
      } catch (error) {
        console.error("Error creating user profile", error);
      }
    } else {
      // Update last active
      await updateDoc(userRef, {
        lastActive: serverTimestamp()
      });
    }

    return userRef;
  },

  /**
   * Get user profile data
   * @param {string} uid - User ID
   */
  async getUserProfile(uid) {
    if (!uid) return null;
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return userSnap.data();
      }
    } catch (error) {
      console.error("Error fetching user profile", error);
    }
    return null;
  },

  /**
   * Update user progress (level, learned phrases, etc.)
   * @param {string} uid - User ID
   * @param {Object} data - Data to update
   */
  async updateUserProgress(uid, data) {
    if (!uid) return;
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        ...data,
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating user progress", error);
    }
  },

  /**
   * Add a learned phrase to the user's list
   * @param {string} uid - User ID
   * @param {Object} phrase - Phrase object
   */
  async addLearnedPhrase(uid, phrase) {
    if (!uid) return;
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        learnedPhrases: arrayUnion(phrase),
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding learned phrase", error);
    }
  },

  /**
   * Record a study session in history
   * @param {string} uid - User ID
   * @param {Object} sessionData - Session details
   */
  async recordSession(uid, sessionData) {
    if (!uid) return;
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        history: arrayUnion({
          ...sessionData,
          date: new Date().toISOString()
        }),
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error("Error recording session", error);
    }
  },
  /**
   * Calculate unlocked weeks based on user creation date
   * @param {Object} user - User object with createdAt timestamp
   * @returns {number} Max unlocked week number
   */
  getUnlockedWeeks(user) {
    if (!user || !user.createdAt) return 1;

    // Convert Firestore Timestamp to Date
    const created = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
    const now = new Date();
    
    // Calculate days difference
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Unlock 1 week every 7 days (Week 1 is always unlocked)
    // Days 0-6: Week 1
    // Days 7-13: Week 1, 2
    // etc.
    const weeksUnlocked = Math.floor(diffDays / 7) + 1;
    
    return weeksUnlocked;
  }
};

export default UserService;
