import React, { useState, useEffect } from "react";
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
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { ENDPOINTS } from "../../config/api";

const ADDRESS_STORAGE_KEY = "freshmart_delivery_address";
const PAYMENT_PREF_KEY = "freshmart_payment_preference";

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, grandTotal, clearCart } = useCart();
  const { user, token, isAuthenticated } = useAuth();

  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.name?.split(" ")[1] || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [liveLocation, setLiveLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Captured order details for success screen (preserves amount after clearCart)
  const [placedOrderAmount, setPlacedOrderAmount] = useState(0);
  const [placedPaymentMethod, setPlacedPaymentMethod] = useState("COD");

  // Razorpay Interactive Payment Gateway Sheet (Test Mode Simulation)
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayOrderData, setRazorpayOrderData] = useState<any>(null);
  const [selectedUpiApp, setSelectedUpiApp] = useState<"gpay" | "phonepe" | "card" | "netbanking">("gpay");
  const [rzpStep, setRzpStep] = useState<"select" | "upi_wait" | "card_otp">("select");
  const [testUpiId, setTestUpiId] = useState("user@okhdfcbank");
  const [testCardNumber, setTestCardNumber] = useState("4111 1111 1111 1111");
  const [testCardExpiry, setTestCardExpiry] = useState("12/28");
  const [testCardCvv, setTestCardCvv] = useState("123");
  const [testOtp, setTestOtp] = useState("123456");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Load saved address and payment preference
  useEffect(() => {
    async function loadSavedData() {
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
          const addr = JSON.parse(addrStr);
          if (addr.firstName) setFirstName(addr.firstName);
          if (addr.lastName) setLastName(addr.lastName);
          if (addr.phone) setPhone(addr.phone);
          if (addr.email) setEmail(addr.email);
          if (addr.street) setStreet(addr.street);
          if (addr.landmark) setLandmark(addr.landmark);
          if (addr.city) setCity(addr.city);
          if (addr.state) setState(addr.state);
          if (addr.pinCode) setPinCode(addr.pinCode);
          if (addr.latitude && addr.longitude) {
            setLiveLocation({ latitude: addr.latitude, longitude: addr.longitude });
          }
        }
        if (payPref) {
          setPaymentMethod(payPref);
        }
      } catch (err) {
        console.warn("Failed to load saved checkout data:", err);
      }
    }
    loadSavedData();
  }, []);

  // Use Current Location (GPS)
  const handleUseCurrentLocation = async () => {
    setIsFetchingLocation(true);
    setErrorMessage("");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is needed to detect your exact delivery address. You can still enter your address manually."
        );
        setIsFetchingLocation(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = loc.coords;
      setLiveLocation({ latitude, longitude });

      // Reverse geocode to get address components
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverseGeocode && reverseGeocode.length > 0) {
          const res = reverseGeocode[0];
          const detectedStreet = [res.name, res.street, res.subregion].filter(Boolean).join(", ");
          if (detectedStreet) setStreet(detectedStreet);
          if (res.city) setCity(res.city);
          if (res.region) setState(res.region);
          if (res.postalCode) setPinCode(res.postalCode);
        }
      } catch (geocodeErr) {
        console.warn("Reverse geocode failed:", geocodeErr);
      }

      Alert.alert(
        "Location Detected! 📍",
        "Your exact GPS coordinates have been saved for delivery. Please verify or complete your house / street details."
      );
    } catch (err: any) {
      console.error("Location error:", err);
      Alert.alert(
        "Location Detection Failed",
        "Could not detect current location. Please enter your address manually."
      );
    } finally {
      setIsFetchingLocation(false);
    }
  };

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

    const addressData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      street: street.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      state: state.trim() || "Local",
      pinCode: pinCode.trim(),
      latitude: liveLocation?.latitude || null,
      longitude: liveLocation?.longitude || null,
      isLiveLocation: !!liveLocation,
    };

    // Save address and payment method to storage for future orders
    try {
      const addrSerialized = JSON.stringify(addressData);
      if (Platform.OS === "web") {
        localStorage.setItem(ADDRESS_STORAGE_KEY, addrSerialized);
        localStorage.setItem(PAYMENT_PREF_KEY, paymentMethod);
      } else {
        await SecureStore.setItemAsync(ADDRESS_STORAGE_KEY, addrSerialized);
        await SecureStore.setItemAsync(PAYMENT_PREF_KEY, paymentMethod);
      }
    } catch (e) {
      console.warn("Could not persist checkout info:", e);
    }

    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          ...item.product,
          size: item.size,
          quantity: item.quantity,
        })),
        amount: grandTotal,
        address: addressData,
      };

      if (paymentMethod === "Razorpay") {
        // Razorpay flow: Create order on backend
        const rzpRes = await fetch(ENDPOINTS.ORDER.RAZORPAY, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderPayload),
        });

        const rzpData = await rzpRes.json();

        if (!rzpRes.ok) {
          setErrorMessage(rzpData.message || "Razorpay order creation failed.");
          setIsPlacingOrder(false);
          return;
        }

        // Open Razorpay Checkout Modal
        setRazorpayOrderData(rzpData);
        setShowRazorpayModal(true);
        setIsPlacingOrder(false);
        return;
      } else {
        // COD flow
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
          setPlacedOrderAmount(grandTotal);
          setPlacedPaymentMethod("COD");
          await clearCart();
          setOrderPlacedSuccess(true);
        } else {
          setErrorMessage(data.message || "Failed to place order. Please try again.");
        }
      }
    } catch (err: any) {
      console.error("Place order network error:", err);
      setErrorMessage("Network error: Could not reach backend server.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Complete Razorpay Payment (Verify with backend)
  const handleCompleteRazorpayPayment = async () => {
    if (!razorpayOrderData) return;
    setIsProcessingPayment(true);
    try {
      const verifyRes = await fetch(ENDPOINTS.ORDER.VERIFY_RAZORPAY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ razorpay_order_id: razorpayOrderData.id }),
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok) {
        setPlacedOrderAmount(grandTotal);
        setPlacedPaymentMethod("Razorpay");
        await clearCart();
        setShowRazorpayModal(false);
        setOrderPlacedSuccess(true);
      } else {
        Alert.alert("Payment Failed", verifyData.message || "Payment verification failed.");
      }
    } catch (err) {
      console.error("Payment verify error:", err);
      Alert.alert("Payment Error", "Could not complete payment verification.");
    } finally {
      setIsProcessingPayment(false);
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
              <Text style={styles.successValue}>
                {placedPaymentMethod === "Razorpay" ? "Razorpay Online (Paid)" : "Cash On Delivery (COD)"}
              </Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Total Amount</Text>
              <Text style={styles.successValue}>₹{placedOrderAmount.toFixed(0)}</Text>
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
            <Ionicons name="location" size={20} color="#0F172A" />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>

          {/* Use Current Location Button */}
          <TouchableOpacity
            style={styles.locationDetectBtn}
            onPress={handleUseCurrentLocation}
            disabled={isFetchingLocation}
            activeOpacity={0.8}
          >
            {isFetchingLocation ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <ActivityIndicator size="small" color="#059669" />
                <Text style={styles.locationDetectText}>Detecting your GPS location...</Text>
              </View>
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="navigate-circle" size={18} color="#059669" />
                <Text style={styles.locationDetectText}>Use My Current Location (GPS)</Text>
              </View>
            )}
          </TouchableOpacity>

          {liveLocation && (
            <View style={styles.liveLocationActivePill}>
              <Ionicons name="checkmark-circle" size={14} color="#059669" />
              <Text style={styles.liveLocationActiveText}>
                GPS Coordinates Locked: {liveLocation.latitude.toFixed(4)}, {liveLocation.longitude.toFixed(4)}
              </Text>
            </View>
          )}

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

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nearby Landmark (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Near Shiv Mandir / Opp. State Bank"
              value={landmark}
              onChangeText={setLandmark}
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
            <Ionicons name="wallet" size={20} color="#0F172A" />
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

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "Razorpay" && styles.paymentOptionSelected,
              { marginTop: 10 },
            ]}
            onPress={() => setPaymentMethod("Razorpay")}
            activeOpacity={0.8}
          >
            <View style={styles.paymentRadio}>
              {paymentMethod === "Razorpay" && <View style={styles.paymentRadioDot} />}
            </View>
            <View style={[styles.paymentIconWrapper, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="card-outline" size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.paymentTitle}>Razorpay Online</Text>
                <View style={styles.rzpPill}>
                  <Text style={styles.rzpPillText}>Instant</Text>
                </View>
              </View>
              <Text style={styles.paymentSubtitle}>UPI (GPay, PhonePe), Cards & NetBanking</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Order Summary Snapshot */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="receipt" size={20} color="#0F172A" />
            <Text style={styles.sectionTitle}>Order Summary ({cartItems.length} items)</Text>
          </View>

          {cartItems.map((item) => (
            <View key={`${item.productId}-${item.size}`} style={styles.summaryItemRow}>
              <Text style={styles.summaryItemName} numberOfLines={1}>
                {item.quantity}x {item.product.name} ({item.size})
              </Text>
              <Text style={styles.summaryItemPrice}>
                ₹{(item.product.price * item.quantity).toFixed(0)}
              </Text>
            </View>
          ))}

          <View style={styles.summaryDivider} />

          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalLabel}>Total Amount to Pay</Text>
            <Text style={styles.summaryTotalAmount}>₹{grandTotal.toFixed(0)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order CTA Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomBarSub}>Grand Total</Text>
          <Text style={styles.bottomBarTotal}>₹{grandTotal.toFixed(0)}</Text>
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

      {/* Razorpay Interactive Payment Sheet Modal (Test Mode Simulation) */}
      <Modal
        visible={showRazorpayModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isProcessingPayment && setShowRazorpayModal(false)}
      >
        <View style={styles.rzpModalOverlay}>
          <View style={styles.rzpModalSheet}>
            {/* Header */}
            <View style={styles.rzpHeader}>
              <View style={styles.rzpBrandRow}>
                {rzpStep !== "select" && (
                  <TouchableOpacity
                    onPress={() => !isProcessingPayment && setRzpStep("select")}
                    style={styles.rzpBackStepBtn}
                  >
                    <Ionicons name="arrow-back" size={20} color="#0F172A" />
                  </TouchableOpacity>
                )}
                <View style={styles.rzpLogoBadge}>
                  <Ionicons name="flash" size={16} color="#0284C7" />
                </View>
                <View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={styles.rzpBrandTitle}>Razorpay</Text>
                    <View style={styles.rzpTestBadge}>
                      <Text style={styles.rzpTestBadgeText}>TEST MODE</Text>
                    </View>
                  </View>
                  <Text style={styles.rzpBrandSub}>Secure 256-Bit SSL Encrypted</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => !isProcessingPayment && setShowRazorpayModal(false)}
                disabled={isProcessingPayment}
                style={styles.rzpCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Total Amount Pill */}
            <View style={styles.rzpAmountCard}>
              <View>
                <Text style={styles.rzpAmountLabel}>Order Total</Text>
                <Text style={styles.rzpMerchantText}>FreshMart Store</Text>
              </View>
              <Text style={styles.rzpAmountValue}>₹{grandTotal.toFixed(0)}</Text>
            </View>

            {/* STEP 1: PAYMENT METHOD SELECTION */}
            {rzpStep === "select" && (
              <View>
                <Text style={styles.rzpSectionTitle}>Select Payment Option</Text>

                {/* Google Pay / UPI */}
                <TouchableOpacity
                  style={[styles.rzpOptionCard, selectedUpiApp === "gpay" && styles.rzpOptionActive]}
                  onPress={() => setSelectedUpiApp("gpay")}
                  activeOpacity={0.8}
                >
                  <View style={styles.rzpOptionLeft}>
                    <View style={[styles.rzpOptionIcon, { backgroundColor: "#E0F2FE" }]}>
                      <Ionicons name="logo-google" size={18} color="#0284C7" />
                    </View>
                    <View>
                      <Text style={styles.rzpOptionTitle}>Google Pay / UPI</Text>
                      <Text style={styles.rzpOptionSub}>Instant UPI payment</Text>
                    </View>
                  </View>
                  <Ionicons
                    name={selectedUpiApp === "gpay" ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={selectedUpiApp === "gpay" ? "#0F172A" : "#CBD5E1"}
                  />
                </TouchableOpacity>

                {/* PhonePe / Paytm */}
                <TouchableOpacity
                  style={[styles.rzpOptionCard, selectedUpiApp === "phonepe" && styles.rzpOptionActive]}
                  onPress={() => setSelectedUpiApp("phonepe")}
                  activeOpacity={0.8}
                >
                  <View style={styles.rzpOptionLeft}>
                    <View style={[styles.rzpOptionIcon, { backgroundColor: "#F3E8FF" }]}>
                      <Ionicons name="phone-portrait-outline" size={18} color="#7E22CE" />
                    </View>
                    <View>
                      <Text style={styles.rzpOptionTitle}>PhonePe / Paytm</Text>
                      <Text style={styles.rzpOptionSub}>Pay via PhonePe or Paytm</Text>
                    </View>
                  </View>
                  <Ionicons
                    name={selectedUpiApp === "phonepe" ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={selectedUpiApp === "phonepe" ? "#0F172A" : "#CBD5E1"}
                  />
                </TouchableOpacity>

                {/* Credit / Debit Card */}
                <TouchableOpacity
                  style={[styles.rzpOptionCard, selectedUpiApp === "card" && styles.rzpOptionActive]}
                  onPress={() => setSelectedUpiApp("card")}
                  activeOpacity={0.8}
                >
                  <View style={styles.rzpOptionLeft}>
                    <View style={[styles.rzpOptionIcon, { backgroundColor: "#FEF3C7" }]}>
                      <Ionicons name="card-outline" size={18} color="#D97706" />
                    </View>
                    <View>
                      <Text style={styles.rzpOptionTitle}>Cards (Visa, Master, RuPay)</Text>
                      <Text style={styles.rzpOptionSub}>Credit and debit cards</Text>
                    </View>
                  </View>
                  <Ionicons
                    name={selectedUpiApp === "card" ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={selectedUpiApp === "card" ? "#0F172A" : "#CBD5E1"}
                  />
                </TouchableOpacity>

                {/* NetBanking */}
                <TouchableOpacity
                  style={[styles.rzpOptionCard, selectedUpiApp === "netbanking" && styles.rzpOptionActive]}
                  onPress={() => setSelectedUpiApp("netbanking")}
                  activeOpacity={0.8}
                >
                  <View style={styles.rzpOptionLeft}>
                    <View style={[styles.rzpOptionIcon, { backgroundColor: "#DCFCE7" }]}>
                      <Ionicons name="business-outline" size={18} color="#15803D" />
                    </View>
                    <View>
                      <Text style={styles.rzpOptionTitle}>NetBanking</Text>
                      <Text style={styles.rzpOptionSub}>All Indian banks supported</Text>
                    </View>
                  </View>
                  <Ionicons
                    name={selectedUpiApp === "netbanking" ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={selectedUpiApp === "netbanking" ? "#0F172A" : "#CBD5E1"}
                  />
                </TouchableOpacity>

                {/* Proceed Button */}
                <TouchableOpacity
                  style={styles.rzpPayBtn}
                  onPress={() => {
                    if (selectedUpiApp === "gpay" || selectedUpiApp === "phonepe") {
                      setRzpStep("upi_wait");
                    } else if (selectedUpiApp === "card") {
                      setRzpStep("card_otp");
                    } else {
                      handleCompleteRazorpayPayment();
                    }
                  }}
                  activeOpacity={0.9}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Ionicons name="arrow-forward-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.rzpPayBtnText}>Proceed to Pay ₹{grandTotal.toFixed(0)}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 2: UPI PAYMENT SIMULATOR */}
            {rzpStep === "upi_wait" && (
              <View style={styles.rzpSimulationBox}>
                <View style={styles.rzpSimulationIconCircle}>
                  <Ionicons name="phone-portrait" size={32} color="#0284C7" />
                </View>
                <Text style={styles.rzpSimulationTitle}>Approve UPI Payment</Text>
                <Text style={styles.rzpSimulationSub}>
                  A payment request of <Text style={{ fontWeight: "800", color: "#0F172A" }}>₹{grandTotal.toFixed(0)}</Text> has been sent to your UPI App.
                </Text>

                <View style={styles.rzpSimulationInfoRow}>
                  <Text style={styles.rzpSimulationInfoLabel}>UPI ID:</Text>
                  <Text style={styles.rzpSimulationInfoValue}>{testUpiId}</Text>
                </View>

                <View style={styles.rzpTimerBox}>
                  <Ionicons name="time-outline" size={16} color="#D97706" />
                  <Text style={styles.rzpTimerText}>Request expires in: 04:59</Text>
                </View>

                <Text style={styles.rzpSimNotice}>⚡ Razorpay Test Mode: Choose action to test</Text>

                {/* Simulate Success Button */}
                <TouchableOpacity
                  style={[styles.rzpSuccessBtn, isProcessingPayment && { opacity: 0.7 }]}
                  onPress={handleCompleteRazorpayPayment}
                  disabled={isProcessingPayment}
                  activeOpacity={0.9}
                >
                  {isProcessingPayment ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.rzpPayBtnText}>Verifying Payment...</Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                      <Text style={styles.rzpPayBtnText}>Simulate Success (Approve)</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Simulate Failure Button */}
                <TouchableOpacity
                  style={styles.rzpFailureBtn}
                  onPress={() => {
                    Alert.alert("Payment Cancelled", "UPI payment request was declined.");
                    setRzpStep("select");
                  }}
                  disabled={isProcessingPayment}
                  activeOpacity={0.8}
                >
                  <Text style={styles.rzpFailureBtnText}>Simulate Failure (Decline)</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 3: CARD 3D SECURE OTP SIMULATOR */}
            {rzpStep === "card_otp" && (
              <View style={styles.rzpSimulationBox}>
                <View style={[styles.rzpSimulationIconCircle, { backgroundColor: "#FEF3C7" }]}>
                  <Ionicons name="shield-checkmark" size={32} color="#D97706" />
                </View>
                <Text style={styles.rzpSimulationTitle}>Bank 3D Secure OTP</Text>
                <Text style={styles.rzpSimulationSub}>
                  Enter the 6-digit OTP sent to your registered mobile number for card ending in <Text style={{ fontWeight: "800", color: "#0F172A" }}>1111</Text>.
                </Text>

                <View style={styles.rzpOtpInputBox}>
                  <Text style={styles.rzpOtpLabel}>ENTER OTP</Text>
                  <TextInput
                    style={styles.rzpOtpInput}
                    value={testOtp}
                    onChangeText={setTestOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholder="123456"
                    placeholderTextColor="#94A3B8"
                  />
                  <Text style={styles.rzpOtpHint}>Test Mode OTP is: 123456</Text>
                </View>

                {/* Submit OTP Button */}
                <TouchableOpacity
                  style={[styles.rzpPayBtn, isProcessingPayment && { opacity: 0.7 }]}
                  onPress={handleCompleteRazorpayPayment}
                  disabled={isProcessingPayment}
                  activeOpacity={0.9}
                >
                  {isProcessingPayment ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.rzpPayBtnText}>Verifying OTP...</Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
                      <Text style={styles.rzpPayBtnText}>Submit OTP & Pay ₹{grandTotal.toFixed(0)}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity
                  style={styles.rzpCancelBtn}
                  onPress={() => setRzpStep("select")}
                  disabled={isProcessingPayment}
                  activeOpacity={0.8}
                >
                  <Text style={styles.rzpCancelBtnText}>Cancel Transaction</Text>
                </TouchableOpacity>
              </View>
            )}
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
  locationDetectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  locationDetectText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
  },
  liveLocationActivePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 14,
  },
  liveLocationActiveText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
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
    borderColor: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  paymentRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0F172A",
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
  rzpPill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  rzpPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2563EB",
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
    color: "#0F172A",
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
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 24,
    shadowColor: "#0F172A",
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
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 48,
    borderRadius: 24,
    marginBottom: 12,
    shadowColor: "#0F172A",
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

  // Razorpay Checkout Modal Styles
  rzpModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-end",
  },
  rzpModalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 36,
  },
  rzpHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  rzpBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rzpLogoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  rzpBrandTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  rzpBrandSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  rzpCloseBtn: {
    padding: 6,
  },
  rzpAmountCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 18,
  },
  rzpAmountLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  rzpAmountValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
  },
  rzpSectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  rzpOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  rzpOptionActive: {
    borderColor: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  rzpOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rzpOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rzpOptionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  rzpOptionSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  rzpPayBtn: {
    backgroundColor: "#0F172A",
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  rzpPayBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  rzpBackStepBtn: {
    padding: 4,
    marginRight: 4,
  },
  rzpTestBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  rzpTestBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#B45309",
    letterSpacing: 0.5,
  },
  rzpMerchantText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },
  rzpSimulationBox: {
    alignItems: "center",
    paddingVertical: 10,
  },
  rzpSimulationIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  rzpSimulationTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  rzpSimulationSub: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  rzpSimulationInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  rzpSimulationInfoLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  rzpSimulationInfoValue: {
    fontSize: 12,
    color: "#0F172A",
    fontWeight: "700",
  },
  rzpTimerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  rzpTimerText: {
    fontSize: 12,
    color: "#D97706",
    fontWeight: "700",
  },
  rzpSimNotice: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 14,
  },
  rzpSuccessBtn: {
    backgroundColor: "#10B981",
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 10,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  rzpFailureBtn: {
    borderWidth: 1.5,
    borderColor: "#EF4444",
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    backgroundColor: "#FEF2F2",
  },
  rzpFailureBtnText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "700",
  },
  rzpOtpInputBox: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    alignItems: "center",
  },
  rzpOtpLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  rzpOtpInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    width: "80%",
    height: 48,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 6,
    color: "#0F172A",
    marginBottom: 6,
  },
  rzpOtpHint: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  rzpCancelBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 6,
  },
  rzpCancelBtnText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
});
