import React from "react";
import { Tabs, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../../../context/CartContext";

// Custom floating pill bottom navigation bar matching the design
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cartCount } = useCart();

  return (
    <View
      style={[
        styles.tabBarContainer,
        { bottom: Platform.OS === "ios" ? Math.max(insets.bottom, 20) : 24 },
      ]}
    >
      <View style={styles.tabBarPill}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Icon mapping
          let iconName: any = "home";
          let label = "Home";

          if (route.name === "index") {
            iconName = "home";
            label = "Home";
          } else if (route.name === "saved") {
            iconName = isFocused ? "heart" : "heart-outline";
            label = "Saved";
          } else if (route.name === "search") {
            iconName = isFocused ? "search" : "search-outline";
            label = "Search";
          } else if (route.name === "profile") {
            iconName = isFocused ? "person" : "person-outline";
            label = "Profile";
          }

          // If this is the profile route, insert Cart button right before it
          const isBeforeProfile = route.name === "profile";

          return (
            <React.Fragment key={route.key}>
              {isBeforeProfile && (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => router.push("/(root)/cart" as any)}
                  activeOpacity={0.8}
                  style={styles.tabItem}
                >
                  <View style={{ position: "relative" }}>
                    <Ionicons name="cart-outline" size={22} color="#8E94A4" />
                    {cartCount > 0 && (
                      <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{cartCount}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                activeOpacity={0.8}
                style={[
                  styles.tabItem,
                  isFocused && styles.tabItemActive,
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={isFocused ? 18 : 22}
                  color={isFocused ? "#FFFFFF" : "#8E94A4"}
                />
                {isFocused && (
                  <Text style={styles.tabItemText}>{label}</Text>
                )}
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    alignItems: "center",
  },
  tabBarPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: "100%",
    // Soft floating shadow
    shadowColor: "#1A1A2E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F0F1F5",
  },
  tabItem: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
  },
  tabItemActive: {
    backgroundColor: "#0F172A",
    flex: 1.4,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  tabItemText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -10,
    backgroundColor: "#DC2626",
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
});
