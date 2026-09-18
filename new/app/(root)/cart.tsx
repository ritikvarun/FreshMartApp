import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useCart } from "../../context/CartContext";

const { width } = Dimensions.get("window");

export default function CartScreen() {
  const router = useRouter();
  const {
    cartItems,
    cartCount,
    subtotal,
    deliveryFee,
    grandTotal,
    updateQuantity,
  } = useCart();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#1A1D26" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={styles.itemCountBadge}>
          <Text style={styles.itemCountText}>{cartCount} items</Text>
        </View>
      </View>

      {/* Empty State */}
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="cart-outline" size={56} color="#E05315" />
          </View>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you haven't added any fresh groceries to your cart yet.
          </Text>
          <TouchableOpacity
            style={styles.shopNowBtn}
            onPress={() => router.replace("/(root)/(tabs)" as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.shopNowBtnText}>Start Shopping</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Express Delivery Banner */}
            <View style={styles.deliveryBanner}>
              <View style={styles.deliveryIconCircle}>
                <Ionicons name="flash" size={18} color="#10B981" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.deliveryTitle}>Express Delivery • 30 Mins</Text>
                <Text style={styles.deliverySubtitle}>
                  {deliveryFee === 0
                    ? "Free delivery applied on this order!"
                    : "Add $25+ items to get free delivery"}
                </Text>
              </View>
            </View>

            {/* Cart Items List */}
            <View style={styles.itemsSection}>
              {cartItems.map((item) => (
                <View
                  key={`${item.productId}-${item.size}`}
                  style={styles.cartCard}
                >
                  <Image
                    source={{ uri: item.product.image1 }}
                    style={styles.productThumb}
                    resizeMode="cover"
                  />

                  <View style={styles.cardDetails}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {item.product.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.productId, item.size, 0)}
                        activeOpacity={0.6}
                      >
                        <Ionicons name="close" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.productSize}>Size: {item.size}</Text>

                    <View style={styles.cardBottomRow}>
                      <Text style={styles.productPrice}>
                        ₹{(item.product.price * item.quantity).toFixed(0)}{" "}
                        <Text style={styles.unitPrice}>
                          (₹{item.product.price.toFixed(0)}/ea)
                        </Text>
                      </Text>

                      {/* Stepper */}
                      <View style={styles.stepper}>
                        <TouchableOpacity
                          style={styles.stepBtn}
                          onPress={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity - 1
                            )
                          }
                          activeOpacity={0.7}
                        >
                          <Ionicons name="remove" size={14} color="#1A1D26" />
                        </TouchableOpacity>

                        <Text style={styles.stepQty}>{item.quantity}</Text>

                        <TouchableOpacity
                          style={styles.stepBtn}
                          onPress={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity + 1
                            )
                          }
                          activeOpacity={0.7}
                        >
                          <Ionicons name="add" size={14} color="#1A1D26" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Bill Details Card */}
            <View style={styles.billCard}>
              <Text style={styles.billTitle}>Bill Summary</Text>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Subtotal</Text>
                <Text style={styles.billValue}>₹{subtotal.toFixed(0)}</Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Fee</Text>
                <Text
                  style={[
                    styles.billValue,
                    deliveryFee === 0 && { color: "#10B981", fontWeight: "700" },
                  ]}
                >
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(0)}`}
                </Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Packaging & Handling</Text>
                <Text style={[styles.billValue, { color: "#10B981" }]}>FREE</Text>
              </View>

              <View style={styles.billDivider} />

              <View style={styles.billTotalRow}>
                <Text style={styles.billTotalLabel}>Grand Total</Text>
                <Text style={styles.billTotalValue}>₹{grandTotal.toFixed(0)}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Sticky Bottom Checkout Action */}
          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.bottomBarLabel}>To Pay</Text>
              <Text style={styles.bottomBarTotal}>₹{grandTotal.toFixed(0)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => router.push("/(root)/checkout" as any)}
              activeOpacity={0.88}
            >
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </>
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
  itemCountBadge: {
    backgroundColor: "#FFF0E8",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E05315",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },

  deliveryBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    marginBottom: 16,
  },
  deliveryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#065F46",
  },
  deliverySubtitle: {
    fontSize: 11,
    color: "#047857",
    marginTop: 1,
  },

  itemsSection: {
    marginBottom: 20,
  },
  cartCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  productThumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  cardDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1D26",
    flex: 1,
    marginRight: 8,
  },
  productSize: {
    fontSize: 11,
    color: "#8B92A2",
    marginTop: 1,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1A1D26",
  },
  unitPrice: {
    fontSize: 11,
    fontWeight: "400",
    color: "#8B92A2",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepQty: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1D26",
    paddingHorizontal: 10,
  },

  billCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  billTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1D26",
    marginBottom: 14,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  billValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1D26",
  },
  billDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  billTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  billTotalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1D26",
  },
  billTotalValue: {
    fontSize: 17,
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
  bottomBarLabel: {
    fontSize: 11,
    color: "#8B92A2",
  },
  bottomBarTotal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1D26",
  },
  checkoutBtn: {
    backgroundColor: "#E05315",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 24,
    shadowColor: "#E05315",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF0E8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
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
  shopNowBtn: {
    backgroundColor: "#E05315",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    height: 48,
    borderRadius: 24,
  },
  shopNowBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
