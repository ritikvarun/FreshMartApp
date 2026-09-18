import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { ENDPOINTS } from "../config/api";

export interface User {
  _id?: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
});

const TOKEN_KEY = "freshmart_auth_token";
const USER_KEY = "freshmart_auth_user";

async function saveStorageItem(key: string, value: string) {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.warn("Storage save error:", error);
  }
}

async function getStorageItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.warn("Storage get error:", error);
    return null;
  }
}

async function removeStorageItem(key: string) {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.warn("Storage delete error:", error);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load persisted session on app start
  useEffect(() => {
    async function loadSession() {
      try {
        const storedToken = await getStorageItem(TOKEN_KEY);
        const storedUser = await getStorageItem(USER_KEY);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.warn("Error loading stored auth session", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  // Login handler
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Invalid credentials. Please try again.",
        };
      }

      const receivedToken = data.token;
      const loggedInUser: User = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      setToken(receivedToken);
      setUser(loggedInUser);

      if (receivedToken) {
        await saveStorageItem(TOKEN_KEY, receivedToken);
      }
      await saveStorageItem(USER_KEY, JSON.stringify(loggedInUser));

      return { success: true };
    } catch (error: any) {
      console.error("Login request error:", error);
      return {
        success: false,
        message:
          "Unable to connect to backend server. Make sure the backend is running (`npm run dev` in backend).",
      };
    }
  };

  // Register handler
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(ENDPOINTS.AUTH.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Registration failed. Please try again.",
        };
      }

      const receivedToken = data.token;
      const registeredUser: User = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      setToken(receivedToken);
      setUser(registeredUser);

      if (receivedToken) {
        await saveStorageItem(TOKEN_KEY, receivedToken);
      }
      await saveStorageItem(USER_KEY, JSON.stringify(registeredUser));

      return { success: true };
    } catch (error: any) {
      console.error("Registration request error:", error);
      return {
        success: false,
        message:
          "Unable to connect to backend server. Make sure the backend is running (`npm run dev` in backend).",
      };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      // Notify backend if online
      fetch(ENDPOINTS.AUTH.LOGOUT).catch(() => {});
    } finally {
      setUser(null);
      setToken(null);
      await removeStorageItem(TOKEN_KEY);
      await removeStorageItem(USER_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
