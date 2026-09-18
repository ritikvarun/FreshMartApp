import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { ENDPOINTS } from "../config/api";

interface AdminAuthContextType {
  adminToken: string | null;
  adminUser: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  adminToken: null,
  adminUser: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: async () => {},
});

const ADMIN_TOKEN_KEY = "freshmart_admin_token";

async function saveAdminToken(token: string) {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(ADMIN_TOKEN_KEY, token);
    }
  } catch (err) {
    console.warn("Error saving admin token", err);
  }
}

async function getAdminToken(): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(ADMIN_TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(ADMIN_TOKEN_KEY);
    }
  } catch (err) {
    console.warn("Error getting admin token", err);
    return null;
  }
}

async function removeAdminToken() {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(ADMIN_TOKEN_KEY);
    }
  } catch (err) {
    console.warn("Error removing admin token", err);
  }
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check saved admin token on launch
  useEffect(() => {
    async function loadSavedToken() {
      try {
        const stored = await getAdminToken();
        if (stored) {
          setAdminToken(stored);
          // verify admin with backend
          try {
            const res = await fetch(ENDPOINTS.GET_ADMIN, {
              headers: { Authorization: `Bearer ${stored}` },
            });
            if (res.ok) {
              const data = await res.json();
              setAdminUser(data);
            }
          } catch (e) {
            console.warn("Could not verify saved admin token with backend", e);
          }
        }
      } catch (err) {
        console.warn("Error checking admin auth", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSavedToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(ENDPOINTS.ADMIN_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Invalid Admin Credentials.",
        };
      }

      const token = data.token;
      if (token) {
        setAdminToken(token);
        await saveAdminToken(token);
      }
      setAdminUser(data.admin || { email });

      return { success: true };
    } catch (err: any) {
      console.error("Admin login network error:", err);
      return {
        success: false,
        message: "Unable to connect to backend server. Make sure backend is running on port 5000.",
      };
    }
  };

  const logout = async () => {
    setAdminToken(null);
    setAdminUser(null);
    await removeAdminToken();
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminToken,
        adminUser,
        isLoading,
        isAuthenticated: !!adminToken,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
