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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

const avatarImg = require("../../../assets/images/avatar_romina.jpg");

export default function ProfileScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    router.push("/(auth)/sign-in" as any);
  };

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
            <Image source={avatarImg} style={styles.avatar} />
            <View style={styles.onlineBadge} />
          </View>

          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>Romina Reynolds</Text>
              <View style={styles.memberBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#E05315" />
                <Text style={styles.memberBadgeText}>VIP</Text>
              </View>
            </View>
            <Text style={styles.userEmail}>romina.reynolds@example.com</Text>
            <Text style={styles.userPhone}>+1 (555) 234-8901</Text>
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

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#FFF5EF" }]}>
              <Ionicons name="bag-handle-outline" size={20} color="#E05315" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>My Orders</Text>
              <Text style={styles.menuSubtitle}>Track recent deliveries</Text>
            </View>
            <View style={styles.activeOrdersBadge}>
              <Text style={styles.activeOrdersText}>2 active</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C4C8D2" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#ECFDF5" }]}>
              <Ionicons name="location-outline" size={20} color="#10B981" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Delivery Addresses</Text>
              <Text style={styles.menuSubtitle}>742 Evergreen Terr, Apt 4B</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C4C8D2" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="card-outline" size={20} color="#3B82F6" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Payment Methods</Text>
              <Text style={styles.menuSubtitle}>Mastercard ending in 4242</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C4C8D2" />
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.menuGroup}>
          <Text style={styles.menuGroupTitle}>Preferences</Text>

          <View style={styles.menuItem}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="notifications-outline" size={20} color="#D97706" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Push Notifications</Text>
              <Text style={styles.menuSubtitle}>Delivery status & special offers</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#E2E8F0", true: "#FED7AA" }}
              thumbColor={notificationsEnabled ? "#E05315" : "#FFFFFF"}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#F3E8FF" }]}>
              <Ionicons name="moon-outline" size={20} color="#9333EA" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Dark Mode</Text>
              <Text style={styles.menuSubtitle}>Switch display theme</Text>
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
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E2E8F0",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
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
    fontSize: 16,
    fontWeight: "800",
    color: "#1A1D26",
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF2EC",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  memberBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#E05315",
    marginLeft: 2,
  },
  userEmail: {
    fontSize: 12,
    color: "#8B92A2",
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: "#8B92A2",
    marginTop: 1,
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
