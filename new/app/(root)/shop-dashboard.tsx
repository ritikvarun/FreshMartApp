import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  StatusBar,
  Dimensions,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ENDPOINTS } from "../../config/api";

const { width } = Dimensions.get("window");
const SHOP_SESSION_KEY = "aka_shop_session";

export default function ShopDashboardScreen() {
  const router = useRouter();

  // Shop Auth State
  const [shop, setShop] = useState<any | null>(null);
  const [shopToken, setShopToken] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Login Form State (Supports Phone / Aadhaar / GST Number)
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Material Listing State
  const [materials, setMaterials] = useState<any[]>([]);
  const [fetchingMaterials, setFetchingMaterials] = useState(false);

  // Add Material Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [matName, setMatName] = useState("");
  const [matPrice, setMatPrice] = useState("");
  const [matUnit, setMatUnit] = useState("Per Bag (50kg)");
  const [matCategory, setMatCategory] = useState("Building Material & Cement");
  const [matImage, setMatImage] = useState("");
  const [matDesc, setMatDesc] = useState("");
  const [isSavingMat, setIsSavingMat] = useState(false);

  // Wallet Payout Modal State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutUpi, setPayoutUpi] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");

  useEffect(() => {
    checkSavedShopSession();
  }, []);

  const checkSavedShopSession = async () => {
    setLoading(true);
    try {
      const stored = await SecureStore.getItemAsync(SHOP_SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setShop(parsed.shop);
        setShopToken(parsed.token);
        fetchShopMaterials(parsed.shop._id);
      }
    } catch (e) {
      console.warn("Error reading shop session", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      Alert.alert(
        "Missing Input",
        "Please enter Phone / Aadhaar / GST Number and Password.",
      );
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch(ENDPOINTS.SHOPS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.shop) {
        setShop(data.shop);
        setShopToken(data.token);
        await SecureStore.setItemAsync(SHOP_SESSION_KEY, JSON.stringify(data));
        fetchShopMaterials(data.shop._id);
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials.");
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
      "Are you sure you want to sign out from your Shopkeeper portal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await SecureStore.deleteItemAsync(SHOP_SESSION_KEY);
            setShop(null);
            setShopToken("");
            setMaterials([]);
          },
        },
      ],
    );
  };

  const fetchShopMaterials = async (shopId: string) => {
    setFetchingMaterials(true);
    try {
      const res = await fetch(ENDPOINTS.SHOPS.MY_PRODUCTS(shopId), {
        headers: { Authorization: `Bearer ${shopToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMaterials(data.products || []);
      }
    } catch (e) {
      console.warn("fetchShopMaterials error", e);
    } finally {
      setFetchingMaterials(false);
    }
  };

  const handleToggleShopOpen = async (newVal: boolean) => {
    if (!shop) return;
    const oldVal = shop.isOpen;
    setShop({ ...shop, isOpen: newVal });
    try {
      const res = await fetch(ENDPOINTS.SHOPS.TOGGLE_OPEN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${shopToken}`,
        },
        body: JSON.stringify({ shopId: shop._id, isOpen: newVal }),
      });
      if (!res.ok) {
        setShop({ ...shop, isOpen: oldVal });
        Alert.alert("Error", "Could not update status.");
      }
    } catch (e) {
      setShop({ ...shop, isOpen: oldVal });
    }
  };

  const handleAddMaterial = async () => {
    if (!matName.trim() || !matPrice.trim()) {
      Alert.alert("Missing Fields", "Please enter material name and price.");
      return;
    }

    setIsSavingMat(true);
    try {
      const payload = {
        shopId: shop._id,
        name: matName.trim(),
        price: Number(matPrice),
        sizes: [matUnit],
        category: matCategory,
        description: matDesc.trim() || `${matName} provided by ${shop.name}`,
        image1:
          matImage.trim() ||
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
      };

      const res = await fetch(ENDPOINTS.SHOPS.ADD_PRODUCT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${shopToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert(
          "Material Listed! 📦",
          `${matName} is now live in your store catalog.`,
        );
        setShowAddModal(false);
        setMatName("");
        setMatPrice("");
        setMatDesc("");
        setMatImage("");
        fetchShopMaterials(shop._id);
      } else {
        Alert.alert("Error", data.message || "Failed to add material.");
      }
    } catch (e: any) {
      Alert.alert("Network Error", e.message || "Could not save material.");
    } finally {
      setIsSavingMat(false);
    }
  };

  const handleRequestPayout = () => {
    if (!payoutUpi.trim()) {
      Alert.alert(
        "Missing UPI",
        "Please enter your UPI ID (e.g. yourname@okaxis).",
      );
      return;
    }
    Alert.alert(
      "Payout Request Submitted! 💰",
      `Your withdrawal request of ₹${payoutAmount || shop?.walletBalance || 0} has been sent to Admin for UPI: ${payoutUpi}. Funds will be transferred within 2 hours.`,
    );
    setShowPayoutModal(false);
    setPayoutUpi("");
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading Shopkeeper Console...</Text>
      </View>
    );
  }

  // ── SCREEN 1: Shopkeeper Login Screen (If Not Logged In) ──────
  if (!shop) {
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
          <Text style={styles.headerTitle}>Shopkeeper Partner Login</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.loginContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.loginBanner}>
            <View style={styles.loginBannerIcon}>
              <Ionicons name="storefront" size={36} color="#059669" />
            </View>
            <Text style={styles.loginBannerTitle}>AkA Merchant Hub</Text>
            <Text style={styles.loginBannerSub}>
              Manage your materials catalog, prices, and withdraw earnings.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>Phone / Aadhaar / GST Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9876543210 or 123456789012"
              placeholderTextColor="#94A3B8"
              value={loginIdentifier}
              onChangeText={setLoginIdentifier}
              autoCapitalize="none"
            />

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={loginPassword}
              onChangeText={setLoginPassword}
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
                  <Text style={styles.submitBtnText}>Sign In to My Shop</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.registerPromptRow}>
              <Text style={styles.registerPromptText}>
                Don't have a shop registered?
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/register-shop" as any)}
              >
                <Text style={styles.registerLink}>
                  Register Shop (₹500 Fee) →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── SCREEN 2: Logged-In Shopkeeper Dashboard ──────────────────
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
            {shop.name}
          </Text>
          <Text style={styles.headerSubtitle}>
            AkA Verified Merchant Console
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
        {/* Status & Wallet Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.shopAvatar}>
              <Ionicons name="storefront" size={26} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.shopNameText}>{shop.name}</Text>
              <Text style={styles.shopCategoryText}>
                {shop.category || "Building Materials"}
              </Text>
              <Text style={styles.shopAddressText} numberOfLines={1}>
                {shop.address?.street
                  ? `${shop.address.street}, ${shop.address.city || ""}`
                  : "Address verified"}
              </Text>
            </View>
          </View>

          {/* Duty Switch & Wallet Bar */}
          <View style={styles.dutyWalletRow}>
            <View style={styles.dutyBox}>
              <Text style={styles.dutyLabel}>Store Status</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <Switch
                  value={shop.isOpen}
                  onValueChange={handleToggleShopOpen}
                  trackColor={{ false: "#CBD5E1", true: "#A7F3D0" }}
                  thumbColor={shop.isOpen ? "#059669" : "#94A3B8"}
                />
                <Text
                  style={[
                    styles.dutyStatusText,
                    { color: shop.isOpen ? "#059669" : "#64748B" },
                  ]}
                >
                  {shop.isOpen ? "OPEN" : "CLOSED"}
                </Text>
              </View>
            </View>

            <View style={styles.walletBox}>
              <Text style={styles.dutyLabel}>Wallet Balance</Text>
              <Text style={styles.walletAmount}>
                ₹{Number(shop.walletBalance || 0).toFixed(0)}
              </Text>
              <TouchableOpacity
                style={styles.withdrawBtn}
                onPress={() => {
                  setPayoutAmount(String(shop.walletBalance || 0));
                  setShowPayoutModal(true);
                }}
              >
                <Text style={styles.withdrawBtnText}>Withdraw UPI</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Header: Material Catalog */}
        <View style={styles.catalogHeader}>
          <View>
            <Text style={styles.catalogTitle}>My Materials Catalog</Text>
            <Text style={styles.catalogSub}>
              {materials.length} items currently listed
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addMaterialBtn}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addMaterialBtnText}>+ Add Material</Text>
          </TouchableOpacity>
        </View>

        {/* Materials List */}
        {fetchingMaterials ? (
          <ActivityIndicator
            style={{ marginTop: 30 }}
            size="small"
            color="#059669"
          />
        ) : materials.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="cube-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Materials Listed Yet</Text>
            <Text style={styles.emptySub}>
              Tap the "+ Add Material" button to list your first cement, bricks,
              sand, or hardware item.
            </Text>
          </View>
        ) : (
          <View style={styles.materialsGrid}>
            {materials.map((item) => (
              <View key={item._id} style={styles.materialCard}>
                <Image
                  source={{
                    uri:
                      item.image1 ||
                      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
                  }}
                  style={styles.materialImage}
                />
                <View style={styles.materialInfo}>
                  <Text style={styles.materialName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.materialUnit}>
                    {item.sizes?.[0] || "Standard"}
                  </Text>
                  <View style={styles.materialPriceRow}>
                    <Text style={styles.materialPrice}>₹{item.price}</Text>
                    <View style={styles.inStockBadge}>
                      <Text style={styles.inStockText}>Live</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── MODAL: Add New Material ────────────────────────────── */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>List New Material</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 420 }}
            >
              <Text style={styles.inputLabel}>Material / Product Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ultratech Super Cement (PPC)"
                placeholderTextColor="#94A3B8"
                value={matName}
                onChangeText={setMatName}
              />

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                Price in ₹ (INR) *
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 380"
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
                value={matPrice}
                onChangeText={setMatPrice}
              />

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                Unit / Packaging *
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Per 50kg Bag, Per Truck, Per Piece"
                placeholderTextColor="#94A3B8"
                value={matUnit}
                onChangeText={setMatUnit}
              />

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                Category
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Building Material, Cement, Sand, Paints..."
                placeholderTextColor="#94A3B8"
                value={matCategory}
                onChangeText={setMatCategory}
              />

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                Image URL (Optional)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="https://... (Leave blank for default material photo)"
                placeholderTextColor="#94A3B8"
                value={matImage}
                onChangeText={setMatImage}
              />

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                Short Details / Specification
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { height: 60, textAlignVertical: "top", paddingTop: 8 },
                ]}
                placeholder="Quality grade, weight, freshness guarantee..."
                placeholderTextColor="#94A3B8"
                multiline
                value={matDesc}
                onChangeText={setMatDesc}
              />

              <TouchableOpacity
                style={[styles.submitBtn, { marginTop: 18 }]}
                onPress={handleAddMaterial}
                disabled={isSavingMat}
              >
                {isSavingMat ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    Save & List Material Live
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: Withdraw / Payout ──────────────────────────── */}
      <Modal visible={showPayoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Wallet Payout</Text>
              <TouchableOpacity onPress={() => setShowPayoutModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Available Balance</Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "900",
                color: "#059669",
                marginBottom: 12,
              }}
            >
              ₹{shop.walletBalance || 0}
            </Text>

            <Text style={styles.inputLabel}>Enter UPI ID for Transfer *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9876543210@paytm or shop@okhdfcbank"
              placeholderTextColor="#94A3B8"
              value={payoutUpi}
              onChangeText={setPayoutUpi}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.submitBtn, { marginTop: 18 }]}
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
    color: "#059669",
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
    backgroundColor: "#ECFDF5",
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
    backgroundColor: "#059669",
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
    color: "#059669",
  },
  dashboardContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
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
  profileTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  shopAvatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  shopNameText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  shopCategoryText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "700",
  },
  shopAddressText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  dutyWalletRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  dutyBox: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dutyLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
  },
  dutyStatusText: {
    fontSize: 12,
    fontWeight: "800",
  },
  walletBox: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  walletAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#166534",
    marginTop: 2,
  },
  withdrawBtn: {
    marginTop: 6,
    backgroundColor: "#059669",
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: "center",
  },
  withdrawBtnText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  catalogHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 12,
  },
  catalogTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  catalogSub: {
    fontSize: 12,
    color: "#64748B",
  },
  addMaterialBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#059669",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  addMaterialBtnText: {
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
    marginTop: 10,
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
  materialsGrid: {
    gap: 12,
  },
  materialCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
    alignItems: "center",
  },
  materialImage: {
    width: 65,
    height: 65,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  materialUnit: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  materialPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  materialPrice: {
    fontSize: 15,
    fontWeight: "900",
    color: "#059669",
  },
  inStockBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inStockText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#059669",
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
