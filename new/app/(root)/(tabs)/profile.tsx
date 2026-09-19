import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../../../context/AuthContext";
import { ENDPOINTS } from "../../../config/api";

const ADDRESS_STORAGE_KEY = "freshmart_delivery_address";
const PAYMENT_PREF_KEY = "freshmart_payment_preference";
const SAVED_STORAGE_KEY = "freshmart_saved_items";

interface DeliveryAddress {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, token, isAuthenticated, logout, updateUser } = useAuth();

  // Preferences (Dark mode intentionally removed)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Dynamic user stats
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState<number>(0);
  const [savedCount, setSavedCount] = useState<number>(4);

  // Stored preferences & address
  const [savedAddress, setSavedAddress] = useState<DeliveryAddress | null>(null);
  const [paymentPreference, setPaymentPreference] = useState<string>("Razorpay");

  // Modals
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Delivery Address Form State
  const [addrFirstName, setAddrFirstName] = useState("");
  const [addrLastName, setAddrLastName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPinCode, setAddrPinCode] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Synchronize dynamic stats & stored data whenever tab is focused
  useFocusEffect(
    useCallback(() => {
      fetchUserOrders();
      loadSavedItemsCount();
      loadStoredPreferences();
    }, [token, isAuthenticated])
  );

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
    }
  }, [user]);

  // ── Fetch Orders from Backend ──────────────────────────────
  const fetchUserOrders = async () => {
    if (!isAuthenticated || !token) {
      setOrdersCount(0);
      setActiveOrdersCount(0);
      return;
    }

    try {
      const res = await fetch(ENDPOINTS.ORDER.USER_ORDERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrdersCount(data.length);
          const active = data.filter(
            (o) =>
              o.status &&
              o.status.toLowerCase() !== "delivered" &&
              o.status.toLowerCase() !== "cancelled"
          );
          setActiveOrdersCount(active.length);
        }
      }
    } catch (err) {
      console.warn("Error fetching user orders for profile stats:", err);
    }
  };

  // ── Load Saved/Wishlist Items Count ────────────────────────
  const loadSavedItemsCount = async () => {
    try {
      let stored: string | null = null;
      if (Platform.OS === "web") {
        stored = localStorage.getItem(SAVED_STORAGE_KEY);
      } else {
        stored = await SecureStore.getItemAsync(SAVED_STORAGE_KEY);
      }
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedCount(parsed.length);
          return;
        }
      }
      setSavedCount(4); // Default sample count
    } catch {
      setSavedCount(4);
    }
  };

  // ── Load Saved Address & Payment Preference ────────────────
  const loadStoredPreferences = async () => {
    try {
      let addrStr: string | null = null;
      let payPref: string | null = null;
      if (Platform.OS === "web") {
        addrStr = localStorage.getItem(ADDRESS_STORAGE_KEY);
        payPref = localStorage.getItem(PAYMENT_PREF_KEY);
      } else {
        addrStr = await SecureStore.getItemAsync(ADDRESS_STORAGE_KEY);
        payPref = await SecureStore.getItemAsync(PAYMENT_PREF_KEY);
      }

      if (addrStr) {
        const addr: DeliveryAddress = JSON.parse(addrStr);
        setSavedAddress(addr);
        setAddrFirstName(addr.firstName || "");
        setAddrLastName(addr.lastName || "");
        setAddrPhone(addr.phone || "");
        setAddrStreet(addr.street || "");
        setAddrCity(addr.city || "");
        setAddrState(addr.state || "");
        setAddrPinCode(addr.pinCode || "");
      } else if (user) {
        setAddrFirstName(user.name.split(" ")[0] || "");
        setAddrLastName(user.name.split(" ")[1] || "");
        setAddrPhone(user.phone || "");
      }

      if (payPref) {
        setPaymentPreference(payPref);
      }
    } catch (e) {
      console.warn("Failed to load address or payment preferences:", e);
    }
  };

  // ── Save Delivery Address ──────────────────────────────────
  const handleSaveAddress = async () => {
    if (!addrStreet.trim() || !addrCity.trim() || !addrPinCode.trim() || !addrPhone.trim()) {
      Alert.alert("Missing Details", "Please fill in Phone, Street, City, and Pin Code.");
      return;
    }

    setIsSavingAddress(true);
    const newAddress: DeliveryAddress = {
      firstName: addrFirstName.trim() || (user?.name?.split(" ")[0] || "User"),
      lastName: addrLastName.trim() || (user?.name?.split(" ")[1] || ""),
      phone: addrPhone.trim(),
      email: user?.email,
      street: addrStreet.trim(),
      city: addrCity.trim(),
      state: addrState.trim() || "Local",
      pinCode: addrPinCode.trim(),
    };

    try {
      const serialized = JSON.stringify(newAddress);
      if (Platform.OS === "web") {
        localStorage.setItem(ADDRESS_STORAGE_KEY, serialized);
      } else {
        await SecureStore.setItemAsync(ADDRESS_STORAGE_KEY, serialized);
      }
      setSavedAddress(newAddress);
      setShowAddressModal(false);
      Alert.alert("Address Saved", "Your default delivery address has been updated.");
    } catch (e) {
      Alert.alert("Error", "Could not save address. Please try again.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  // ── Save Payment Preference ────────────────────────────────
  const handleSelectPaymentPreference = async (pref: string) => {
    setPaymentPreference(pref);
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(PAYMENT_PREF_KEY, pref);
      } else {
        await SecureStore.setItemAsync(PAYMENT_PREF_KEY, pref);
      }
    } catch (e) {
      console.warn("Could not save payment preference:", e);
    }
  };

  // ── Save Profile Details ───────────────────────────────────
  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Invalid Name", "Please enter your name.");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await updateUser({
        name: editName.trim(),
        phone: editPhone.trim(),
      });
      setShowEditProfileModal(false);
      Alert.alert("Profile Updated", "Your profile details have been saved.");
    } catch {
      Alert.alert("Error", "Could not update profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // ── Logout ─────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to log out from your account?",
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

  // -----------------------------------------------------------
  // GUEST STATE
  // -----------------------------------------------------------
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
              <Ionicons name="person-outline" size={32} color="#111827" />
            </View>

            <Text style={styles.guestTitle}>Welcome to FreshMart</Text>
            <Text style={styles.guestSubtitle}>
              Log in or create an account to view your orders, saved items, and unlock member discounts.
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
              activeOpacity={0.8}
            >
              <Text style={styles.signUpBtnText}>Create an Account</Text>
            </TouchableOpacity>
          </View>

          {/* Member Benefits Preview */}
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Member Benefits</Text>

            <View style={styles.benefitRow}>
              <View style={[styles.benefitIconCircle, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="rocket-outline" size={20} color="#111827" />
              </View>
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitHeading}>Fast Nationwide Delivery</Text>
                <Text style={styles.benefitDesc}>Express shipping straight to your doorstep</Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <View style={[styles.benefitIconCircle, { backgroundColor: "#FEE2E2" }]}>
                <Ionicons name="heart-outline" size={20} color="#EF4444" />
              </View>
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitHeading}>Saved Items & Wishlist</Text>
                <Text style={styles.benefitDesc}>Save your favorite styles in a single tap</Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <View style={[styles.benefitIconCircle, { backgroundColor: "#DBEAFE" }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#2563EB" />
              </View>
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitHeading}>Razorpay Secured Checkout</Text>
                <Text style={styles.benefitDesc}>Instant UPI, Cards & NetBanking with 256-bit encryption</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -----------------------------------------------------------
  // AUTHENTICATED STATE
  // -----------------------------------------------------------
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your account & preferences</Text>
        </View>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setShowEditProfileModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={19} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Hero Card (Modern Obsidian Luxury) */}
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
                {user?.name || "Customer Member"}
              </Text>
              <View style={styles.memberBadge}>
                <Ionicons name="shield-checkmark" size={11} color="#F59E0B" />
                <Text style={styles.memberBadgeText}>VIP MEMBER</Text>
              </View>
            </View>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email || "user@example.com"}
            </Text>
            <View style={styles.phoneStatusRow}>
              <Ionicons name="checkmark-circle" size={13} color="#10B981" />
              <Text style={styles.userPhone}>
                {user?.phone ? `${user.phone} • Verified` : "Verified Account"}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats (3 Modern Elevated Micro-Cards) */}
        <View style={styles.statsRow}>
          {/* Orders Card */}
          <TouchableOpacity
            style={[styles.statMicroCard, { borderColor: "#E0E7FF" }]}
            onPress={() => router.push("/(root)/orders" as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconBadge, { backgroundColor: "#EEF2FF" }]}>
              <Ionicons name="bag-handle" size={15} color="#4F46E5" />
            </View>
            <Text style={[styles.statNumber, { color: "#4F46E5" }]}>{ordersCount}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </TouchableOpacity>

          {/* Saved Card */}
          <TouchableOpacity
            style={[styles.statMicroCard, { borderColor: "#FFE4E6" }]}
            onPress={() => router.push("/(root)/(tabs)/saved" as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconBadge, { backgroundColor: "#FFF1F2" }]}>
              <Ionicons name="heart" size={15} color="#E11D48" />
            </View>
            <Text style={[styles.statNumber, { color: "#E11D48" }]}>{savedCount}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </TouchableOpacity>
        </View>

        {/* Account Details Menu */}
        <View style={styles.menuGroup}>
          <Text style={styles.menuGroupTitle}>Account Details</Text>

          {/* My Orders */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(root)/orders" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: "#EEF2FF" }]}>
              <Ionicons name="bag-handle-outline" size={20} color="#4F46E5" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>My Orders</Text>
              <Text style={styles.menuSubtitle}>Track recent orders & shipments</Text>
            </View>
            {activeOrdersCount > 0 ? (
              <View style={styles.activeOrdersBadge}>
                <Text style={styles.activeOrdersText}>
                  {activeOrdersCount} Active
                </Text>
              </View>
            ) : null}
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Delivery Address */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowAddressModal(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: "#ECFDF5" }]}>
              <Ionicons name="location-outline" size={20} color="#059669" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Delivery Address</Text>
              <Text style={styles.menuSubtitle} numberOfLines={1}>
                {savedAddress
                  ? `${savedAddress.street}, ${savedAddress.city}`
                  : "Manage delivery locations"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Payment Methods (With Razorpay Focus) */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowPaymentModal(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: "#F0F9FF" }]}>
              <Ionicons name="card-outline" size={20} color="#0284C7" />
            </View>
            <View style={styles.menuContent}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.menuTitle}>Payment Methods</Text>
                <View style={styles.rzpBadgePill}>
                  <Text style={styles.rzpBadgeText}>Razorpay</Text>
                </View>
              </View>
              <Text style={styles.menuSubtitle}>
                {paymentPreference === "Razorpay"
                  ? "Razorpay (UPI, Cards) • Active"
                  : "Cash on Delivery (COD) • Active"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Preferences (Dark Mode Removed) */}
        <View style={styles.menuGroup}>
          <Text style={styles.menuGroupTitle}>Preferences</Text>

          <View style={styles.menuItem}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#FFFBEB" }]}>
              <Ionicons name="notifications-outline" size={20} color="#D97706" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Order Notifications</Text>
              <Text style={styles.menuSubtitle}>Real-time delivery status alerts</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#E2E8F0", true: "#0F172A" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Support & Logout */}
        <View style={styles.menuGroup}>
          <Text style={styles.menuGroupTitle}>More</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowHelpModal(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: "#F8FAFC" }]}>
              <Ionicons name="help-buoy-outline" size={20} color="#475569" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Help Center</Text>
              <Text style={styles.menuSubtitle}>FAQs & Customer Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
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
              <Text style={[styles.menuTitle, { color: "#EF4444" }]}>Log Out</Text>
              <Text style={styles.menuSubtitle}>Sign out from your account</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── EDIT PROFILE MODAL ───────────────────────────────── */}
      <Modal
        visible={showEditProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => setShowEditProfileModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#111827" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Your Name"
              value={editName}
              onChangeText={setEditName}
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.inputField}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              value={editPhone}
              onChangeText={setEditPhone}
            />

            <Text style={styles.inputLabel}>Email (Read-only)</Text>
            <TextInput
              style={[styles.inputField, styles.disabledInput]}
              value={user?.email || ""}
              editable={false}
            />

            <TouchableOpacity
              style={[styles.modalActionBtn, isUpdatingProfile && { opacity: 0.7 }]}
              onPress={handleSaveProfile}
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.modalActionBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── DELIVERY ADDRESS MODAL ───────────────────────────── */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddressModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Delivery Address</Text>
                <Text style={styles.modalSubtitle}>Used to prefill your orders at checkout</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAddressModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              <View style={styles.inputRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="First"
                    value={addrFirstName}
                    onChangeText={setAddrFirstName}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Last"
                    value={addrLastName}
                    onChangeText={setAddrLastName}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Contact Phone *</Text>
              <TextInput
                style={styles.inputField}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
                value={addrPhone}
                onChangeText={setAddrPhone}
              />

              <Text style={styles.inputLabel}>Street / House / Apartment *</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Flat 4B, Green Avenue"
                value={addrStreet}
                onChangeText={setAddrStreet}
              />

              <View style={styles.inputRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>City *</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="City"
                    value={addrCity}
                    onChangeText={setAddrCity}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Postal / Pin Code *</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Pin Code"
                    keyboardType="numeric"
                    value={addrPinCode}
                    onChangeText={setAddrPinCode}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>State</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Delhi / Maharashtra"
                value={addrState}
                onChangeText={setAddrState}
              />
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalActionBtn, isSavingAddress && { opacity: 0.7 }]}
              onPress={handleSaveAddress}
              disabled={isSavingAddress}
            >
              {isSavingAddress ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.modalActionBtnText}>Save Address</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── PAYMENT METHODS MODAL (RAZORPAY & COD) ───────────── */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Payment Methods</Text>
                <Text style={styles.modalSubtitle}>Manage default payment gateway</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowPaymentModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Razorpay Gateway Option */}
            <TouchableOpacity
              style={[
                styles.payOptionCard,
                paymentPreference === "Razorpay" && styles.payOptionCardSelected,
              ]}
              onPress={() => handleSelectPaymentPreference("Razorpay")}
              activeOpacity={0.85}
            >
              <View style={styles.payCardHeader}>
                <View style={styles.payRadio}>
                  {paymentPreference === "Razorpay" && <View style={styles.payRadioDot} />}
                </View>
                <View style={[styles.payIconCircle, { backgroundColor: "#EFF6FF" }]}>
                  <Ionicons name="shield-checkmark" size={20} color="#2563EB" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.payTitle}>Razorpay Online</Text>
                    <View style={styles.verifiedGatewayBadge}>
                      <Text style={styles.verifiedGatewayText}>Active Gateway</Text>
                    </View>
                  </View>
                  <Text style={styles.paySub}>256-bit SSL Encrypted • Instant</Text>
                </View>
              </View>

              {/* Supported sub-methods */}
              <View style={styles.subMethodsRow}>
                <View style={styles.methodTag}>
                  <Ionicons name="flash" size={11} color="#D97706" />
                  <Text style={styles.methodTagText}>UPI (GPay/PhonePe)</Text>
                </View>
                <View style={styles.methodTag}>
                  <Ionicons name="card" size={11} color="#2563EB" />
                  <Text style={styles.methodTagText}>Cards</Text>
                </View>
                <View style={styles.methodTag}>
                  <Ionicons name="business" size={11} color="#059669" />
                  <Text style={styles.methodTagText}>NetBanking</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Cash on Delivery Option */}
            <TouchableOpacity
              style={[
                styles.payOptionCard,
                paymentPreference === "COD" && styles.payOptionCardSelected,
                { marginTop: 12 },
              ]}
              onPress={() => handleSelectPaymentPreference("COD")}
              activeOpacity={0.85}
            >
              <View style={styles.payCardHeader}>
                <View style={styles.payRadio}>
                  {paymentPreference === "COD" && <View style={styles.payRadioDot} />}
                </View>
                <View style={[styles.payIconCircle, { backgroundColor: "#ECFDF5" }]}>
                  <Ionicons name="cash" size={20} color="#059669" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.payTitle}>Cash on Delivery (COD)</Text>
                  <Text style={styles.paySub}>Pay with cash or UPI at your doorstep</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalActionBtn, { marginTop: 24 }]}
              onPress={() => setShowPaymentModal(false)}
            >
              <Text style={styles.modalActionBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── HELP CENTER MODAL ────────────────────────────────── */}
      <Modal
        visible={showHelpModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Help & Support</Text>
                <Text style={styles.modalSubtitle}>We are available 24/7 to assist you</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowHelpModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.supportOptionsRow}>
              <TouchableOpacity
                style={styles.supportBox}
                onPress={() => Alert.alert("Helpline", "Toll-Free Customer Care: 1800-123-4567")}
              >
                <Ionicons name="call-outline" size={24} color="#111827" />
                <Text style={styles.supportBoxTitle}>Call Us</Text>
                <Text style={styles.supportBoxSub}>1800-123-4567</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.supportBox}
                onPress={() => Alert.alert("Email Support", "Email us at: support@freshmart.com")}
              >
                <Ionicons name="mail-outline" size={24} color="#111827" />
                <Text style={styles.supportBoxTitle}>Email</Text>
                <Text style={styles.supportBoxSub}>support@freshmart</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.faqSectionTitle}>Frequently Asked Questions</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 220 }}>
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>• How do I track my order?</Text>
                <Text style={styles.faqAnswer}>
                  Go to "My Orders" tab from your profile to track live shipment status.
                </Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>• Is Razorpay payment secure?</Text>
                <Text style={styles.faqAnswer}>
                  Yes, Razorpay is RBI compliant and protected with industry-standard 256-bit encryption.
                </Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>• What is the return policy?</Text>
                <Text style={styles.faqAnswer}>
                  You can request an instant return or exchange within 7 days of delivery.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalActionBtn, { marginTop: 16 }]}
              onPress={() => setShowHelpModal(false)}
            >
              <Text style={styles.modalActionBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },

  // GUEST VIEW STYLES
  guestHeroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  guestIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.4,
  },
  guestSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  signInBtn: {
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 52,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
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
    height: 52,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
  },
  signUpBtnText: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
  },

  benefitsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  benefitIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },

  // AUTHENTICATED VIEW STYLES
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  avatarWrapper: {
    position: "relative",
  },
  initialsAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#1E293B",
    borderWidth: 2,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#0F172A",
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
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    flex: 1,
    letterSpacing: -0.3,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 6,
  },
  memberBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#F59E0B",
    marginLeft: 3,
  },
  userEmail: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  phoneStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  userPhone: {
    fontSize: 11,
    color: "#34D399",
    fontWeight: "600",
    marginLeft: 4,
  },

  // STATS MICRO CARDS
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 10,
  },
  statMicroCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1.2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },

  menuGroup: {
    marginBottom: 22,
  },
  menuGroupTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  logoutItem: {
    borderColor: "#FECACA",
    backgroundColor: "#FFF5F5",
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  activeOrdersBadge: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
  },
  activeOrdersText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  rzpBadgePill: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  rzpBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0284C7",
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
    marginTop: 8,
  },
  inputField: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
    color: "#0F172A",
  },
  disabledInput: {
    backgroundColor: "#F1F5F9",
    color: "#94A3B8",
  },
  inputRow: {
    flexDirection: "row",
  },
  modalActionBtn: {
    backgroundColor: "#0F172A",
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  modalActionBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // PAYMENT MODAL STYLES
  payOptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  payOptionCardSelected: {
    borderColor: "#0284C7",
    backgroundColor: "#F0F9FF",
  },
  payCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  payRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#0284C7",
    alignItems: "center",
    justifyContent: "center",
  },
  payRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0284C7",
  },
  payIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  payTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  paySub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  verifiedGatewayBadge: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  verifiedGatewayText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#0284C7",
  },
  subMethodsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  methodTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  methodTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
    marginLeft: 5,
  },

  // HELP MODAL STYLES
  supportOptionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  supportBox: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
  },
  supportBoxTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 6,
  },
  supportBoxSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  faqSectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  faqItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 3,
  },
  faqAnswer: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
  },
});
