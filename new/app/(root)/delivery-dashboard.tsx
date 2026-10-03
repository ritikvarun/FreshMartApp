import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  StatusBar,
  Dimensions,
  Switch,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ENDPOINTS } from "../../config/api";

const DELIVERY_SESSION_KEY = "aka_delivery_session";

export default function DeliveryDashboardScreen() {
  const router = useRouter();

  // Auth State
  const [partner, setPartner] = useState<any | null>(null);
  const [partnerToken, setPartnerToken] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Login Form State
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Duty & Orders State
  const [isOnline, setIsOnline] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Payout Modal
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutUpi, setPayoutUpi] = useState("");

  useEffect(() => {
    checkSavedSession();
  }, []);

  const checkSavedSession = async () => {
    setLoading(true);
    try {
      const stored = await SecureStore.getItemAsync(DELIVERY_SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPartner(parsed.partner);
        setPartnerToken(parsed.token);
        setIsOnline(Boolean(parsed.partner?.isOnline));
        fetchOrders(parsed.partner._id, parsed.token);
      }
    } catch (e) {
      console.warn("Error reading delivery session", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert(
        "Missing Details",
        "Please enter your Phone number and Password.",
      );
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch(ENDPOINTS.DELIVERY.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), password }),
      });

      const data = await res.json();
      if (res.ok && data.partner) {
        setPartner(data.partner);
        setPartnerToken(data.token);
        setIsOnline(Boolean(data.partner?.isOnline));
        await SecureStore.setItemAsync(
          DELIVERY_SESSION_KEY,
          JSON.stringify(data),
        );
        fetchOrders(data.partner._id, data.token);
      } else {
        Alert.alert(
          "Login Notice",
          data.message || "Invalid phone or password.",
        );
      }
    } catch (e: any) {
      Alert.alert("Connection Error", e.message || "Could not reach server.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to log out from Delivery Partner mode?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await SecureStore.deleteItemAsync(DELIVERY_SESSION_KEY);
            setPartner(null);
            setPartnerToken("");
            setAvailableOrders([]);
            setActiveOrder(null);
          },
        },
      ],
    );
  };

  const fetchOrders = async (partnerId: string, token = partnerToken) => {
    setFetchingOrders(true);
    try {
      const res = await fetch(ENDPOINTS.DELIVERY.AVAILABLE_ORDERS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const orders = data.orders || [];

        // Check if there is an active order assigned to this partner
        const myActive = orders.find(
          (o: any) =>
            o.deliveryBoyId &&
            String(o.deliveryBoyId) === String(partnerId) &&
            o.deliveryStatus !== "Delivered",
        );

        if (myActive) {
          setActiveOrder(myActive);
        } else {
          setActiveOrder(null);
        }

        // Available orders (Unassigned)
        const unassigned = orders.filter(
          (o: any) => !o.deliveryBoyId || o.deliveryStatus === "Unassigned",
        );
        setAvailableOrders(unassigned);
      }
    } catch (e) {
      console.warn("fetchOrders error", e);
    } finally {
      setFetchingOrders(false);
    }
  };

  const handleToggleOnline = async (val: boolean) => {
    if (!partner) return;
    setIsOnline(val);
    try {
      await fetch(ENDPOINTS.DELIVERY.TOGGLE_ONLINE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${partnerToken}`,
        },
        body: JSON.stringify({ partnerId: partner._id, isOnline: val }),
      });
      if (val) {
        fetchOrders(partner._id, partnerToken);
      }
    } catch (e) {
      console.warn("Error toggling duty", e);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!partner) return;
    setActionLoading(true);
    try {
      const res = await fetch(ENDPOINTS.DELIVERY.ACCEPT_ORDER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${partnerToken}`,
        },
        body: JSON.stringify({ orderId, partnerId: partner._id }),
      });

      const data = await res.json();
      if (res.ok && data.order) {
        Alert.alert(
          "Order Accepted! 🛵",
          "Please proceed to the shop to pick up the materials.",
        );
        setActiveOrder(data.order);
        fetchOrders(partner._id, partnerToken);
      } else {
        Alert.alert("Notice", data.message || "Could not accept order.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to accept order.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (
    orderId: string,
    status: "PickedUp" | "Delivered",
  ) => {
    if (!partner) return;
    setActionLoading(true);
    try {
      const res = await fetch(ENDPOINTS.DELIVERY.UPDATE_STATUS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${partnerToken}`,
        },
        body: JSON.stringify({ orderId, partnerId: partner._id, status }),
      });

      const data = await res.json();
      if (res.ok) {
        if (status === "Delivered") {
          Alert.alert(
            "Delivery Completed! 🎉",
            "Great job! ₹50 delivery earning has been credited to your AkA Wallet.",
          );
          setActiveOrder(null);
          setPartner((prev: any) => ({
            ...prev,
            walletBalance: (prev?.walletBalance || 0) + 50,
            totalDeliveries: (prev?.totalDeliveries || 0) + 1,
          }));
        } else {
          Alert.alert(
            "Picked Up! 📦",
            "Deliver materials to customer's address.",
          );
          setActiveOrder((prev: any) => ({
            ...prev,
            deliveryStatus: "PickedUp",
          }));
        }
        fetchOrders(partner._id, partnerToken);
      } else {
        Alert.alert("Notice", data.message || "Could not update status.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const openMaps = (addressStr: string) => {
    const query = encodeURIComponent(addressStr);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const handleRequestPayout = () => {
    if (!payoutUpi.trim()) {
      Alert.alert(
        "Missing UPI",
        "Please enter your UPI ID (e.g. 9876543210@paytm).",
      );
      return;
    }
    Alert.alert(
      "Payout Request Submitted! 💰",
      `Your payout request of ₹${partner?.walletBalance || 0} has been sent to Admin for UPI: ${payoutUpi}. Payment will be disbursed today.`,
    );
    setShowPayoutModal(false);
    setPayoutUpi("");
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading Delivery Console...</Text>
      </View>
    );
  }

  // ── SCREEN 1: Login (If Not Logged In) ────────────────────────
  if (!partner) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery Partner Login</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.loginContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.loginBanner}>
            <View style={styles.loginBannerIcon}>
              <Ionicons name="bicycle" size={36} color="#2563EB" />
            </View>
            <Text style={styles.loginBannerTitle}>AkA Delivery Fleet</Text>
            <Text style={styles.loginBannerSub}>
              Accept nearby orders, deliver materials, and earn ₹50+ per
              delivery across any location.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>Mobile Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9876543210"
              keyboardType="phone-pad"
              placeholderTextColor="#94A3B8"
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleLogin}
              disabled={isLoggingIn}
              activeOpacity={0.8}
            >
              {isLoggingIn ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Start Delivery Duty</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.registerPromptRow}>
              <Text style={styles.registerPromptText}>
                Want to deliver for AkA?
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/register-delivery" as any)}
              >
                <Text style={styles.registerLink}>
                  Register Partner (₹500 Fee) →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── SCREEN 2: Logged-In Delivery Partner Dashboard ────────────
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {partner.name}
          </Text>
          <Text style={styles.headerSubtitle}>
            {partner.vehicleType || "Bike"} •{" "}
            {partner.vehicleNumber || "Verified Rider"}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Duty ON/OFF & Wallet Card */}
        <View style={styles.dutyCard}>
          <View style={styles.dutyRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dutyStatusLabel}>Duty Status</Text>
              <Text
                style={[
                  styles.dutyStatusValue,
                  { color: isOnline ? "#059669" : "#64748B" },
                ]}
              >
                {isOnline ? "🟢 ONLINE (Ready for Orders)" : "🔴 OFFLINE"}
              </Text>
              <Text style={styles.dutyHint}>
                {isOnline
                  ? "Searching nearby customer orders..."
                  : "Turn ON duty to receive delivery orders."}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
              thumbColor={isOnline ? "#2563EB" : "#94A3B8"}
            />
          </View>

          {/* Wallet Summary */}
          <View style={styles.walletBar}>
            <View>
              <Text style={styles.walletLabel}>My Delivery Wallet</Text>
              <Text style={styles.walletAmount}>
                ₹{partner.walletBalance || 0}
              </Text>
              <Text style={styles.walletDeliveries}>
                {partner.totalDeliveries || 0} deliveries completed
              </Text>
            </View>
            <TouchableOpacity
              style={styles.withdrawBtn}
              onPress={() => setShowPayoutModal(true)}
            >
              <Text style={styles.withdrawBtnText}>Withdraw UPI</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── SECTION: ACTIVE ORDER TRACKER (If accepted) ──────── */}
        {activeOrder && (
          <View style={styles.activeOrderCard}>
            <View style={styles.activeOrderHeader}>
              <View style={styles.activeOrderPill}>
                <Ionicons name="flash" size={14} color="#EA580C" />
                <Text style={styles.activeOrderPillText}>
                  ACTIVE DELIVERY TASK
                </Text>
              </View>
              <Text style={styles.activeOrderId}>
                #{activeOrder._id.slice(-6).toUpperCase()}
              </Text>
            </View>

            {/* Shop Pickup Point */}
            <View style={styles.taskStep}>
              <View style={styles.stepDotGreen} />
              <View style={{ flex: 1 }}>
                <Text style={styles.stepLabel}>PICKUP FROM SHOP</Text>
                <Text style={styles.stepName}>
                  {activeOrder.shopName || "AkA Partner Store"}
                </Text>
                <Text style={styles.stepAddress}>
                  {activeOrder.shopAddress || "Local merchant hub"}
                </Text>
                {activeOrder.shopPhone && (
                  <TouchableOpacity
                    style={styles.callSmallBtn}
                    onPress={() =>
                      Linking.openURL(`tel:${activeOrder.shopPhone}`)
                    }
                  >
                    <Ionicons name="call" size={12} color="#059669" />
                    <Text style={styles.callSmallBtnText}>
                      Call Shop: {activeOrder.shopPhone}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Customer Drop Point */}
            <View style={[styles.taskStep, { marginTop: 12 }]}>
              <View style={styles.stepDotBlue} />
              <View style={{ flex: 1 }}>
                <Text style={styles.stepLabel}>DELIVER TO CUSTOMER</Text>
                <Text style={styles.stepName}>
                  {activeOrder.address?.firstName}{" "}
                  {activeOrder.address?.lastName}
                </Text>
                <Text style={styles.stepAddress}>
                  {activeOrder.address?.street}, {activeOrder.address?.city} (
                  {activeOrder.address?.pinCode})
                </Text>
                {activeOrder.address?.phone && (
                  <TouchableOpacity
                    style={styles.callSmallBtn}
                    onPress={() =>
                      Linking.openURL(`tel:${activeOrder.address?.phone}`)
                    }
                  >
                    <Ionicons name="call" size={12} color="#2563EB" />
                    <Text
                      style={[styles.callSmallBtnText, { color: "#2563EB" }]}
                    >
                      Call Customer: {activeOrder.address?.phone}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Action Buttons: Picked Up / Delivered */}
            <View style={styles.actionBtnRow}>
              <TouchableOpacity
                style={styles.mapBtn}
                onPress={() =>
                  openMaps(
                    activeOrder.deliveryStatus === "PickedUp"
                      ? `${activeOrder.address?.street}, ${activeOrder.address?.city}`
                      : activeOrder.shopName,
                  )
                }
              >
                <Ionicons name="navigate" size={16} color="#0F172A" />
                <Text style={styles.mapBtnText}>Navigation Map</Text>
              </TouchableOpacity>

              {activeOrder.deliveryStatus !== "PickedUp" ? (
                <TouchableOpacity
                  style={[
                    styles.primaryActionBtn,
                    { backgroundColor: "#F59E0B" },
                  ]}
                  disabled={actionLoading}
                  onPress={() =>
                    handleUpdateStatus(activeOrder._id, "PickedUp")
                  }
                >
                  <Text style={styles.primaryActionBtnText}>
                    Mark Picked Up
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.primaryActionBtn,
                    { backgroundColor: "#059669" },
                  ]}
                  disabled={actionLoading}
                  onPress={() =>
                    handleUpdateStatus(activeOrder._id, "Delivered")
                  }
                >
                  <Text style={styles.primaryActionBtnText}>
                    Mark Delivered
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* ── SECTION: AVAILABLE ORDERS LIST ──────────────────── */}
        <View style={styles.availableSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>
              Available Orders Nearby
            </Text>
            <TouchableOpacity
              onPress={() => partner && fetchOrders(partner._id)}
            >
              <Ionicons name="refresh" size={18} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {!isOnline ? (
            <View style={styles.emptyCard}>
              <Ionicons name="moon-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyTitle}>You Are Currently Offline</Text>
              <Text style={styles.emptySub}>
                Switch on your Duty Status above to start seeing available
                deliveries in your area.
              </Text>
            </View>
          ) : fetchingOrders ? (
            <ActivityIndicator
              style={{ marginTop: 20 }}
              size="small"
              color="#2563EB"
            />
          ) : availableOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={40}
                color="#059669"
              />
              <Text style={styles.emptyTitle}>No Pending Deliveries</Text>
              <Text style={styles.emptySub}>
                All nearby orders are currently assigned. Stay online, new
                orders appear automatically!
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {availableOrders.map((ord) => (
                <View key={ord._id} style={styles.orderCard}>
                  <View style={styles.orderCardTop}>
                    <View>
                      <Text style={styles.orderShopName}>
                        {ord.shopName || "AkA Partner Store"}
                      </Text>
                      <Text
                        style={styles.orderCustomerAddress}
                        numberOfLines={1}
                      >
                        Deliver to: {ord.address?.street || "Customer address"}
                      </Text>
                    </View>
                    <View style={styles.earningBadge}>
                      <Text style={styles.earningBadgeText}>+₹50 Earning</Text>
                    </View>
                  </View>

                  <View style={styles.orderCardBottom}>
                    <Text style={styles.orderItemsCount}>
                      {ord.items?.length || 1} Material(s) • Total: ₹
                      {ord.amount} ({ord.paymentMethod})
                    </Text>

                    <TouchableOpacity
                      style={styles.acceptBtn}
                      disabled={actionLoading}
                      onPress={() => handleAcceptOrder(ord._id)}
                    >
                      <Text style={styles.acceptBtnText}>Accept Order</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── MODAL: Request Payout ────────────────────────────── */}
      <Modal visible={showPayoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Delivery Payout</Text>
              <TouchableOpacity onPress={() => setShowPayoutModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Available Balance</Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "900",
                color: "#2563EB",
                marginBottom: 12,
              }}
            >
              ₹{partner.walletBalance || 0}
            </Text>

            <Text style={styles.inputLabel}>
              Enter UPI ID (GPay / PhonePe / Paytm) *
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9876543210@paytm or rider@okicici"
              placeholderTextColor="#94A3B8"
              value={payoutUpi}
              onChangeText={setPayoutUpi}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: "#2563EB", marginTop: 18 },
              ]}
              onPress={handleRequestPayout}
            >
              <Text style={styles.submitBtnText}>Submit Payout Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "700",
  },
  logoutBtn: {
    padding: 6,
  },
  loginContent: {
    padding: 20,
  },
  loginBanner: {
    alignItems: "center",
    marginVertical: 20,
  },
  loginBannerIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  loginBannerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },
  loginBannerSub: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    color: "#0F172A",
  },
  submitBtn: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 14,
    marginTop: 20,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  registerPromptRow: {
    alignItems: "center",
    marginTop: 18,
    gap: 4,
  },
  registerPromptText: {
    fontSize: 13,
    color: "#64748B",
  },
  registerLink: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2563EB",
  },
  dashboardContent: {
    padding: 16,
    paddingBottom: 40,
  },
  dutyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  dutyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 14,
  },
  dutyStatusLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
  },
  dutyStatusValue: {
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
  },
  dutyHint: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
  },
  walletBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 14,
  },
  walletLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  walletAmount: {
    fontSize: 20,
    fontWeight: "900",
    color: "#059669",
    marginTop: 2,
  },
  walletDeliveries: {
    fontSize: 11,
    color: "#94A3B8",
  },
  withdrawBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  withdrawBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  activeOrderCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#FDBA74",
    marginTop: 16,
  },
  activeOrderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#FED7AA",
    paddingBottom: 10,
    marginBottom: 12,
  },
  activeOrderPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFEDD5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeOrderPillText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#EA580C",
  },
  activeOrderId: {
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "800",
    color: "#9A3412",
  },
  taskStep: {
    flexDirection: "row",
    gap: 10,
  },
  stepDotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#16A34A",
    marginTop: 4,
  },
  stepDotBlue: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
    marginTop: 4,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#9A3412",
    letterSpacing: 0.5,
  },
  stepName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 1,
  },
  stepAddress: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },
  callSmallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  callSmallBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  actionBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#FED7AA",
  },
  mapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  mapBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },
  primaryActionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 10,
  },
  primaryActionBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  availableSection: {
    marginTop: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  orderCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderShopName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  orderCustomerAddress: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    maxWidth: 150,
  },
  earningBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  earningBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#059669",
  },
  orderCardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  orderItemsCount: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  acceptBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  acceptBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
});
