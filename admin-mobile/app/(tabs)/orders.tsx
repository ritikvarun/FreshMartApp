import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ENDPOINTS } from "../../config/api";

const STATUSES = [
  "All",
  "Order Placed",
  "Packing",
  "Shipped",
  "Out for delivery",
  "Delivered",
];

export default function AdminOrdersScreen() {
  const { adminToken } = useAdminAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Status modal state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(ENDPOINTS.ORDERS.LIST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders([...data].reverse());
        }
      }
    } catch (err) {
      console.warn("Failed to fetch orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [adminToken]);

  const updateOrderStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(ENDPOINTS.ORDERS.STATUS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          orderId: selectedOrder._id,
          status: newStatus,
        }),
      });

      if (res.ok) {
        Alert.alert("Success", `Order status changed to: ${newStatus}`);
        setSelectedOrder(null);
        fetchOrders();
      } else {
        Alert.alert("Error", "Could not update status.");
      }
    } catch (err) {
      Alert.alert("Error", "Network request failed.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus =
      statusFilter === "All" ||
      (ord.status || "Order Placed").toLowerCase() === statusFilter.toLowerCase();
    const customer = `${ord.address?.firstName || ""} ${ord.address?.lastName || ""}`.toLowerCase();
    const city = (ord.address?.city || "").toLowerCase();
    const matchesSearch =
      customer.includes(search.toLowerCase()) || city.includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return { bg: "#ECFDF5", text: "#059669" };
      case "out for delivery":
        return { bg: "#FFF7ED", text: "#EA580C" };
      case "shipped":
        return { bg: "#F5F3FF", text: "#7C3AED" };
      case "packing":
        return { bg: "#FEFCE8", text: "#CA8A04" };
      case "order placed":
      default:
        return { bg: "#EFF6FF", text: "#2563EB" };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Customer Orders</Text>
          <Text style={styles.headerSub}>{orders.length} total orders recorded</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchOrders}>
          <Ionicons name="refresh-outline" size={20} color="#1A1D26" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by customer name or city..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Status Filter Horizontal Tabs */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {STATUSES.map((status) => {
            const isSelected = statusFilter === status;
            return (
              <TouchableOpacity
                key={status}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setStatusFilter(status)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders List */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#E05315" />
          <Text style={styles.loaderText}>Loading Orders...</Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="file-tray-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Orders Found</Text>
          <Text style={styles.emptySub}>No orders match your active filter.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.ordersScroll}
        >
          {filteredOrders.map((order) => {
            const currentStatus = order.status || "Order Placed";
            const statusTheme = getStatusStyle(currentStatus);
            const customerName = `${order.address?.firstName || "Customer"} ${
              order.address?.lastName || ""
            }`.trim();

            return (
              <View key={order._id} style={styles.orderCard}>
                {/* Order Top: ID, Date, Amount */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderId}>
                      #{order._id.slice(-6).toUpperCase()}
                    </Text>
                    <Text style={styles.orderDate}>
                      {order.date
                        ? new Date(order.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Recent"}
                    </Text>
                  </View>

                  <Text style={styles.orderAmount}>
                    ₹{Number(order.amount || 0)}
                  </Text>
                </View>

                {/* Customer Details */}
                <View style={styles.customerBox}>
                  <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={14} color="#6B7280" />
                    <Text style={styles.customerName}>{customerName}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={14} color="#6B7280" />
                    <Text style={styles.infoText}>{order.address?.phone || "No phone"}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={14} color="#6B7280" />
                    <Text style={styles.infoText} numberOfLines={2}>
                      {order.address?.street}
                      {order.address?.landmark ? `, Near ${order.address.landmark}` : ""}
                      {order.address?.city ? `, ${order.address.city}` : ""}
                      {order.address?.pinCode ? ` (${order.address.pinCode})` : ""}
                    </Text>
                  </View>

                  {order.address?.isLiveLocation && (
                    <View style={styles.liveLocationBadge}>
                      <Ionicons name="navigate-circle" size={13} color="#059669" />
                      <Text style={styles.liveLocationBadgeText}>GPS Live Location Verified</Text>
                    </View>
                  )}

                  {/* Address Actions: Google Maps & Call */}
                  <View style={styles.addressActionRow}>
                    <TouchableOpacity
                      style={styles.mapActionBtn}
                      onPress={() => {
                        const addr = order.address;
                        let mapUrl = "";
                        if (addr?.latitude && addr?.longitude) {
                          mapUrl = `https://www.google.com/maps/search/?api=1&query=${addr.latitude},${addr.longitude}`;
                        } else {
                          const query = [
                            addr?.street,
                            addr?.landmark,
                            addr?.city,
                            addr?.state,
                            addr?.pinCode,
                          ]
                            .filter(Boolean)
                            .join(", ");
                          mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
                        }
                        Linking.openURL(mapUrl).catch(() => {
                          Alert.alert("Error", "Could not open Google Maps.");
                        });
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="map" size={13} color="#2563EB" />
                      <Text style={styles.mapActionBtnText}>Open in Google Maps</Text>
                    </TouchableOpacity>

                    {order.address?.phone ? (
                      <TouchableOpacity
                        style={styles.callActionBtn}
                        onPress={() => {
                          Linking.openURL(`tel:${order.address.phone}`).catch(() => {
                            Alert.alert("Error", "Could not make call.");
                          });
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="call" size={13} color="#059669" />
                        <Text style={styles.callActionBtnText}>Call</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>

                {/* Ordered Items Preview */}
                <View style={styles.itemsPreview}>
                  <Text style={styles.itemsHeader}>Items ({order.items?.length || 0}):</Text>
                  {order.items?.map((item: any, idx: number) => (
                    <Text key={idx} style={styles.itemText} numberOfLines={1}>
                      • {item.quantity || 1}x {item.name} ({item.size || "Std"}) - ₹
                      {(item.price || 0) * (item.quantity || 1)}
                    </Text>
                  ))}
                </View>

                {/* Order Footer: Payment & Change Status Button */}
                <View style={styles.cardFooter}>
                  <View style={styles.paymentBadge}>
                    <Ionicons name="cash-outline" size={13} color="#059669" />
                    <Text style={styles.paymentText}>{order.paymentMethod || "COD"}</Text>
                  </View>

                  {/* Status Button (Tappable to change) */}
                  <TouchableOpacity
                    style={[styles.statusBtn, { backgroundColor: statusTheme.bg }]}
                    onPress={() => setSelectedOrder(order)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.statusBtnText, { color: statusTheme.text }]}>
                      {currentStatus}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={statusTheme.text} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Change Status Modal */}
      <Modal visible={!!selectedOrder} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Order Status</Text>
              <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Select new status for order #{selectedOrder?._id?.slice(-6)?.toUpperCase()}
            </Text>

            {STATUSES.filter((s) => s !== "All").map((status) => {
              const isCurrent = (selectedOrder?.status || "Order Placed") === status;
              return (
                <TouchableOpacity
                  key={status}
                  style={[styles.modalOption, isCurrent && styles.modalOptionActive]}
                  onPress={() => updateOrderStatus(status)}
                  disabled={isUpdatingStatus}
                >
                  <Text
                    style={[styles.modalOptionText, isCurrent && styles.modalOptionTextActive]}
                  >
                    {status}
                  </Text>
                  {isCurrent && (
                    <Ionicons name="checkmark" size={18} color="#E05315" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
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
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1D26",
  },
  headerSub: {
    fontSize: 12,
    color: "#8B92A2",
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 6,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#1A1D26",
  },
  filterWrapper: {
    height: 44,
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: "center",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    height: 36,
  },
  filterChipActive: {
    backgroundColor: "#111827",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    marginTop: 10,
    color: "#8B92A2",
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1D26",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: "#8B92A2",
    marginTop: 4,
  },
  ordersScroll: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  orderId: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1D26",
  },
  orderDate: {
    fontSize: 11,
    color: "#8B92A2",
    marginTop: 2,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#E05315",
  },
  customerBox: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  customerName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1D26",
  },
  infoText: {
    fontSize: 12,
    color: "#4B5563",
    flex: 1,
  },
  itemsPreview: {
    paddingVertical: 10,
    gap: 2,
  },
  itemsHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 4,
  },
  itemText: {
    fontSize: 12,
    color: "#374151",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  paymentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  statusBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    width: "100%",
    maxWidth: 380,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1A1D26",
  },
  modalSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#F9FAFB",
  },
  modalOptionActive: {
    backgroundColor: "#FFF0E8",
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  modalOptionTextActive: {
    color: "#E05315",
    fontWeight: "700",
  },
  liveLocationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  liveLocationBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#059669",
  },
  addressActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  mapActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    gap: 6,
  },
  mapActionBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
  callActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
    gap: 6,
  },
  callActionBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
  },
});
