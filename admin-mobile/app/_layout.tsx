import React, { useEffect } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AdminAuthProvider } from "../context/AdminAuthContext";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const styleId = "admin-web-global-styles";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          *:focus, *:focus-visible {
            outline: none !important;
            box-shadow: none !important;
          }
          body {
            background-color: #F8FAFC;
            -webkit-tap-highlight-color: transparent;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AdminAuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AdminAuthProvider>
    </SafeAreaProvider>
  );
}

