import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ENDPOINTS } from "../../config/api";

export default function AdminDashboard() {
  const router = useRouter();
  const { adminToken, logout } = useAdminAuth();
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch products count
      const prodRes = await fetch(ENDPOINTS.PRODUCTS.LIST);
      if (prodRes.ok) {
        const prods = await prodRes.json();
        if (Array.isArray(prods)) setTotalProducts(prods.length);
      }

      // 2. Fetch orders list
      if (adminToken) {
        const orderRes = await fetch(ENDPOINTS.ORDERS.LIST, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        });

        if (orderRes.ok) {
          const orders = await orderRes.json();
          if (Array.isArray(orders)) {
            setTotalOrders(orders.length);
            const revenue = orders.reduce((sum, ord) => sum + (ord.amount || 0), 0);
            setTotalRevenue(revenue);
            const sorted = [...orders].reverse().slice(0, 5);
            setRecentOrders(sorted);
          }
        }
      }
    } catch (err) {
      console.warn("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [adminToken]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = () => {
    Alert.alert("Admin Logout", "Are you sure you want to sign out of the Admin panel?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.badgeRow}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>STORE MANAGER ACTIVE</Text>
          </View>
          <Text style={styles.headerTitle}>FreshMart Admin</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.loaderText}>Loading Store Metrics...</Text>
          </View>
        ) : (
          <>
            {/* Hero Revenue Card */}
            <View style={styles.revenueCard}>
              <View style={styles.revenueCardHeader}>
                <View style={styles.revenueIconWrapper}>
                  <Ionicons name="wallet-outline" size={22} color="#FFFFFF" />
                </View>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE METRICS</Text>
                </View>
              </View>
              <Text style={styles.revenueLabel}>TOTAL STORE REVENUE</Text>
              <Text style={styles.revenueValue}>₹{totalRevenue.toFixed(2)}</Text>
              <Text style={styles.revenueSub}>Real-time accumulated customer payments</Text>
            </View>

            {/* Stat Cards Row */}
            <View style={styles.statsGrid}>
              {/* Card 1: Total Orders */}
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => router.push("/(tabs)/orders" as any)}
                activeOpacity={0.8}
              >
                <View style={styles.statIconWrapper}>
                  <Ionicons name="bag-handle" size={22} color="#000000" />
                </View>
                <Text style={styles.statLabel}>Total Orders</Text>
                <Text style={styles.statValue}>{totalOrders}</Text>
              </TouchableOpacity>

              {/* Card 2: Inventory Items */}
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => router.push("/(tabs)/products" as any)}
                activeOpacity={0.8}
              >
                <View style={styles.statIconWrapper}>
                  <Ionicons name="cube" size={22} color="#000000" />
                </View>
                <Text style={styles.statLabel}>Total Products</Text>
                <Text style={styles.statValue}>{totalProducts}</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Actions Bar */}
            <View style={styles.actionsCard}>
              <Text style={styles.sectionTitle}>Store Operations</Text>
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={styles.actionBtnPrimary}
                  onPress={() => router.push("/(tabs)/add" as any)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add-circle" size={19} color="#FFFFFF" />
                  <Text style={styles.actionBtnPrimaryText}>Add Product</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  onPress={() => router.push("/(tabs)/orders" as any)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="list" size={19} color="#000000" />
                  <Text style={styles.actionBtnSecondaryText}>All Orders</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recent Orders List */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Recent Customer Orders</Text>
                <TouchableOpacity
                  style={styles.seeAllBtn}
                  onPress={() => router.push("/(tabs)/orders" as any)}
                >
                  <Text style={styles.seeAllText}>View All</Text>
                  <Ionicons name="arrow-forward" size={13} color="#000000" />
                </TouchableOpacity>
              </View>

              {recentOrders.length === 0 ? (
                <Text style={styles.emptyText}>No orders received yet.</Text>
              ) : (
                recentOrders.map((ord) => (
                  <View key={ord._id} style={styles.recentOrderRow}>
                    <View style={styles.orderLeft}>
                      <Text style={styles.orderCustomer}>
                        {ord.address?.firstName
                          ? `${ord.address.firstName} ${ord.address.lastName || ""}`
                          : "Customer"}
                      </Text>
                      <Text style={styles.orderMeta}>
                        {ord.items?.length || 0} items • {ord.paymentMethod || "COD"}
                      </Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.orderAmount}>₹{(ord.amount || 0).toFixed(2)}</Text>
                      <View style={styles.statusPill}>
                        <Text style={styles.statusPillText}>{ord.status || "Order Placed"}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#000000",
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: -0.5,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
  },
  loaderContainer: {
    paddingTop: 60,
    alignItems: "center",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  revenueCard: {
    backgroundColor: "#000000",
    borderRadius: 22,
    padding: 22,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  revenueCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  revenueIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#22C55E",
  },
  liveText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  revenueLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  revenueSub: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000000",
  },
  actionsCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: "#000000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    borderRadius: 14,
    gap: 6,
  },
  actionBtnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#000000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    borderRadius: 14,
    gap: 6,
  },
  actionBtnSecondaryText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000000",
  },
  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    paddingVertical: 18,
  },
  recentOrderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  orderLeft: {
    flex: 1,
  },
  orderCustomer: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
  },
  orderMeta: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000000",
  },
  statusPill: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#000000",
  },
});
