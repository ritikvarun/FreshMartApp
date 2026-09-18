import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { ENDPOINTS } from "../../config/api";

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, grandTotal, clearCart } = useCart();
  const { user, token, isAuthenticated } = useAuth();

  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.name?.split(" ")[1] || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handlePlaceOrder = async () => {
    if (!isAuthenticated || !token) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to your account before placing an order.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/(auth)/sign-in" as any) },
        ]
      );
      return;
    }

    if (!firstName.trim() || !phone.trim() || !street.trim() || !city.trim() || !pinCode.trim()) {
      setErrorMessage("Please fill in all required delivery address fields.");
      return;
    }

    setIsPlacingOrder(true);
    setErrorMessage("");

    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          ...item.product,
          size: item.size,
          quantity: item.quantity,
        })),
        amount: grandTotal,
        address: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim() || "Local",
          pinCode: pinCode.trim(),
        },
      };

      const res = await fetch(ENDPOINTS.ORDER.PLACE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (res.ok) {
        await clearCart();
        setOrderPlacedSuccess(true);
      } else {
        setErrorMessage(data.message || "Failed to place order. Please try again.");
      }
    } catch (err: any) {
      console.error("Place order network error:", err);
      setErrorMessage("Network error: Could not reach backend server.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (orderPlacedSuccess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.successContainer}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-circle" size={72} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Order Placed Successfully! 🎉</Text>
          <Text style={styles.successSubtitle}>
            Your fresh grocery order has been confirmed. Our delivery partner will arrive with your order soon.
          </Text>

          <View style={styles.successSummaryCard}>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Payment Method</Text>
              <Text style={styles.successValue}>Cash On Delivery (COD)</Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Total Amount</Text>
              <Text style={styles.successValue}>${grandTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Deliver To</Text>
              <Text style={styles.successValue} numberOfLines={1}>
                {street}, {city}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewOrdersBtn}
            onPress={() => router.replace("/(root)/orders" as any)}
            activeOpacity={0.88}
          >
            <Text style={styles.viewOrdersBtnText}>View My Orders</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.continueShopBtn}
            onPress={() => router.replace("/(root)/(tabs)" as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.continueShopBtnText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Address Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="location" size={20} color="#E05315" />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>First Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="John"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="+1 555 0192"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Street / Apartment / House No. *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Flat 4B, Green Avenue"
              value={street}
              onChangeText={setStreet}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="New York"
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Postal / Pin Code *</Text>
              <TextInput
                style={styles.input}
                placeholder="10001"
                keyboardType="numeric"
                value={pinCode}
                onChangeText={setPinCode}
              />
            </View>
          </View>
        </View>

        {/* Payment Method Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="wallet" size={20} color="#E05315" />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "COD" && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod("COD")}
            activeOpacity={0.8}
          >
            <View style={styles.paymentRadio}>
              {paymentMethod === "COD" && <View style={styles.paymentRadioDot} />}
            </View>
            <View style={styles.paymentIconWrapper}>
              <Ionicons name="cash-outline" size={20} color="#10B981" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.paymentTitle}>Cash on Delivery (COD)</Text>
              <Text style={styles.paymentSubtitle}>Pay with cash or UPI upon delivery</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Order Summary Snapshot */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="receipt" size={20} color="#E05315" />
            <Text style={styles.sectionTitle}>Order Summary ({cartItems.length} items)</Text>
          </View>

          {cartItems.map((item) => (
            <View key={`${item.productId}-${item.size}`} style={styles.summaryItemRow}>
              <Text style={styles.summaryItemName} numberOfLines={1}>
                {item.quantity}x {item.product.name} ({item.size})
              </Text>
              <Text style={styles.summaryItemPrice}>
                ${(item.product.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.summaryDivider} />

          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalLabel}>Total Amount to Pay</Text>
            <Text style={styles.summaryTotalAmount}>${grandTotal.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order CTA Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomBarSub}>Grand Total</Text>
          <Text style={styles.bottomBarTotal}>${grandTotal.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderBtn, isPlacingOrder && { opacity: 0.7 }]}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder}
          activeOpacity={0.88}
        >
          {isPlacingOrder ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.placeOrderBtnText}>Confirm & Place Order</Text>
              <Ionicons name="checkmark-done" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1D26",
    marginLeft: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: "#1A1D26",
  },

  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  paymentOptionSelected: {
    borderColor: "#E05315",
    backgroundColor: "#FFF8F5",
  },
  paymentRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#E05315",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E05315",
  },
  paymentIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EBF8F2",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1D26",
  },
  paymentSubtitle: {
    fontSize: 11,
    color: "#8B92A2",
    marginTop: 2,
  },

  summaryItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  summaryItemName: {
    fontSize: 13,
    color: "#4B5563",
    flex: 1,
    marginRight: 8,
  },
  summaryItemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1D26",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 10,
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1A1D26",
  },
  summaryTotalAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#E05315",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#EEF0F4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomBarSub: {
    fontSize: 11,
    color: "#8B92A2",
  },
  bottomBarTotal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1D26",
  },
  placeOrderBtn: {
    backgroundColor: "#E05315",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 24,
    shadowColor: "#E05315",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  placeOrderBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  successIconCircle: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1D26",
    textAlign: "center",
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  successSummaryCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 18,
    padding: 16,
    width: "100%",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  successRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  successLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  successValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1A1D26",
  },
  viewOrdersBtn: {
    backgroundColor: "#E05315",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 48,
    borderRadius: 24,
    marginBottom: 12,
    shadowColor: "#E05315",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  viewOrdersBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  continueShopBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 46,
  },
  continueShopBtnText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
});
