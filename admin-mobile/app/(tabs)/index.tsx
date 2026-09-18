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
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#E05315" />
            <Text style={styles.loaderText}>Loading Store Metrics...</Text>
          </View>
        ) : (
          <>
            {/* Stat Cards Row */}
            <View style={styles.statsGrid}>
              {/* Card 1: Total Orders */}
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => router.push("/(tabs)/orders" as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.statIconWrapper, { backgroundColor: "#FFF0E8" }]}>
                  <Ionicons name="bag-handle" size={24} color="#E05315" />
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
                <View style={[styles.statIconWrapper, { backgroundColor: "#EBF8F2" }]}>
                  <Ionicons name="cube" size={24} color="#10B981" />
                </View>
                <Text style={styles.statLabel}>Total Products</Text>
                <Text style={styles.statValue}>{totalProducts}</Text>
              </TouchableOpacity>

              {/* Card 3: Total Revenue */}
              <View style={[styles.statCard, { width: "100%" }]}>
                <View style={[styles.statIconWrapper, { backgroundColor: "#EEF4FF" }]}>
                  <Ionicons name="cash" size={24} color="#3B82F6" />
                </View>
                <Text style={styles.statLabel}>Total Store Revenue</Text>
                <Text style={[styles.statValue, { color: "#10B981" }]}>
                  ${totalRevenue.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Quick Actions Bar */}
            <View style={styles.actionsCard}>
              <Text style={styles.sectionTitle}>Quick Store Actions</Text>
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => router.push("/(tabs)/add" as any)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Add Product</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#1A1D26" }]}
                  onPress={() => router.push("/(tabs)/orders" as any)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="list" size={20} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>All Orders</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recent Orders List */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Recent Customer Orders</Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/orders" as any)}>
                  <Text style={styles.seeAllText}>View All</Text>
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
                      <Text style={styles.orderAmount}>${(ord.amount || 0).toFixed(2)}</Text>
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
    borderBottomColor: "#F3F4F6",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#10B981",
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1D26",
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  loaderContainer: {
    paddingTop: 60,
    alignItems: "center",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 13,
    color: "#8B92A2",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1A1D26",
  },
  actionsCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1D26",
    marginBottom: 12,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#E05315",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 14,
    gap: 6,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E05315",
  },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 14,
  },
  recentOrderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  orderLeft: {
    flex: 1,
  },
  orderCustomer: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1D26",
  },
  orderMeta: {
    fontSize: 11,
    color: "#8B92A2",
    marginTop: 2,
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1A1D26",
  },
  statusPill: {
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#D97706",
  },
});
