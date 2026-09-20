import React from "react";
import { Platform } from "react-native";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
          height: Platform.OS === "ios" ? 88 : Platform.OS === "web" ? 70 : 66,
          paddingBottom: Platform.OS === "ios" ? 26 : Platform.OS === "web" ? 8 : 8,
          paddingTop: 6,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: -0.2,
          marginBottom: Platform.OS === "web" ? 6 : 4,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={21}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "bag-handle" : "bag-handle-outline"}
              size={21}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add Item",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "add-circle" : "add-circle-outline"}
              size={23}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="banners"
        options={{
          title: "Banners",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "images" : "images-outline"}
              size={21}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Inventory",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "cube" : "cube-outline"}
              size={21}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="returns"
        options={{
          title: "Returns",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "return-down-back" : "return-down-back-outline"}
              size={21}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
