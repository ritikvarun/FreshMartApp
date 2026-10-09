import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  BackHandler,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useCart, ProductItem } from "../../../context/CartContext";
import { useSaved } from "../../../context/SavedContext";
import { ENDPOINTS, API_BASE_URL } from "../../../config/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = 16;
const GRID_GAP = 10;
const FOUR_COL_WIDTH = Math.floor(
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GRID_GAP * 3) / 4
);
const TWO_COL_WIDTH = Math.floor(
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - 12) / 2
);

export interface AdminCategory {
  id: string;
  name: string;
  image?: string;
  productIds?: string[];
}

export interface CategoryItem {
  id: string;
  key: string;
  title: string;
  image: any;
  bgColor?: string;
  productIds?: string[];
  isCustom?: boolean;
}

export default function CategoriesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const { addToCart, updateQuantity, cartItems, cartCount } = useCart();
  const { isSaved, toggleSave } = useSaved();

  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [backendProducts, setBackendProducts] = useState<any[]>([]);
  const [customCategories, setCustomCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch admin custom categories with multi-tier fallback
  const fetchCustomCategories = useCallback(async () => {
    try {
      let data: any = null;

      // Tier 1: Dedicated GET_CATEGORIES endpoint
      try {
        const res = await fetch(ENDPOINTS.SETTINGS.GET_CATEGORIES);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json)) {
            data = json;
          }
        }
      } catch (e) {
        // Continue to fallback
      }

      // Tier 2: General /api/setting endpoint
      if (!Array.isArray(data) || data.length === 0) {
        try {
          const settingRes = await fetch(ENDPOINTS.SETTINGS.GET_ALL);
          if (settingRes.ok) {
            const settingJson = await settingRes.json();
            if (Array.isArray(settingJson?.customCategories)) {
              data = settingJson.customCategories;
            }
          }
        } catch (e) {
          // Continue to local fallback
        }
      }

      // Tier 3: Local backend fallback if testing on localhost/dev
      if ((!Array.isArray(data) || data.length === 0) && !API_BASE_URL.includes("localhost")) {
        try {
          const localRes = await fetch("http://localhost:5000/api/setting/categories");
          if (localRes.ok) {
            const localJson = await localRes.json();
            if (Array.isArray(localJson)) {
              data = localJson;
            }
          }
        } catch (e) {}

        if (!Array.isArray(data) || data.length === 0) {
          try {
            const localSettingRes = await fetch("http://localhost:5000/api/setting");
            if (localSettingRes.ok) {
              const localSettingJson = await localSettingRes.json();
              if (Array.isArray(localSettingJson?.customCategories)) {
                data = localSettingJson.customCategories;
              }
            }
          } catch (e) {}
        }
      }

      if (Array.isArray(data)) {
        setCustomCategories(data);
      }
    } catch (err) {
      console.warn("Categories fetch custom categories error:", err);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Fetch all backend products for subpage product resolution
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      let data: any = null;

      try {
        const res = await fetch(ENDPOINTS.PRODUCTS.LIST);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json) && json.length > 0) {
            data = json;
          }
        }
      } catch (e) {}

      if ((!Array.isArray(data) || data.length === 0) && !API_BASE_URL.includes("localhost")) {
        try {
          const localRes = await fetch("http://localhost:5000/api/product/list");
          if (localRes.ok) {
            const localJson = await localRes.json();
            if (Array.isArray(localJson) && localJson.length > 0) {
              data = localJson;
            }
          }
        } catch (e) {}
      }

      if (Array.isArray(data) && data.length > 0) {
        setBackendProducts(data);
      }
    } catch (err) {
      console.warn("Categories fetch products error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch whenever user enters or focuses the Categories tab
  useFocusEffect(
    useCallback(() => {
      fetchCustomCategories();
      fetchProducts();
    }, [fetchCustomCategories, fetchProducts])
  );

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCustomCategories(), fetchProducts()]);
    setRefreshing(false);
  };

  // If navigated with category query param, open that admin category
  useEffect(() => {
    if (params.category && customCategories.length > 0) {
      const match = customCategories.find(
        (c) =>
          c.name.toLowerCase() === params.category?.toLowerCase() ||
          c.name.toLowerCase().includes(params.category?.toLowerCase() || "")
      );
      if (match) {
        setSelectedCategory({
          id: match.id,
          key: match.name,
          title: match.name,
          image:
            match.image && match.image.trim().length > 0
              ? { uri: match.image }
              : require("../../../assets/images/quick_categories/veg_fruits.png"),
          bgColor: "#FFFFFF",
          productIds: match.productIds || [],
          isCustom: true,
        });
      }
    }
  }, [params.category, customCategories]);

  // Handle hardware back button on Android
  useEffect(() => {
    const onBackPress = () => {
      if (selectedCategory) {
        setSelectedCategory(null);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => subscription.remove();
  }, [selectedCategory]);

  // Compute products for selected category: ONLY products assigned to this admin category
  const activeProducts = useMemo(() => {
    if (!selectedCategory) return [];

    const assignedIds = new Set(
      (selectedCategory.productIds || []).map((id: string) => String(id))
    );

    const matched = backendProducts
      .filter((p: any) => assignedIds.has(String(p._id || p.id)))
      .map((p: any) => ({
        _id: String(p._id || p.id),
        name: p.name,
        category: p.category,
        price: Number(p.price || 0),
        mrp: p.mrp ? Number(p.mrp) : Math.round(Number(p.price || 0) * 1.25),
        unit: p.sizes && p.sizes.length > 0 ? p.sizes[0] : (p.unit || "1 unit"),
        image1: p.image1 || (p.images && p.images[0]) || "",
        rawProduct: p,
      }));

    return matched;
  }, [selectedCategory, backendProducts]);

  const getItemQuantity = (productId: string) => {
    const item = cartItems.find((ci) => ci.productId === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product: any) => {
    const productItem: ProductItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      image1: product.image1,
      category: product.category,
      sizes: [product.unit || "1 unit"],
    };
    addToCart(productItem, product.unit || "1 unit");
  };

  // Render 4-column category card
  const renderCategoryCard = (item: CategoryItem) => {
    const imageSrc =
      item.image && typeof item.image === "object" && item.image.uri
        ? item.image
        : typeof item.image === "string"
        ? { uri: item.image }
        : item.image;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.gridItemContainer}
        activeOpacity={0.78}
        onPress={() => setSelectedCategory(item)}
      >
        <View style={styles.cardBox}>
          <Image
            source={imageSrc}
            style={styles.cardImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.itemLabel} numberOfLines={2}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Sub-Page: When a category is tapped, show only products assigned to that category ── */}
      {selectedCategory ? (
        <View style={styles.subPageContainer}>
          {/* Subpage Header with Back Arrow */}
          <View style={styles.subHeader}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setSelectedCategory(null)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>

            <View style={styles.subHeaderTitles}>
              <Text style={styles.subHeaderTitle} numberOfLines={1}>
                {selectedCategory.title.replace("\n", " ")}
              </Text>
              <Text style={styles.subHeaderCount}>
                {activeProducts.length} items available
              </Text>
            </View>

            <TouchableOpacity
              style={styles.cartBtn}
              onPress={() => router.push("/(root)/cart" as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="cart-outline" size={22} color="#0F172A" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Subpage Scroll Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.subScrollContent}
          >
            {/* Top Category Tag Banner */}
            <View style={styles.subBanner}>
              <View style={styles.subBannerTextCol}>
                <Text style={styles.subBannerTitle}>
                  {selectedCategory.title.replace("\n", " ")}
                </Text>
                <View style={styles.subBannerTimeRow}>
                  <Ionicons name="flash" size={12} color="#059669" />
                  <Text style={styles.subBannerTimeText}>
                    Delivery in 10 minutes
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.subBannerImageBox,
                  { backgroundColor: selectedCategory.bgColor || "#F1F5F9" },
                ]}
              >
                <Image
                  source={
                    selectedCategory.image &&
                    typeof selectedCategory.image === "object" &&
                    selectedCategory.image.uri
                      ? selectedCategory.image
                      : typeof selectedCategory.image === "string"
                      ? { uri: selectedCategory.image }
                      : selectedCategory.image
                  }
                  style={styles.subBannerImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color="#059669" size="small" />
                <Text style={styles.loadingText}>Loading fresh items...</Text>
              </View>
            ) : activeProducts.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="basket-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No items currently listed</Text>
                <Text style={styles.emptySub}>
                  Admin panel se is category mein products add karein.
                </Text>
              </View>
            ) : (
              /* 2-Column Product Grid */
              <View style={styles.twoColumnGrid}>
                {activeProducts.map((product) => {
                  const qty = getItemQuantity(product._id);
                  const isItemFav = isSaved(product._id);
                  const discount =
                    product.mrp && product.mrp > product.price
                      ? Math.round(
                          ((product.mrp - product.price) / product.mrp) * 100
                        )
                      : 0;

                  return (
                    <TouchableOpacity
                      key={product._id}
                      style={styles.twoColCard}
                      activeOpacity={0.88}
                      onPress={() =>
                        router.push({
                          pathname: "/(root)/product/[id]",
                          params: { id: product._id },
                        })
                      }
                    >
                      {/* Media Box */}
                      <View style={styles.twoColMediaBox}>
                        {discount > 0 && (
                          <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>
                              {discount}% OFF
                            </Text>
                          </View>
                        )}

                        <TouchableOpacity
                          style={styles.cardHeartBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            toggleSave(product.rawProduct || product);
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={isItemFav ? "heart" : "heart-outline"}
                            size={16}
                            color={isItemFav ? "#E11D48" : "#94A3B8"}
                          />
                        </TouchableOpacity>

                        <Image
                          source={{ uri: product.image1 }}
                          style={styles.twoColProductImage}
                          resizeMode="contain"
                        />
                      </View>

                      {/* Delivery Tag */}
                      <View style={styles.deliveryTagRow}>
                        <Ionicons name="flash" size={10} color="#059669" />
                        <Text style={styles.deliveryTagText}>10 MINS</Text>
                      </View>

                      {/* Product Title */}
                      <Text style={styles.twoColTitle} numberOfLines={2}>
                        {product.name}
                      </Text>

                      {/* Unit / Weight */}
                      <Text style={styles.twoColUnit}>{product.unit}</Text>

                      {/* Price & Add to Cart Counter */}
                      <View style={styles.twoColBottomRow}>
                        <View style={styles.priceCol}>
                          <Text style={styles.priceText}>₹{product.price}</Text>
                          {product.mrp && product.mrp > product.price ? (
                            <Text style={styles.mrpText}>₹{product.mrp}</Text>
                          ) : null}
                        </View>

                        {qty === 0 ? (
                          <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() => handleAddToCart(product)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.addBtnText}>ADD</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.qtyCounter}>
                            <TouchableOpacity
                              style={styles.qtyBtn}
                              onPress={() =>
                                updateQuantity(
                                  product._id,
                                  product.unit || "1 unit",
                                  qty - 1
                                )
                              }
                            >
                              <Ionicons
                                name="remove"
                                size={14}
                                color="#059669"
                              />
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{qty}</Text>
                            <TouchableOpacity
                              style={styles.qtyBtn}
                              onPress={() =>
                                updateQuantity(
                                  product._id,
                                  product.unit || "1 unit",
                                  qty + 1
                                )
                              }
                            >
                              <Ionicons name="add" size={14} color="#059669" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      ) : (
        /* ── Main View: ONLY Admin-Created Categories in 4-Column Grid ── */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.mainScrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#059669"]}
            />
          }
        >
          {/* Main Top Header */}
          <View style={styles.mainHeader}>
            <View>
              <Text style={styles.mainHeaderTitle}>All Categories</Text>
              <Text style={styles.mainHeaderSubtitle}>
                Explore fresh groceries delivered in minutes
              </Text>
            </View>

            <TouchableOpacity
              style={styles.cartBtn}
              onPress={() => router.push("/(root)/cart" as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="cart-outline" size={22} color="#0F172A" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Loading Indicator */}
          {loadingCategories && customCategories.length === 0 ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#059669" size="large" />
              <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
          ) : customCategories.length > 0 ? (
            /* ONLY Admin-Created Categories Displayed */
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>
                Categories ({customCategories.length})
              </Text>
              <View style={styles.gridRow}>
                {customCategories.map((cat, idx) => {
                  const imageSource =
                    cat.image && typeof cat.image === "string" && cat.image.trim().length > 0
                      ? { uri: cat.image }
                      : require("../../../assets/images/quick_categories/veg_fruits.png");

                  const catItem: CategoryItem = {
                    id: cat.id || `custom-${idx}`,
                    key: cat.name,
                    title: cat.name,
                    image: imageSource,
                    bgColor: "#FFFFFF",
                    productIds: cat.productIds || [],
                    isCustom: true,
                  };

                  return renderCategoryCard(catItem);
                })}
              </View>
            </View>
          ) : (
            /* Empty State if no categories in admin */
            <View style={styles.emptyBox}>
              <Ionicons name="grid-outline" size={54} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Categories Added</Text>
              <Text style={styles.emptySub}>
                Admin panel se categories add karein. Jo categories admin panel se banayi jayengi, sirf wahi yahan show hongi.
              </Text>
              <TouchableOpacity
                style={styles.refreshBtn}
                onPress={onRefresh}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={16} color="#FFFFFF" />
                <Text style={styles.refreshBtnText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
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
  /* Main Overview Page Styles */
  mainScrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
    paddingBottom: 100,
  },
  mainHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  mainHeaderTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  mainHeaderSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  cartBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#059669",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  sectionBlock: {
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: GRID_GAP,
    rowGap: 14,
  },
  gridItemContainer: {
    width: FOUR_COL_WIDTH,
    alignItems: "center",
  },
  cardBox: {
    width: FOUR_COL_WIDTH,
    height: Math.round(FOUR_COL_WIDTH * 0.98),
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardImage: {
    width: "82%",
    height: "82%",
  },
  itemLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "600",
    color: "#1E293B",
    textAlign: "center",
    lineHeight: 14,
    height: 28,
  },

  /* Subpage Product Grid Styles */
  subPageContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginLeft: -4,
  },
  subHeaderTitles: {
    flex: 1,
  },
  subHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  subHeaderCount: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
    marginTop: 1,
  },
  subScrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 14,
    paddingBottom: 100,
  },
  subBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  subBannerTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  subBannerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  subBannerTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  subBannerTimeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
    marginLeft: 4,
  },
  subBannerImageBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  subBannerImage: {
    width: 42,
    height: 42,
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 13,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 16,
    gap: 6,
  },
  refreshBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  /* 2-Column Grid */
  twoColumnGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  twoColCard: {
    width: TWO_COL_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 8,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  twoColMediaBox: {
    width: "100%",
    height: 110,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 8,
  },
  twoColProductImage: {
    width: "82%",
    height: "82%",
  },
  discountBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#2563EB",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    zIndex: 2,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
  },
  cardHeartBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    zIndex: 2,
  },
  deliveryTagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  deliveryTagText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#059669",
    marginLeft: 3,
    letterSpacing: 0.3,
  },
  twoColTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 17,
    minHeight: 34,
  },
  twoColUnit: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 2,
    marginBottom: 6,
  },
  twoColBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceCol: {
    flex: 1,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  mrpText: {
    fontSize: 10,
    color: "#94A3B8",
    textDecorationLine: "line-through",
    marginTop: 1,
  },
  addBtn: {
    borderWidth: 1.2,
    borderColor: "#059669",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addBtnText: {
    color: "#059669",
    fontSize: 11,
    fontWeight: "800",
  },
  qtyCounter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    padding: 3,
  },
  qtyText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    marginHorizontal: 6,
  },
});
