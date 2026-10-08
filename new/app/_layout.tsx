import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { SavedProvider } from "../context/SavedContext";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <SavedProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </SavedProvider>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}


