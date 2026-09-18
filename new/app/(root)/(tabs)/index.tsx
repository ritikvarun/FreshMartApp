import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import { ENDPOINTS } from "../../../config/api";
import Footer from "../../../components/Footer";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48 - 14) / 2;

// Asset references
const avatarImg = require("../../../assets/images/avatar_romina.jpg");
const bannerBasketImg = require("../../../assets/images/banner_basket.jpg");

// E-Commerce Categories
const CATEGORIES = [
  { id: "all", name: "All", icon: "grid-outline" },
  { id: "men", name: "Men", icon: "shirt-outline" },
  { id: "women", name: "Women", icon: "rose-outline" },
  { id: "kids", name: "Kids", icon: "happy-outline" },
  { id: "shoes", name: "Shoes", icon: "footsteps-outline" },
  { id: "accessories", name: "Accessories", icon: "watch-outline" },
];

interface HomeProduct {
  id: string;
  _id?: string;
  title: string;
  category: string;
  price: string | number;
  unit: string;
  bgColor: string;
  image?: any;
  image1?: string;
  isFavorite: boolean;
  rawProduct?: any;
}

// Initial E-Commerce catalog
const INITIAL_PRODUCTS: HomeProduct[] = [
  {
    id: "p1",
    title: "Classic White\nLinen Shirt",
    category: "Men",
    price: "₹1,499",
    unit: "Sizes: S, M, L, XL",
    bgColor: "#F3F4F6",
    image1: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    isFavorite: true,
    rawProduct: {
      name: "Classic White Linen Shirt",
      price: 1499,
      category: "Men",
      subCategory: "TopWear",
      sizes: ["S", "M", "L", "XL"],
    },
  },
  {
    id: "p2",
    title: "Air Cushion\nRunning Shoes",
    category: "Shoes",
    price: "₹2,499",
    unit: "Sizes: 7, 8, 9, 10",
    bgColor: "#EEF2FF",
    image1: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    isFavorite: false,
    rawProduct: {
      name: "Air Cushion Running Shoes",
      price: 2499,
      category: "Shoes",
      subCategory: "Shoes",
      sizes: ["7", "8", "9", "10", "11"],
    },
  },
  {
    id: "p3",
    title: "Floral Printed\nSummer Dress",
    category: "Women",
    price: "₹1,899",
    unit: "Sizes: S, M, L",
    bgColor: "#FFF1F2",
    image1: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
    isFavorite: false,
    rawProduct: {
      name: "Floral Printed Summer Dress",
      price: 1899,
      category: "Women",
      subCategory: "TopWear",
      sizes: ["S", "M", "L"],
    },
  },
  {
    id: "p4",
    title: "Urban Streetwear\nGraphic Hoodie",
    category: "Unisex",
    price: "₹1,999",
    unit: "Sizes: M, L, XXL",
    bgColor: "#F9FAFB",
    image1: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
    isFavorite: true,
    rawProduct: {
      name: "Urban Streetwear Graphic Hoodie",
      price: 1999,
      category: "Unisex",
      subCategory: "WinterWear",
      sizes: ["M", "L", "XL", "XXL"],
    },
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { addToCart, cartCount, grandTotal } = useCart();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<HomeProduct[]>(INITIAL_PRODUCTS);

  // Size Selector Modal State
  const [sizeModalProduct, setSizeModalProduct] = useState<any | null>(null);
  const [selectedModalSize, setSelectedModalSize] = useState<string>("");

  // Load products from backend on mount
  useEffect(() => {
    async function loadBackendProducts() {
      try {
        const res = await fetch(ENDPOINTS.PRODUCTS.LIST);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((p: any) => ({
              id: p._id,
              _id: p._id,
              title: p.name,
              category: p.category,
              price: `₹${Number(p.price || 0)}`,
              unit: p.sizes && p.sizes.length > 0 ? `Sizes: ${p.sizes.join(", ")}` : "Standard",
              bgColor: "#F9FAFB",
              image1: p.image1,
              isFavorite: false,
              rawProduct: p,
            }));
            setProducts(mapped);
          }
        }
      } catch (err) {
        console.warn("Backend products fetch failed, using local defaults", err);
      }
    }
    loadBackendProducts();
  }, []);

  const handleAddToCartClick = (product: any) => {
    const rawSizes = product.rawProduct?.sizes || (Array.isArray(product.sizes) ? product.sizes : []);
    if (rawSizes && rawSizes.length > 1) {
      setSizeModalProduct(product);
      setSelectedModalSize(rawSizes[0]);
    } else {
      executeAddToCart(product, rawSizes[0] || "Standard");
    }
  };

  const executeAddToCart = (product: any, sizeToUse: string) => {
    const rawPrice =
      typeof product.price === "number"
        ? product.price
        : parseFloat(String(product.price).replace(/[^0-9.]/g, "")) || 999;

    addToCart(
      {
        _id: product._id || product.id,
        name: product.name || product.title?.replace("\n", " ") || "Product",
        price: rawPrice,
        image1:
          product.image1 ||
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
        category: product.category || "General",
        sizes: product.rawProduct?.sizes || [sizeToUse],
      },
      sizeToUse
    );
  };

  // Toggle favorite on card
  const toggleFavorite = (id: string) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  // Filter products by search & category
  const filteredProducts = products.filter((item) => {
    const matchesCategory =
      activeCategory === "All" ||
      item.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const greetingName = user?.name ? user.name.split(" ")[0] : "Romina";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Image source={avatarImg} style={styles.avatar} />
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingTitle}>Morning, {greetingName}</Text>
              <Text style={styles.greetingSubtitle}>
                What would you buy today?
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {/* Cart Icon Button with dynamic badge */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push("/(root)/cart" as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="cart-outline" size={22} color="#1A1D26" />
              {cartCount > 0 && (
                <View style={styles.headerCartBadge}>
                  <Text style={styles.headerCartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={20} color="#1A1D26" />
            </TouchableOpacity>
          </View>
        </View>


        {/* Search & Filter Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search-outline"
              size={19}
              color="#9AA0B0"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search..."
              placeholderTextColor="#9AA0B0"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>

          <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={20} color="#1A1D26" />
          </TouchableOpacity>
        </View>

        {/* Special Offer Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerBadge}>ENJOY THE SPECIAL</Text>
            <Text style={styles.bannerTitle}>Offer Up to</Text>
            <Text style={styles.bannerDiscount}>
              20% <Text style={styles.bannerOff}>off</Text>
            </Text>

            <TouchableOpacity style={styles.shopNowButton} activeOpacity={0.85}>
              <Text style={styles.shopNowText}>Shop Now</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bannerImageContainer}>
            <Image
              source={bannerBasketImg}
              style={styles.bannerImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat: any) => {
            const isSelected = activeCategory === cat.name;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  isSelected
                    ? styles.categoryChipActive
                    : styles.categoryChipInactive,
                ]}
                onPress={() => setActiveCategory(cat.name)}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryIconCircle, isSelected && { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                  <Ionicons
                    name={cat.icon || "grid-outline"}
                    size={16}
                    color={isSelected ? "#FFFFFF" : "#1A1D26"}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryText,
                    isSelected
                      ? styles.categoryTextActive
                      : styles.categoryTextInactive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured Products Section */}
        <View style={styles.productsHeaderRow}>
          <Text style={styles.sectionTitle}>Curated Collection</Text>
          <TouchableOpacity activeOpacity={0.6}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Product Cards Grid */}
        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <View
              key={product.id}
              style={[styles.productCard, { backgroundColor: product.bgColor }]}
            >
              {/* Card Top: Title and Favorite Button */}
              <View style={styles.cardHeader}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {product.title}
                </Text>

                <TouchableOpacity
                  onPress={() => toggleFavorite(product.id)}
                  style={styles.favoriteButton}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={product.isFavorite ? "heart" : "heart-outline"}
                    size={18}
                    color={product.isFavorite ? "#E05315" : "#A6ACB8"}
                  />
                </TouchableOpacity>
              </View>

              {/* Product Image */}
              <View style={styles.productImageWrapper}>
                {product.image1 ? (
                  <Image
                    source={{ uri: product.image1 }}
                    style={styles.productImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Image
                    source={product.image}
                    style={styles.productImage}
                    resizeMode="contain"
                  />
                )}
              </View>

              {/* Card Bottom: Price and Quick Add */}
              <View style={styles.cardFooter}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productPrice}>
                    {product.price}
                  </Text>
                  <Text style={styles.productUnit} numberOfLines={1}>
                    {product.unit}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.addCartBtn}
                  onPress={() => handleAddToCartClick(product)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Footer Section */}
        <Footer />
      </ScrollView>

      {/* Floating Quick Cart Bar */}
      {cartCount > 0 && (
        <TouchableOpacity
          style={styles.floatingCartBar}
          onPress={() => router.push("/(root)/cart" as any)}
          activeOpacity={0.9}
        >
          <View style={styles.floatingCartLeft}>
            <View style={styles.cartBarBadge}>
              <Text style={styles.cartBarBadgeText}>{cartCount}</Text>
            </View>
            <View>
              <Text style={styles.cartBarTitle}>Items in Cart</Text>
              <Text style={styles.cartBarPrice}>₹{grandTotal.toFixed(0)}</Text>
            </View>
          </View>

          <View style={styles.floatingCartRight}>
            <Text style={styles.viewCartText}>View Cart</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
          </View>
        </TouchableOpacity>
      )}

      {/* Size Selection Sheet / Modal */}
      {sizeModalProduct && (
        <Modal
          visible={!!sizeModalProduct}
          transparent
          animationType="fade"
          onRequestClose={() => setSizeModalProduct(null)}
        >
          <View style={styles.sizeModalOverlay}>
            <View style={styles.sizeModalSheet}>
              {/* Modal Top Header */}
              <View style={styles.sizeModalHeader}>
                <Image
                  source={{
                    uri:
                      sizeModalProduct.image1 ||
                      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
                  }}
                  style={styles.sizeModalThumb}
                />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.sizeModalTitle} numberOfLines={1}>
                    {sizeModalProduct.title?.replace("\n", " ")}
                  </Text>
                  <Text style={styles.sizeModalPrice}>
                    {sizeModalProduct.price}
                  </Text>
                  <Text style={styles.sizeModalCategory}>
                    Category: {sizeModalProduct.category || "General"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSizeModalProduct(null)}
                  style={styles.sizeModalCloseBtn}
                >
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Size Selector Heading */}
              <Text style={styles.sizeModalSubtitle}>
                {sizeModalProduct.category?.toLowerCase() === "shoes" ||
                sizeModalProduct.rawProduct?.subCategory?.toLowerCase() === "shoes"
                  ? "👟 Select Shoe Size:"
                  : "👕 Select Apparel Size:"}
              </Text>

              {/* Sizes Row */}
              <View style={styles.sizeModalChipsRow}>
                {(sizeModalProduct.rawProduct?.sizes || ["Std"]).map((sz: string) => {
                  const isSel = selectedModalSize === sz;
                  return (
                    <TouchableOpacity
                      key={sz}
                      style={[
                        styles.sizeModalChip,
                        isSel && styles.sizeModalChipActive,
                      ]}
                      onPress={() => setSelectedModalSize(sz)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.sizeModalChipText,
                          isSel && styles.sizeModalChipTextActive,
                        ]}
                      >
                        {sz}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Add to Cart Confirm Action */}
              <TouchableOpacity
                style={styles.sizeModalConfirmBtn}
                onPress={() => {
                  executeAddToCart(sizeModalProduct, selectedModalSize);
                  setSizeModalProduct(null);
                }}
                activeOpacity={0.88}
              >
                <Ionicons name="cart" size={18} color="#FFFFFF" />
                <Text style={styles.sizeModalConfirmText}>
                  Add to Cart {selectedModalSize ? `(Size: ${selectedModalSize})` : ""}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 110, // Space for floating bottom nav bar
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E2E8F0",
  },
  greetingContainer: {
    marginLeft: 12,
  },
  greetingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1D26",
    letterSpacing: -0.2,
  },
  greetingSubtitle: {
    fontSize: 12,
    color: "#8B92A2",
    marginTop: 2,
    fontWeight: "400",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  // Search Row
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1A1D26",
    paddingVertical: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },

  // Special Offer Banner
  bannerCard: {
    backgroundColor: "#FCE7DB",
    borderRadius: 24,
    paddingLeft: 18,
    paddingVertical: 14,
    paddingRight: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
    marginBottom: 22,
    minHeight: 160,
  },
  bannerLeft: {
    flex: 1.1,
    zIndex: 2,
    paddingRight: 6,
  },
  bannerBadge: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#7A685D",
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F222B",
    lineHeight: 25,
  },
  bannerDiscount: {
    fontSize: 22,
    fontWeight: "700",
    fontStyle: "italic",
    color: "#E05315",
    marginBottom: 12,
  },
  bannerOff: {
    fontSize: 16,
    fontStyle: "normal",
    color: "#E05315",
    fontWeight: "600",
  },
  shopNowButton: {
    backgroundColor: "#E05315",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignSelf: "flex-start",
    shadowColor: "#E05315",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  shopNowText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  bannerImageContainer: {
    flex: 0.95,
    height: 135,
    borderRadius: 18,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },

  // Section Headers
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1D26",
  },

  // Categories
  categoriesScroll: {
    paddingRight: 10,
    marginBottom: 24,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 24,
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: "#E05315",
  },
  categoryChipInactive: {
    backgroundColor: "#F8F8FA",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  categoryIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: "hidden",
    marginRight: 8,
    backgroundColor: "#FFFFFF",
  },
  categoryThumb: {
    width: "100%",
    height: "100%",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  categoryTextInactive: {
    color: "#2C313C",
  },

  // Products Header Row
  productsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#8B92A2",
  },

  // Products Grid
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: CARD_WIDTH,
    borderRadius: 22,
    padding: 12,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1D26",
    lineHeight: 17,
    flex: 1,
    paddingRight: 4,
  },
  favoriteButton: {
    padding: 2,
  },
  productImageWrapper: {
    width: "100%",
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  productImage: {
    width: "90%",
    height: "90%",
    borderRadius: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1A1D26",
  },
  productUnit: {
    fontSize: 11,
    fontWeight: "400",
    color: "#8B92A2",
  },
  addCartBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E05315",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E05315",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  headerCartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#E05315",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  headerCartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  floatingCartBar: {
    position: "absolute",
    bottom: 84,
    left: 20,
    right: 20,
    backgroundColor: "#1A1D26",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
  },
  floatingCartLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartBarBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E05315",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cartBarBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  cartBarTitle: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  cartBarPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  floatingCartRight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E05315",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  viewCartText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // Size Selection Modal
  sizeModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end",
  },
  sizeModalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  sizeModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  sizeModalThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  sizeModalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  sizeModalPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#E05315",
  },
  sizeModalCategory: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },
  sizeModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  sizeModalSubtitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  sizeModalChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  sizeModalChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    minWidth: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  sizeModalChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  sizeModalChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
  },
  sizeModalChipTextActive: {
    color: "#FFFFFF",
  },
  sizeModalConfirmBtn: {
    backgroundColor: "#E05315",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#E05315",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sizeModalConfirmText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});

