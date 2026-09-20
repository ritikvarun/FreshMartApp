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
  Modal,
  TextInput,
  Alert,
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
    landmark?: string;
    pinCode?: string;
    isLiveLocation?: boolean;
  };
}

const ORDER_STEPS = [
  { key: "Order Placed", label: "Placed", icon: "receipt-outline" },
  { key: "Packing", label: "Packing", icon: "cube-outline" },
  { key: "Shipped", label: "Shipped", icon: "boat-outline" },
  { key: "Out for delivery", label: "Out for Delivery", icon: "bicycle-outline" },
  { key: "Delivered", label: "Delivered", icon: "checkmark-circle-outline" },
];

const getStepIndex = (status: string) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return 4;
    case "out for delivery":
      return 3;
    case "shipped":
      return 2;
    case "packing":
      return 1;
    case "order placed":
    default:
      return 0;
  }
};

const RETURN_REASONS = [
  "Defective / Spoiled",
  "Wrong Item Delivered",
  "Quality Not Satisfactory",
  "Expired Item",
  "Missing Quantity",
  "Other",
];

export default function OrdersScreen() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [existingReturns, setExistingReturns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Return Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<OrderRecord | null>(null);
  const [selectedItemForReturn, setSelectedItemForReturn] = useState<OrderItem | null>(null);
  const [returnActionType, setReturnActionType] = useState<"Refund" | "Replacement">("Refund");
  const [returnReason, setReturnReason] = useState("Defective / Spoiled");
  const [returnDescription, setReturnDescription] = useState("");
  const [refundMethod, setRefundMethod] = useState<"UPI" | "Bank Transfer">("UPI");
  const [refundUpiId, setRefundUpiId] = useState("");
  const [refundAccountName, setRefundAccountName] = useState("");
  const [refundAccountNo, setRefundAccountNo] = useState("");
  const [refundIfsc, setRefundIfsc] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

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
        const sorted = Array.isArray(data)
          ? data.sort((a, b) => (b.date || 0) - (a.date || 0))
          : [];
        setOrders(sorted);
      }

      // Fetch user's existing returns
      try {
        const retRes = await fetch(ENDPOINTS.RETURN.MY_RETURNS, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (retRes.ok) {
          const retData = await retRes.json();
          setExistingReturns(Array.isArray(retData) ? retData : []);
        }
      } catch (retErr) {
        console.warn("Could not fetch user returns:", retErr);
      }
    } catch (err) {
      console.warn("Failed to fetch user orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return { bg: "#ECFDF5", text: "#059669", icon: "checkmark-circle" as const, label: "Delivered" };
      case "out for delivery":
        return { bg: "#EFF6FF", text: "#2563EB", icon: "bicycle" as const, label: "Out for Delivery" };
      case "shipped":
        return { bg: "#F3E8FF", text: "#7E22CE", icon: "boat" as const, label: "Shipped" };
      case "packing":
        return { bg: "#FEF3C7", text: "#D97706", icon: "cube" as const, label: "Packing" };
      case "order placed":
      default:
        return { bg: "#F1F5F9", text: "#475569", icon: "time" as const, label: "Order Placed" };
    }
  };

  const handleOpenReturnModal = (order: OrderRecord) => {
    if (order.status !== "Delivered") {
      Alert.alert(
        "Return Not Available Yet",
        `Return / Replacement is only allowed after the order is Delivered. Your order is currently "${order.status}".`
      );
      return;
    }

    setSelectedOrderForReturn(order);
    setSelectedItemForReturn(order.items?.[0] || null);
    setReturnActionType("Refund");
    setReturnReason("Defective / Spoiled");
    setReturnDescription("");
    setRefundMethod("UPI");
    setRefundUpiId("");
    setRefundAccountName("");
    setRefundAccountNo("");
    setRefundIfsc("");
    setShowReturnModal(true);
  };

  const handleSubmitReturn = async () => {
    if (!selectedOrderForReturn || !selectedItemForReturn) return;

    if (!returnReason) {
      Alert.alert("Required", "Please select a reason for return.");
      return;
    }

    if (returnActionType === "Refund") {
      if (refundMethod === "UPI" && !refundUpiId.trim()) {
        Alert.alert("Required", "Please enter your UPI ID for refund.");
        return;
      }
      if (
        refundMethod === "Bank Transfer" &&
        (!refundAccountName.trim() || !refundAccountNo.trim() || !refundIfsc.trim())
      ) {
        Alert.alert("Required", "Please fill in all bank details for refund.");
        return;
      }
    }

    setIsSubmittingReturn(true);
    try {
      const payload = {
        orderId: selectedOrderForReturn._id,
        itemId: selectedItemForReturn._id,
        itemName: selectedItemForReturn.name,
        itemImage: selectedItemForReturn.image1 || "",
        itemPrice: selectedItemForReturn.price || 0,
        itemSize: selectedItemForReturn.size || "Standard",
        reason: returnReason,
        description: returnDescription.trim(),
        actionType: returnActionType,
        refundMethod,
        refundDetails:
          refundMethod === "UPI"
            ? { upiId: refundUpiId.trim() }
            : {
                accountName: refundAccountName.trim(),
                accountNo: refundAccountNo.trim(),
                ifsc: refundIfsc.trim(),
              },
      };

      const res = await fetch(ENDPOINTS.RETURN.REQUEST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert(
          "Request Submitted! 🎉",
          "Your return/replacement request has been submitted to the admin for review."
        );
        setShowReturnModal(false);
        fetchOrders();
      } else {
        Alert.alert("Request Failed", data.message || "Could not submit return request.");
      }
    } catch (err) {
      console.error("Return submit error:", err);
      Alert.alert("Error", "Network error while submitting return request.");
    } finally {
      setIsSubmittingReturn(false);
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
          <ActivityIndicator size="large" color="#0F172A" />
          <Text style={styles.loadingText}>Fetching your orders...</Text>
        </View>
      ) : !isAuthenticated ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="lock-closed-outline" size={48} color="#0F172A" />
          </View>
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptySubtitle}>
            Please log in to view and track your active and past orders.
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
            <Ionicons name="bag-handle-outline" size={48} color="#0F172A" />
          </View>
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>
            You haven't placed any orders yet. Start adding fresh groceries to your cart!
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
            const statusConfig = getStatusConfig(order.status || "Order Placed");
            const stepIndex = getStepIndex(order.status || "Order Placed");
            const orderDate = order.date
              ? new Date(order.date).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recent";

            // Check if any return request exists for this order
            const orderReturn = existingReturns.find((r) => r.orderId === order._id);

            return (
              <View key={order._id} style={styles.orderCard}>
                {/* Order Top: ID, Date and Status Badge */}
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

                {/* ── Order Status Progress Bar / Tracker ── */}
                <View style={styles.trackerWrapper}>
                  <View style={styles.trackerLineBg} />
                  <View
                    style={[
                      styles.trackerLineActive,
                      {
                        width: `${(stepIndex / (ORDER_STEPS.length - 1)) * 100}%`,
                      },
                    ]}
                  />

                  <View style={styles.trackerStepsRow}>
                    {ORDER_STEPS.map((step, idx) => {
                      const isCompleted = idx <= stepIndex;
                      const isCurrent = idx === stepIndex;

                      return (
                        <View key={step.key} style={styles.trackerStepItem}>
                          <View
                            style={[
                              styles.trackerStepCircle,
                              isCompleted && styles.trackerStepCircleDone,
                              isCurrent && styles.trackerStepCircleCurrent,
                            ]}
                          >
                            <Ionicons
                              name={step.icon as any}
                              size={12}
                              color={isCompleted ? "#FFFFFF" : "#94A3B8"}
                            />
                          </View>
                          <Text
                            style={[
                              styles.trackerStepLabel,
                              isCompleted && styles.trackerStepLabelDone,
                              isCurrent && styles.trackerStepLabelCurrent,
                            ]}
                            numberOfLines={1}
                          >
                            {step.label}
                          </Text>
                        </View>
                      );
                    })}
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
                          <Ionicons name="basket" size={16} color="#0F172A" />
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
                        ₹{((item.price || 0) * (item.quantity || 1)).toFixed(0)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Return / Replacement Action Box (Only for Delivered orders or Active Returns) */}
                {(orderReturn || order.status === "Delivered") && (
                  <View style={styles.returnSection}>
                    {orderReturn ? (
                      <View style={styles.returnStatusPill}>
                        <Ionicons name="sync-circle" size={16} color="#D97706" />
                        <Text style={styles.returnStatusPillText}>
                          Return {orderReturn.actionType} Status: <Text style={{ fontWeight: "800" }}>{orderReturn.status || "Pending"}</Text>
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.returnActionBtn}
                        onPress={() => handleOpenReturnModal(order)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="refresh-outline" size={15} color="#0F172A" />
                        <Text style={styles.returnActionBtnText}>Request Return / Replacement</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Order Footer: Payment & Total Amount */}
                <View style={styles.orderFooter}>
                  <View style={styles.paymentMethodRow}>
                    <Ionicons name="card" size={14} color="#6B7280" />
                    <Text style={styles.paymentMethodText}>
                      {order.paymentMethod || "COD"} {order.payment ? "· Paid" : ""}
                    </Text>
                  </View>

                  <View style={styles.amountRow}>
                    <Text style={styles.totalLabel}>Total: </Text>
                    <Text style={styles.totalAmount}>
                      ₹{(order.amount || 0).toFixed(0)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* ── RETURN / REPLACEMENT MODAL ── */}
      <Modal
        visible={showReturnModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isSubmittingReturn && setShowReturnModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Return / Replacement</Text>
                <Text style={styles.modalSub}>
                  Order #{selectedOrderForReturn?._id.slice(-6).toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => !isSubmittingReturn && setShowReturnModal(false)}
                disabled={isSubmittingReturn}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Select Item */}
              <Text style={styles.fieldLabel}>Select Item to Return</Text>
              {selectedOrderForReturn?.items?.map((item) => {
                const isSelected = selectedItemForReturn?._id === item._id;
                return (
                  <TouchableOpacity
                    key={item._id}
                    style={[styles.itemSelectCard, isSelected && styles.itemSelectCardActive]}
                    onPress={() => setSelectedItemForReturn(item)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                      {item.image1 ? (
                        <Image source={{ uri: item.image1 }} style={styles.itemSelectThumb} />
                      ) : (
                        <View style={styles.itemSelectThumbPlaceholder}>
                          <Ionicons name="basket" size={14} color="#0F172A" />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemSelectName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.itemSelectPrice}>₹{item.price}</Text>
                      </View>
                    </View>
                    <Ionicons
                      name={isSelected ? "radio-button-on" : "radio-button-off"}
                      size={18}
                      color={isSelected ? "#0F172A" : "#CBD5E1"}
                    />
                  </TouchableOpacity>
                );
              })}

              {/* Action Type: Refund or Replacement */}
              <Text style={styles.fieldLabel}>Action Requested</Text>
              <View style={styles.actionTypeRow}>
                <TouchableOpacity
                  style={[
                    styles.actionTypeBtn,
                    returnActionType === "Refund" && styles.actionTypeBtnActive,
                  ]}
                  onPress={() => setReturnActionType("Refund")}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="cash-outline"
                    size={16}
                    color={returnActionType === "Refund" ? "#FFFFFF" : "#475569"}
                  />
                  <Text
                    style={[
                      styles.actionTypeBtnText,
                      returnActionType === "Refund" && styles.actionTypeBtnTextActive,
                    ]}
                  >
                    Refund
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionTypeBtn,
                    returnActionType === "Replacement" && styles.actionTypeBtnActive,
                  ]}
                  onPress={() => setReturnActionType("Replacement")}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="repeat-outline"
                    size={16}
                    color={returnActionType === "Replacement" ? "#FFFFFF" : "#475569"}
                  />
                  <Text
                    style={[
                      styles.actionTypeBtnText,
                      returnActionType === "Replacement" && styles.actionTypeBtnTextActive,
                    ]}
                  >
                    Replacement
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Return Reason */}
              <Text style={styles.fieldLabel}>Reason for Return</Text>
              <View style={styles.reasonsList}>
                {RETURN_REASONS.map((r) => {
                  const isSelected = returnReason === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[styles.reasonChip, isSelected && styles.reasonChipActive]}
                      onPress={() => setReturnReason(r)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.reasonChipText,
                          isSelected && styles.reasonChipTextActive,
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Description Input */}
              <Text style={styles.fieldLabel}>Additional Notes (Optional)</Text>
              <TextInput
                style={styles.textInputArea}
                placeholder="Describe the issue with the item..."
                placeholderTextColor="#94A3B8"
                value={returnDescription}
                onChangeText={setReturnDescription}
                multiline
                numberOfLines={3}
              />

              {/* Refund Details (if Refund selected) */}
              {returnActionType === "Refund" && (
                <View style={styles.refundDetailsCard}>
                  <Text style={styles.refundCardTitle}>Refund Destination</Text>

                  <View style={styles.refundTabRow}>
                    <TouchableOpacity
                      style={[
                        styles.refundTabBtn,
                        refundMethod === "UPI" && styles.refundTabBtnActive,
                      ]}
                      onPress={() => setRefundMethod("UPI")}
                    >
                      <Text
                        style={[
                          styles.refundTabText,
                          refundMethod === "UPI" && styles.refundTabTextActive,
                        ]}
                      >
                        UPI ID
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.refundTabBtn,
                        refundMethod === "Bank Transfer" && styles.refundTabBtnActive,
                      ]}
                      onPress={() => setRefundMethod("Bank Transfer")}
                    >
                      <Text
                        style={[
                          styles.refundTabText,
                          refundMethod === "Bank Transfer" && styles.refundTabTextActive,
                        ]}
                      >
                        Bank Account
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {refundMethod === "UPI" ? (
                    <View style={{ marginTop: 10 }}>
                      <Text style={styles.inputSubLabel}>UPI ID (e.g. mobile@upi / name@okhdfcbank)</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="yourname@upi"
                        placeholderTextColor="#94A3B8"
                        value={refundUpiId}
                        onChangeText={setRefundUpiId}
                        autoCapitalize="none"
                      />
                    </View>
                  ) : (
                    <View style={{ marginTop: 10 }}>
                      <Text style={styles.inputSubLabel}>Account Holder Name</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="Name as in bank"
                        placeholderTextColor="#94A3B8"
                        value={refundAccountName}
                        onChangeText={setRefundAccountName}
                      />

                      <Text style={styles.inputSubLabel}>Account Number</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="Account Number"
                        placeholderTextColor="#94A3B8"
                        keyboardType="number-pad"
                        value={refundAccountNo}
                        onChangeText={setRefundAccountNo}
                      />

                      <Text style={styles.inputSubLabel}>IFSC Code</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="HDFC0001234"
                        placeholderTextColor="#94A3B8"
                        autoCapitalize="characters"
                        value={refundIfsc}
                        onChangeText={setRefundIfsc}
                      />
                    </View>
                  )}
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitReturnBtn, isSubmittingReturn && { opacity: 0.7 }]}
                onPress={handleSubmitReturn}
                disabled={isSubmittingReturn}
                activeOpacity={0.9}
              >
                {isSubmittingReturn ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitReturnBtnText}>
                    Submit {returnActionType} Request
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
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

  // ── Order Progress Tracker Styles ──
  trackerWrapper: {
    marginVertical: 14,
    position: "relative",
  },
  trackerLineBg: {
    position: "absolute",
    top: 14,
    left: 18,
    right: 18,
    height: 3,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
  },
  trackerLineActive: {
    position: "absolute",
    top: 14,
    left: 18,
    height: 3,
    backgroundColor: "#10B981",
    borderRadius: 2,
  },
  trackerStepsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  trackerStepItem: {
    alignItems: "center",
    width: 60,
  },
  trackerStepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  trackerStepCircleDone: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  trackerStepCircleCurrent: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
    transform: [{ scale: 1.08 }],
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  trackerStepLabel: {
    fontSize: 9,
    color: "#94A3B8",
    textAlign: "center",
    fontWeight: "600",
  },
  trackerStepLabelDone: {
    color: "#10B981",
    fontWeight: "700",
  },
  trackerStepLabelCurrent: {
    color: "#0F172A",
    fontWeight: "800",
  },

  // Items List
  itemsList: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F8FAFC",
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

  // Return Section on Card
  returnSection: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  returnActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingVertical: 8,
  },
  returnActionBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  returnNoticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  returnNoticeText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  returnStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  returnStatusPillText: {
    fontSize: 12,
    color: "#92400E",
  },

  // Order Footer
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginTop: 6,
  },
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
    fontWeight: "600",
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
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
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
    backgroundColor: "#F1F5F9",
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
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    height: 48,
    borderRadius: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // ── Return Modal Styles ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 36,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
  },
  itemSelectCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  itemSelectCardActive: {
    borderColor: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  itemSelectThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  itemSelectThumbPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  itemSelectName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  itemSelectPrice: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  actionTypeRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionTypeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  actionTypeBtnActive: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  actionTypeBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  actionTypeBtnTextActive: {
    color: "#FFFFFF",
  },
  reasonsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  reasonChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  reasonChipActive: {
    borderColor: "#0F172A",
    backgroundColor: "#0F172A",
  },
  reasonChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  reasonChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  textInputArea: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: "#0F172A",
    minHeight: 60,
    textAlignVertical: "top",
  },
  refundDetailsCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 14,
  },
  refundCardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  refundTabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  refundTabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
  },
  refundTabBtnActive: {
    backgroundColor: "#0F172A",
  },
  refundTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  refundTabTextActive: {
    color: "#FFFFFF",
  },
  inputSubLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
    marginTop: 6,
  },
  modalInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: "#0F172A",
  },
  submitReturnBtn: {
    backgroundColor: "#0F172A",
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitReturnBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
