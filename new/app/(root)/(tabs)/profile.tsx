import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";

const avatarImg = require("../../../assets/images/avatar_romina.jpg");

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to log out from FreshMart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  // -------------------------------------------------------------
  // GUEST STATE (User is not logged in)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Guest CTA Hero Card */}
          <View style={styles.guestHeroCard}>
            <View style={styles.guestIconCircle}>
              <Ionicons name="person" size={36} color="#E05315" />
            </View>

            <Text style={styles.guestTitle}>Welcome to FreshMart</Text>
            <Text style={styles.guestSubtitle}>
              Log in or create an account to view your grocery orders, saved items,
              and unlock member discounts.
            </Text>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => router.push("/(auth)/sign-in" as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.signInBtnText}>Sign In</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signUpBtn}
              onPress={() => router.push("/(auth)/sign-up" as any)}
              activeOpacity={0.75}
            >
              <Text style={styles.signUpBtnText}>Create an Account</Text>
            </TouchableOpacity>
          </View>

          {/* Benefits Preview */}
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Member Benefits</Text>

            <View style={styles.benefitRow}>
              <View style={[styles.benefitIconCircle, { backgroundColor: "#EBF8F2" }]}>
                <Ionicons name="bicycle" size={20} color="#10B981" />
              </View>
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitHeading}>Live Delivery Tracking</Text>
                <Text style={styles.benefitDesc}>Track your groceries from store to your doorstep</Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <View style={[styles.benefitIconCircle, { backgroundColor: "#FFF5EF" }]}>
                <Ionicons name="heart" size={20} color="#E05315" />
              </View>
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitHeading}>Saved Groceries & Wishlist</Text>
                <Text style={styles.benefitDesc}>Reorder your kitchen essentials in a single tap</Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <View style={[styles.benefitIconCircle, { backgroundColor: "#EEF4FF" }]}>
                <Ionicons name="pricetag" size={20} color="#3B82F6" />
              </View>
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitHeading}>Exclusive Member Discounts</Text>
                <Text style={styles.benefitDesc}>Enjoy coupons, vouchers, and daily deals</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED STATE (User is logged in)
  // -------------------------------------------------------------
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}>
          <Ionicons name="create-outline" size={18} color="#1A1D26" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.initialsAvatar}>
              <Text style={styles.initialsText}>{userInitial}</Text>
            </View>
            <View style={styles.onlineBadge} />
          </View>

          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.name || "FreshMart Member"}
              </Text>
              <View style={styles.memberBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#E05315" />
                <Text style={styles.memberBadgeText}>MEMBER</Text>
              </View>
            </View>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email || "user@example.com"}
            </Text>
            <Text style={styles.userPhone}>Verified Account</Text>
          </View>
        </View>

        {/* Quick Stats Banner */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>14</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Vouchers</Text>
          </View>
        </View>

        {/* Account Settings Menu */}
        <View style={styles.menuGroup}>
          <Text style={styles.menuGroupTitle}>Account Details</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(root)/orders" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: "#FFF5EF" }]}>
              <Ionicons name="bag-handle-outline" size={20} color="#E05315" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>My Orders</Text>
              <Text style={styles.menuSubtitle}>Track recent grocery orders</Text>
            </View>
            <View style={styles.activeOrdersBadge}>
              <Text style={styles.activeOrdersText}>Active</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C4C8D2" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#ECFDF5" }]}>
              <Ionicons name="location-outline" size={20} color="#10B981" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Delivery Address</Text>
              <Text style={styles.menuSubtitle}>Manage delivery locations</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C4C8D2" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="card-outline" size={20} color="#3B82F6" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Payment Methods</Text>
              <Text style={styles.menuSubtitle}>Cards, UPI & Wallets</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C4C8D2" />
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.menuGroup}>
          <Text style={styles.menuGroupTitle}>Preferences</Text>

          <View style={styles.menuItem}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#FFFBEB" }]}>
              <Ionicons name="notifications-outline" size={20} color="#F59E0B" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Order Notifications</Text>
              <Text style={styles.menuSubtitle}>Real-time delivery status alerts</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#E2E8F0", true: "#FDE68A" }}
              thumbColor={notificationsEnabled ? "#D97706" : "#FFFFFF"}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#FAF5FF" }]}>
              <Ionicons name="moon-outline" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Dark Mode</Text>
              <Text style={styles.menuSubtitle}>Toggle dark theme</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#E2E8F0", true: "#E9D5FF" }}
              thumbColor={darkMode ? "#9333EA" : "#FFFFFF"}
            />
          </View>
        </View>

        {/* Support & Logout */}
        <View style={styles.menuGroup}>
          <Text style={styles.menuGroupTitle}>More</Text>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#F1F5F9" }]}>
              <Ionicons name="help-buoy-outline" size={20} color="#64748B" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Help Center</Text>
              <Text style={styles.menuSubtitle}>FAQs & Customer Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C4C8D2" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: "#EF4444" }]}>
                Log Out
              </Text>
              <Text style={styles.menuSubtitle}>Sign out from your account</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1D26",
    letterSpacing: -0.3,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },

  // GUEST VIEW STYLES
  guestHeroCard: {
    backgroundColor: "#FFF9F5",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE7DC",
    marginBottom: 20,
  },
  guestIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#E05315",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1D26",
    marginBottom: 8,
    textAlign: "center",
  },
  guestSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  signInBtn: {
    backgroundColor: "#E05315",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 48,
    borderRadius: 24,
    marginBottom: 10,
    shadowColor: "#E05315",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  signInBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  signUpBtn: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  signUpBtnText: {
    color: "#1A1D26",
    fontSize: 14,
    fontWeight: "600",
  },

  benefitsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EEF0F4",
  },
  benefitsTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1D26",
    marginBottom: 14,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  benefitIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1D26",
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 11,
    color: "#8B92A2",
  },

  // AUTHENTICATED VIEW STYLES
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFBFD",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    marginBottom: 16,
  },
  avatarWrapper: {
    position: "relative",
  },
  initialsAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E05315",
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userInfo: {
    marginLeft: 14,
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1A1D26",
    flex: 1,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0E8",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  memberBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#E05315",
    marginLeft: 3,
  },
  userEmail: {
    fontSize: 12,
    color: "#8B92A2",
    marginTop: 2,
  },
  userPhone: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "600",
    marginTop: 2,
  },

  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FCE7DB",
    borderRadius: 20,
    paddingVertical: 14,
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1D26",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6D5A4E",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#F2D0C0",
  },

  menuGroup: {
    marginBottom: 20,
  },
  menuGroupTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8B92A2",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    marginBottom: 8,
  },
  logoutItem: {
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1D26",
  },
  menuSubtitle: {
    fontSize: 11,
    color: "#8B92A2",
    marginTop: 2,
  },
  activeOrdersBadge: {
    backgroundColor: "#EBF8F2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
  },
  activeOrdersText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10B981",
  },
});
