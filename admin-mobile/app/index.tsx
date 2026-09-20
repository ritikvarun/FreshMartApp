import React from "react";
import { Redirect } from "expo-router";
import { useAdminAuth } from "../context/AdminAuthContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
});
