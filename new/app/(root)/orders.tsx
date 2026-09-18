import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { ENDPOINTS } from "../../config/api";

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  image1?: string;
  size?: string;
  quantity?: number;
}

interface OrderRecord {
  _id: string;
  items: OrderItem[];
  amount: number;
  status: string;
  paymentMethod: string;
  payment: boolean;
  date: number;
  address?: {
    street?: string;
    city?: string;
  };
}

export default function OrdersScreen() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [token, isAuthenticated]);

  const fetchOrders = async () => {
    if (!isAuthenticated || !token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(ENDPOINTS.ORDER.USER_ORDERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        // Sort most recent first
        const sorted = Array.isArray(data)
          ? data.sort((a, b) => (b.date || 0) - (a.date || 0))
          : [];
        setOrders(sorted);
      }
    } catch (err) {
      console.warn("Failed to fetch user orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return { bg: "#ECFDF5", text: "#059669", icon: "checkmark-circle" as const };
      case "out for delivery":
        return { bg: "#EFF6FF", text: "#2563EB", icon: "bicycle" as const };
      case "order placed":
      default:
        return { bg: "#FFF7ED", text: "#D97706", icon: "time" as const };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#1A1D26" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={fetchOrders}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={20} color="#1A1D26" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E05315" />
          <Text style={styles.loadingText}>Fetching your orders...</Text>
        </View>
      ) : !isAuthenticated ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="lock-closed-outline" size={48} color="#E05315" />
          </View>
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptySubtitle}>
            Please log in to view and track your active and past grocery orders.
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push("/(auth)/sign-in" as any)}
            activeOpacity={0.88}
          >
            <Text style={styles.ctaBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="bag-handle-outline" size={48} color="#E05315" />
          </View>
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>
            You haven't placed any grocery orders yet. Start adding farm-fresh items to your cart!
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.replace("/(root)/(tabs)" as any)}
            activeOpacity={0.88}
          >
            <Text style={styles.ctaBtnText}>Start Shopping</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {orders.map((order) => {
            const statusConfig = getStatusColor(order.status || "Order Placed");
            const orderDate = order.date
              ? new Date(order.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recent";

            return (
              <View key={order._id} style={styles.orderCard}>
                {/* Order Top: ID, Date and Status */}
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>
                      Order #{order._id.slice(-6).toUpperCase()}
                    </Text>
                    <Text style={styles.orderDate}>{orderDate}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusConfig.bg },
                    ]}
                  >
                    <Ionicons
                      name={statusConfig.icon}
                      size={13}
                      color={statusConfig.text}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[styles.statusText, { color: statusConfig.text }]}
                    >
                      {order.status || "Order Placed"}
                    </Text>
                  </View>
                </View>

                {/* Items in order */}
                <View style={styles.itemsList}>
                  {order.items?.map((item, idx) => (
                    <View key={idx} style={styles.orderItemRow}>
                      {item.image1 ? (
                        <Image
                          source={{ uri: item.image1 }}
                          style={styles.itemThumb}
                        />
                      ) : (
                        <View style={styles.itemThumbPlaceholder}>
                          <Ionicons name="basket" size={16} color="#E05315" />
                        </View>
                      )}

                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.itemMeta}>
                          Qty: {item.quantity || 1} • {item.size || "Standard"}
                        </Text>
                      </View>

                      <Text style={styles.itemPrice}>
                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Order Footer: Payment & Total Amount */}
                <View style={styles.orderFooter}>
                  <View style={styles.paymentMethodRow}>
                    <Ionicons name="card" size={14} color="#6B7280" />
                    <Text style={styles.paymentMethodText}>
                      {order.paymentMethod || "COD"}
                    </Text>
                  </View>

                  <View style={styles.amountRow}>
                    <Text style={styles.totalLabel}>Total: </Text>
                    <Text style={styles.totalAmount}>
                      ${(order.amount || 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
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
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1D26",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#8B92A2",
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  orderId: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1A1D26",
  },
  orderDate: {
    fontSize: 11,
    color: "#8B92A2",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  itemsList: {
    paddingVertical: 12,
  },
  orderItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  itemThumb: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  itemThumbPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#FFF0E8",
    alignItems: "center",
    justifyContent: "center",
  },
  itemName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1D26",
  },
  itemMeta: {
    fontSize: 11,
    color: "#8B92A2",
    marginTop: 1,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1D26",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: "800",
    color: "#E05315",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#FFF0E8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1D26",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
  },
  ctaBtn: {
    backgroundColor: "#E05315",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    height: 48,
    borderRadius: 24,
  },
  ctaBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
