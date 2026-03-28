import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, onAuthStateChanged, loginWithGoogle, logout as firebaseLogout, db, doc, getDoc, setDoc, FirebaseUser } from "../lib/firebase";

export type Theme = "light" | "dark";

interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  role?: string;
}

interface AppContextType {
  user: User | null;
  theme: Theme;
  isLoggedIn: boolean;
  isAuthReady: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  toggleTheme: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Handle Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // Create new user profile
          const newUser: User = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || "New User",
            email: firebaseUser.email || "",
            profilePicture: firebaseUser.photoURL || "",
            role: "user"
          };
          await setDoc(doc(db, "users", firebaseUser.uid), newUser);
          setUser(newUser);
        }
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Load theme from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  // Apply theme class to document
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const login = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (user) {
      try {
        const updatedUser = { ...user, ...updates };
        await setDoc(doc(db, "users", user.uid), updatedUser, { merge: true });
        setUser(updatedUser);
      } catch (error) {
        console.error("Profile update failed:", error);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        theme,
        isLoggedIn,
        isAuthReady,
        login,
        logout,
        toggleTheme,
        updateProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
