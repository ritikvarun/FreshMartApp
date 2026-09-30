import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  Alert,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ENDPOINTS } from "../../../config/api";
import { useCart, ProductItem } from "../../../context/CartContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export default function ShopDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart } = useCart();

  const [shop, setShop] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedToast, setAddedToast] = useState("");

  useEffect(() => {
    if (id) {
      fetchShopData();
    }
  }, [id]);

  const fetchShopData = async () => {
    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.SHOPS.DETAIL(id!));
      if (res.ok) {
        const data = await res.json();
        setShop(data.shop);
        setProducts(data.products || []);
      }
    } catch (err) {
      console.warn("Error loading shop detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (!shop?.phone) return;
    const cleanNumber = shop.phone.replace(/[^0-9+]/g, "");
    Linking.openURL(`tel:${cleanNumber}`);
  };

  const handleWhatsApp = (productName?: string) => {
    if (!shop?.phone) return;
    const cleanNumber = shop.phone.replace(/[^0-9]/g, "");
    const formatted = cleanNumber.startsWith("91") ? cleanNumber : `91${cleanNumber}`;
    const itemMsg = productName ? `regarding "${productName}"` : "regarding your materials list";
    const text = encodeURIComponent(
      `Namaste ${shop.name}! I am contacting you from FreshMart app ${itemMsg}. Can you please provide price and stock availability?`
    );
    const url = `whatsapp://send?phone=${formatted}&text=${text}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(`https://wa.me/${formatted}?text=${text}`);
        }
      })
      .catch(() => {
        Alert.alert("Notice", "WhatsApp is not available.");
      });
  };

  const handleAddToCart = async (item: any) => {
    const p: ProductItem = {
      _id: item._id || item.id,
      name: item.name,
      price: Number(item.price || 0),
      image1: item.image1 || item.image || "",
      category: item.category || shop?.category || "General",
      subCategory: item.subCategory,
      sizes: item.sizes || ["Standard"],
      bestseller: item.bestseller,
    };
    await addToCart(p, item.sizes?.[0] || "Standard");
    setAddedToast(`Added ${item.name} to cart`);
    setTimeout(() => setAddedToast(""), 2000);
  };

  const handleInstantBuy = async (item: any) => {
    await handleAddToCart(item);
    router.push("/(root)/checkout" as any);
  };

  const renderProductCard = ({ item }: { item: any }) => {
    const imgUri =
      item.image1 ||
      item.image ||
      "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=500&auto=format&fit=crop&q=80";

    return (
      <View style={styles.productCard}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push(`/(root)/product/${item._id}` as any)}
        >
          <Image source={{ uri: imgUri }} style={styles.productImg} resizeMode="cover" />
          <View style={styles.productInfo}>
            <Text style={styles.categorySubText} numberOfLines={1}>
              {item.category?.toUpperCase() || "MATERIAL"}
            </Text>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.productPrice}>₹{item.price}</Text>
              {item.sizes && item.sizes.length > 0 && (
                <Text style={styles.sizeBadge}>{item.sizes[0]}</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Buttons: Add to Cart (Multi) & Instant Buy (Single) */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.addCartBtn}
            onPress={() => handleAddToCart(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={14} color="#059669" />
            <Text style={styles.addCartBtnText}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buyNowBtn}
            onPress={() => handleInstantBuy(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={13} color="#FFFFFF" />
            <Text style={styles.buyNowBtnText}>Buy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.inquireIconBtn}
            onPress={() => handleWhatsApp(item.name)}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-whatsapp" size={15} color="#16A34A" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.topBarBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {shop?.name || "Shop Materials"}
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(root)/cart" as any)}
          style={styles.topBarBtn}
        >
          <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Loading store catalog & materials...</Text>
        </View>
      ) : !shop ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Shop details not found.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContainer}
          renderItem={renderProductCard}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.shopHeaderCard}>
              <Image
                source={{
                  uri:
                    shop.image ||
                    "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80",
                }}
                style={styles.shopBanner}
                resizeMode="cover"
              />

              <View style={styles.shopInfoCard}>
                <View style={styles.headerBadgeRow}>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryPillText}>{shop.category || "Supplier"}</Text>
                  </View>
                  <View style={styles.verifiedPill}>
                    <Ionicons name="shield-checkmark" size={13} color="#059669" />
                    <Text style={styles.verifiedPillText}>GST / Aadhaar Verified</Text>
                  </View>
                </View>

                <Text style={styles.shopTitle}>{shop.name}</Text>
                <Text style={styles.ownerSubtitle}>Proprietor: {shop.ownerName || "Merchant"}</Text>

                <View style={styles.addressLine}>
                  <Ionicons name="location" size={15} color="#EF4444" style={{ marginRight: 4 }} />
                  <Text style={styles.addressString}>
                    {[
                      shop.address?.street,
                      shop.address?.landmark,
                      shop.address?.city,
                      shop.address?.pinCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                </View>

                {/* Direct Contact & Inquiry Row */}
                <View style={styles.contactRow}>
                  <TouchableOpacity
                    style={styles.headerCallBtn}
                    onPress={handleCall}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={16} color="#FFFFFF" />
                    <Text style={styles.headerCallBtnText}>Call: {shop.phone}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.headerWhatsAppBtn}
                    onPress={() => handleWhatsApp()}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-whatsapp" size={17} color="#FFFFFF" />
                    <Text style={styles.headerWhatsAppBtnText}>Inquiry on WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Material Order Mode Explanation Banner */}
              <View style={styles.modeNoticeCard}>
                <View style={styles.modeNoticeItem}>
                  <Ionicons name="flash" size={16} color="#F59E0B" />
                  <Text style={styles.modeNoticeText}>
                    <Text style={{ fontWeight: "700" }}>Single Item:</Text> Click "Buy" for fast direct booking
                  </Text>
                </View>
                <View style={styles.modeNoticeItem}>
                  <Ionicons name="cart" size={16} color="#059669" />
                  <Text style={styles.modeNoticeText}>
                    <Text style={{ fontWeight: "700" }}>Multi-Material:</Text> Click "Add" to consolidate cart
                  </Text>
                </View>
              </View>

              <Text style={styles.catalogHeading}>
                Available Materials & Stock ({products.length})
              </Text>
            </View>
          }
        />
      )}

      {/* Added Toast */}
      {addedToast ? (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.toastText}>{addedToast}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topBarBtn: {
    padding: 4,
  },
  topBarTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    maxWidth: SCREEN_WIDTH - 120,
  },
  shopHeaderCard: {
    marginBottom: 16,
  },
  shopBanner: {
    width: "100%",
    height: 180,
  },
  shopInfoCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryPill: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  verifiedPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
  },
  shopTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
  },
  ownerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  addressLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },
  addressString: {
    fontSize: 12,
    color: "#4B5563",
    flex: 1,
    lineHeight: 16,
  },
  contactRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  headerCallBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  headerCallBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  headerWhatsAppBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16A34A",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  headerWhatsAppBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  modeNoticeCard: {
    backgroundColor: "#EFF6FF",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    gap: 6,
  },
  modeNoticeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modeNoticeText: {
    fontSize: 12,
    color: "#1E40AF",
  },
  catalogHeading: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
  },
  listContainer: {
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  productImg: {
    width: "100%",
    height: 120,
  },
  productInfo: {
    padding: 10,
  },
  categorySubText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
  },
  productName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginTop: 2,
    height: 36,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#059669",
  },
  sizeBadge: {
    fontSize: 10,
    color: "#4B5563",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 6,
  },
  addCartBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECFDF5",
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    gap: 3,
  },
  addCartBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  buyNowBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    paddingVertical: 6,
    borderRadius: 6,
    gap: 3,
  },
  buyNowBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  inquireIconBtn: {
    padding: 6,
    backgroundColor: "#DCFCE7",
    borderRadius: 6,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#6B7280",
  },
  toast: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    backgroundColor: "rgba(17, 24, 39, 0.9)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
