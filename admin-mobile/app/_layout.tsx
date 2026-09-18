import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AdminAuthProvider } from "../context/AdminAuthContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AdminAuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AdminAuthProvider>
    </SafeAreaProvider>
  );
}
