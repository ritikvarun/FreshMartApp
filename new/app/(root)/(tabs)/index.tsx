import React, { useState, useEffect, useRef } from "react";
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
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import { ENDPOINTS } from "../../../config/api";
import Footer from "../../../components/Footer";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40 - 12) / 2;
const BANNER_WIDTH = width - 40;

// 5 Promotional Slides for Auto-playing Carousel
const PROMO_SLIDES = [
  {
    id: "slide1",
    badge: "SUMMER DROP '26",
    title: "Urban Street",
    discount: "40%",
    offText: "OFF",
    btnText: "Shop Collection",
    categoryFilter: "Men",
    bgColor: "#F3F4F6",
    accentColor: "#111827",
    btnBg: "#111827",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
  },
  {
    id: "slide2",
    badge: "EXCLUSIVE DEALS",
    title: "Sneaker Fest",
    discount: "50%",
    offText: "OFF",
    btnText: "Grab Now",
    categoryFilter: "Shoes",
    bgColor: "#EEF2FF",
    accentColor: "#4F46E5",
    btnBg: "#4F46E5",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  },
  {
    id: "slide3",
    badge: "TRENDING NOW",
    title: "Floral Elegance",
    discount: "30%",
    offText: "OFF",
    btnText: "Explore Now",
    categoryFilter: "Women",
    bgColor: "#FFF1F2",
    accentColor: "#E11D48",
    btnBg: "#E11D48",
    imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
  },
  {
    id: "slide4",
    badge: "MINIMAL AESTHETICS",
    title: "Linen & Casuals",
    discount: "25%",
    offText: "OFF",
    btnText: "Discover",
    categoryFilter: "Men",
    bgColor: "#FEF3C7",
    accentColor: "#D97706",
    btnBg: "#D97706",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
  },
  {
    id: "slide5",
    badge: "PREMIUM ACCESSORIES",
    title: "Watches & Bags",
    discount: "35%",
    offText: "OFF",
    btnText: "View Deals",
    categoryFilter: "Accessories",
    bgColor: "#ECFDF5",
    accentColor: "#059669",
    btnBg: "#059669",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
  },
];

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
    _id: "p1",
    title: "Classic White Linen Shirt",
    category: "Men",
    price: "₹1,499",
    unit: "Sizes: S, M, L, XL",
    bgColor: "#FFFFFF",
    image1: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    isFavorite: true,
    rawProduct: {
      _id: "p1",
      name: "Classic White Linen Shirt",
      price: 1499,
      category: "Men",
      subCategory: "TopWear",
      sizes: ["S", "M", "L", "XL"],
    },
  },
  {
    id: "p2",
    _id: "p2",
    title: "Air Cushion Running Shoes",
    category: "Shoes",
    price: "₹2,499",
    unit: "Sizes: 7, 8, 9, 10",
    bgColor: "#FFFFFF",
    image1: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    isFavorite: false,
    rawProduct: {
      _id: "p2",
      name: "Air Cushion Running Shoes",
      price: 2499,
      category: "Shoes",
      subCategory: "Shoes",
      sizes: ["7", "8", "9", "10", "11"],
    },
  },
  {
    id: "p3",
    _id: "p3",
    title: "Floral Printed Summer Dress",
    category: "Women",
    price: "₹1,899",
    unit: "Sizes: S, M, L",
    bgColor: "#FFFFFF",
    image1: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
    isFavorite: false,
    rawProduct: {
      _id: "p3",
      name: "Floral Printed Summer Dress",
      price: 1899,
      category: "Women",
      subCategory: "TopWear",
      sizes: ["S", "M", "L"],
    },
  },
  {
    id: "p4",
    _id: "p4",
    title: "Urban Streetwear Graphic Hoodie",
    category: "Unisex",
    price: "₹1,999",
    unit: "Sizes: M, L, XXL",
    bgColor: "#FFFFFF",
    image1: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
    isFavorite: true,
    rawProduct: {
      _id: "p4",
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
  const { user, isAuthenticated, logout } = useAuth();
  const [menuDrawerVisible, setMenuDrawerVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<HomeProduct[]>(INITIAL_PRODUCTS);

  // Smooth Animations for Cart Badge & Floating Cart Bar
  const cartBadgeScale = useRef(new Animated.Value(1)).current;
  const prevCartCountRef = useRef(cartCount);
  const floatingCartAnim = useRef(new Animated.Value(cartCount > 0 ? 1 : 0)).current;

  useEffect(() => {
    if (cartCount > prevCartCountRef.current && cartCount > 0) {
      Animated.sequence([
        Animated.timing(cartBadgeScale, {
          toValue: 1.35,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(cartBadgeScale, {
          toValue: 1,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    if (cartCount > 0) {
      Animated.spring(floatingCartAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(floatingCartAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [cartCount]);

  // Auto-playing carousel state and refs
  const [promoSlides, setPromoSlides] = useState<any[]>(PROMO_SLIDES);
  const carouselRef = useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const activeSlideRef = useRef(0);
  activeSlideRef.current = activeSlide;

  // Fetch live banners from backend
  useEffect(() => {
    async function loadBanners() {
      try {
        const res = await fetch(ENDPOINTS.SETTINGS.GET_BANNERS);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPromoSlides(data);
          }
        }
      } catch (err) {
        console.warn("Backend banners fetch failed, using local defaults", err);
      }
    }
    loadBanners();
  }, []);

  // Auto-slide effect every 3.8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const slidesLen = promoSlides.length || 5;
      const nextIndex = (activeSlideRef.current + 1) % slidesLen;
      setActiveSlide(nextIndex);
      carouselRef.current?.scrollTo({
        x: nextIndex * BANNER_WIDTH,
        animated: true,
      });
    }, 3800);

    return () => clearInterval(timer);
  }, [promoSlides.length]);

  const handleCarouselScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / BANNER_WIDTH);
    if (index !== activeSlide && index >= 0 && index < promoSlides.length) {
      setActiveSlide(index);
    }
  };

  const scrollToSlide = (index: number) => {
    setActiveSlide(index);
    carouselRef.current?.scrollTo({
      x: index * BANNER_WIDTH,
      animated: true,
    });
  };

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

  // Filter & Sort State
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "newest">("featured");
  const [priceRange, setPriceRange] = useState<"all" | "under_1000" | "1000_2500" | "above_2500">("all");
  const [onlyBestsellers, setOnlyBestsellers] = useState(false);

  const isFilterActive =
    sortBy !== "featured" || priceRange !== "all" || onlyBestsellers;

  const resetFilters = () => {
    setSortBy("featured");
    setPriceRange("all");
    setOnlyBestsellers(false);
  };

  // Filter & Sort products by search, category, price range, and sort order
  const filteredProducts = products
    .filter((item) => {
      const matchesCategory =
        activeCategory === "All" ||
        item.category?.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const numPrice =
        typeof item.price === "number"
          ? item.price
          : parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0;

      let matchesPrice = true;
      if (priceRange === "under_1000") {
        matchesPrice = numPrice < 1000;
      } else if (priceRange === "1000_2500") {
        matchesPrice = numPrice >= 1000 && numPrice <= 2500;
      } else if (priceRange === "above_2500") {
        matchesPrice = numPrice > 2500;
      }

      const matchesBestseller = onlyBestsellers
        ? item.rawProduct?.bestseller || (item as any).bestseller
        : true;

      return matchesCategory && matchesSearch && matchesPrice && matchesBestseller;
    })
    .sort((a, b) => {
      const priceA =
        typeof a.price === "number"
          ? a.price
          : parseFloat(String(a.price).replace(/[^0-9.]/g, "")) || 0;
      const priceB =
        typeof b.price === "number"
          ? b.price
          : parseFloat(String(b.price).replace(/[^0-9.]/g, "")) || 0;

      if (sortBy === "price_asc") return priceA - priceB;
      if (sortBy === "price_desc") return priceB - priceA;
      return 0;
    });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerLeftGroup}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuDrawerVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="menu-outline" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Discover</Text>
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
                <Animated.View
                  style={[
                    styles.headerCartBadge,
                    { transform: [{ scale: cartBadgeScale }] },
                  ]}
                >
                  <Text style={styles.headerCartBadgeText}>{cartCount}</Text>
                </Animated.View>
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

          <TouchableOpacity
            style={[
              styles.filterButton,
              isFilterActive && styles.filterButtonActive,
            ]}
            onPress={() => setFilterModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={isFilterActive ? "#FFFFFF" : "#1A1D26"}
            />
            {isFilterActive && <View style={styles.filterActiveDot} />}
          </TouchableOpacity>
        </View>

        {/* 5-Slide Auto-Playing Promotional Carousel */}
        <View style={styles.carouselWrapper}>
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={BANNER_WIDTH}
            onMomentumScrollEnd={handleCarouselScroll}
            style={styles.carouselScrollView}
          >
            {promoSlides.map((slide, idx) => (
              <View
                key={slide.id || idx}
                style={[
                  styles.carouselSlide,
                  { backgroundColor: slide.bgColor || "#F3F4F6", width: BANNER_WIDTH },
                ]}
              >
                <View style={styles.slideLeft}>
                  <View
                    style={[
                      styles.slideBadgeContainer,
                      { backgroundColor: `${slide.accentColor || "#111827"}15` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.slideBadgeText,
                        { color: slide.accentColor || "#111827" },
                      ]}
                    >
                      {slide.badge}
                    </Text>
                  </View>

                  <Text style={styles.slideTitle}>{slide.title}</Text>
                  <Text
                    style={[styles.slideDiscount, { color: slide.accentColor || "#111827" }]}
                  >
                    {slide.discount}{" "}
                    <Text
                      style={[styles.slideOff, { color: slide.accentColor || "#111827" }]}
                    >
                      {slide.offText || "OFF"}
                    </Text>
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.slideButton,
                      { backgroundColor: slide.btnBg || "#111827" },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      if (slide.categoryFilter) {
                        setActiveCategory(slide.categoryFilter);
                      }
                    }}
                  >
                    <Text style={styles.slideButtonText}>{slide.btnText || "Shop Now"}</Text>
                    <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.slideImageContainer}>
                  <Image
                    source={{ uri: slide.imageUrl }}
                    style={styles.slideImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Pagination Indicators */}
          <View style={styles.paginationRow}>
            {promoSlides.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => scrollToSlide(idx)}
                activeOpacity={0.8}
                style={[
                  styles.paginationDot,
                  activeSlide === idx && styles.paginationDotActive,
                ]}
              />
            ))}
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
                <Ionicons
                  name={cat.icon || "grid-outline"}
                  size={16}
                  color={isSelected ? "#FFFFFF" : "#374151"}
                  style={styles.categoryIcon}
                />
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
          {filteredProducts.map((product) => {
            const prodId = product._id || product.id;
            return (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() =>
                  router.push({
                    pathname: "/(root)/product/[id]",
                    params: { id: prodId },
                  })
                }
                activeOpacity={0.88}
              >
                {/* Product Image on Top */}
                <View style={styles.productImageWrapper}>
                  {product.image1 ? (
                    <Image
                      source={{ uri: product.image1 }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      source={product.image}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  )}

                  {/* Floating Wishlist Heart */}
                  <TouchableOpacity
                    onPress={() => toggleFavorite(product.id)}
                    style={styles.cardHeartBtn}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={product.isFavorite ? "heart" : "heart-outline"}
                      size={16}
                      color={product.isFavorite ? "#E11D48" : "#374151"}
                    />
                  </TouchableOpacity>

                  {/* Category Pill Tag */}
                  {product.category && (
                    <View style={styles.cardCategoryBadge}>
                      <Text style={styles.cardCategoryBadgeText}>
                        {product.category.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Card Info Body */}
                <View style={styles.cardBody}>
                  <Text style={styles.productTitle} numberOfLines={1}>
                    {product.title?.replace("\n", " ")}
                  </Text>

                  <Text style={styles.productUnit} numberOfLines={1}>
                    {product.unit}
                  </Text>

                  {/* Card Bottom: Price and Quick Add */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.productPrice}>{product.price}</Text>

                    <TouchableOpacity
                      style={styles.addCartBtn}
                      onPress={() => handleAddToCartClick(product)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer Section */}
        <Footer />
      </ScrollView>

      {/* Floating Quick Cart Bar with Spring Slide Animation */}
      {cartCount > 0 && (
        <Animated.View
          style={[
            styles.floatingCartBar,
            {
              opacity: floatingCartAnim,
              transform: [
                {
                  translateY: floatingCartAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [60, 0],
                  }),
                },
                {
                  scale: floatingCartAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.92, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.floatingCartInner}
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
        </Animated.View>
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

      {/* Filter & Sort Bottom Sheet Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.filterModalOverlay}>
          <View style={styles.filterModalSheet}>
            {/* Modal Header */}
            <View style={styles.filterModalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="options-outline" size={20} color="#111827" />
                <Text style={styles.filterModalTitle}>Filter & Sort</Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                {isFilterActive && (
                  <TouchableOpacity onPress={resetFilters} activeOpacity={0.7}>
                    <Text style={styles.filterResetText}>Reset</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setFilterModalVisible(false)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* Sort By Section */}
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.filterChipsWrap}>
                {[
                  { id: "featured", label: "✨ Featured" },
                  { id: "price_asc", label: "💰 Price: Low to High" },
                  { id: "price_desc", label: "💎 Price: High to Low" },
                  { id: "newest", label: "🔥 Newest First" },
                ].map((s) => {
                  const isSel = sortBy === s.id;
                  return (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => setSortBy(s.id as any)}
                      style={[styles.filterOptionChip, isSel && styles.filterOptionChipActive]}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.filterOptionChipText,
                          isSel && styles.filterOptionChipTextActive,
                        ]}
                      >
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Price Range Section */}
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <View style={styles.filterChipsWrap}>
                {[
                  { id: "all", label: "All Prices" },
                  { id: "under_1000", label: "Under ₹1,000" },
                  { id: "1000_2500", label: "₹1,000 - ₹2,500" },
                  { id: "above_2500", label: "Above ₹2,500" },
                ].map((p) => {
                  const isSel = priceRange === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setPriceRange(p.id as any)}
                      style={[styles.filterOptionChip, isSel && styles.filterOptionChipActive]}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.filterOptionChipText,
                          isSel && styles.filterOptionChipTextActive,
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Bestseller Toggle */}
              <TouchableOpacity
                style={styles.filterToggleRow}
                onPress={() => setOnlyBestsellers(!onlyBestsellers)}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.filterToggleLabel}>Bestsellers Only</Text>
                  <Text style={styles.filterToggleSub}>Show only top-selling trending items</Text>
                </View>
                <View
                  style={[
                    styles.toggleSwitchTrack,
                    onlyBestsellers && styles.toggleSwitchTrackActive,
                  ]}
                >
                  <View
                    style={[
                      styles.toggleSwitchThumb,
                      onlyBestsellers && styles.toggleSwitchThumbActive,
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </ScrollView>

            {/* Apply Button */}
            <TouchableOpacity
              style={styles.filterApplyBtn}
              onPress={() => setFilterModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.filterApplyBtnText}>
                Apply ({filteredProducts.length} items)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Side Menu Drawer Modal */}
      <Modal
        visible={menuDrawerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuDrawerVisible(false)}
      >
        <View style={styles.drawerOverlay}>
          {/* Touch backdrop to close */}
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={() => setMenuDrawerVisible(false)}
          />

          {/* Drawer Content */}
          <View style={styles.drawerSheet}>
            <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
              {/* Drawer Top User Profile Card */}
              <View style={styles.drawerHeader}>
                <View style={styles.drawerUserRow}>
                  <View style={styles.drawerAvatar}>
                    <Text style={styles.drawerAvatarText}>
                      {(user?.name || "G")[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.drawerUserName} numberOfLines={1}>
                      {user?.name || "Welcome, Guest"}
                    </Text>
                    <Text style={styles.drawerUserEmail} numberOfLines={1}>
                      {user?.email || "Sign in for best deals"}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setMenuDrawerVisible(false)}
                  style={styles.drawerCloseBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.drawerScroll}>
                {/* Main Navigation Items */}
                <Text style={styles.drawerSectionHeading}>EXPLORE</Text>

                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    setActiveCategory("All");
                    setMenuDrawerVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.drawerItemIconBox}>
                    <Ionicons name="home-outline" size={19} color="#111827" />
                  </View>
                  <Text style={styles.drawerItemText}>Home & Discover</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    setMenuDrawerVisible(false);
                    router.push("/(root)/orders" as any);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.drawerItemIconBox}>
                    <Ionicons name="cube-outline" size={19} color="#111827" />
                  </View>
                  <Text style={styles.drawerItemText}>My Orders</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    setMenuDrawerVisible(false);
                    router.push("/(root)/(tabs)/saved" as any);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.drawerItemIconBox}>
                    <Ionicons name="heart-outline" size={19} color="#111827" />
                  </View>
                  <Text style={styles.drawerItemText}>Saved Wishlist</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    setMenuDrawerVisible(false);
                    router.push("/(root)/cart" as any);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.drawerItemIconBox}>
                    <Ionicons name="cart-outline" size={19} color="#111827" />
                  </View>
                  <Text style={styles.drawerItemText}>Shopping Cart</Text>
                  {cartCount > 0 && (
                    <View style={styles.drawerItemBadge}>
                      <Text style={styles.drawerItemBadgeText}>{cartCount}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    setMenuDrawerVisible(false);
                    router.push("/(root)/(tabs)/profile" as any);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.drawerItemIconBox}>
                    <Ionicons name="person-outline" size={19} color="#111827" />
                  </View>
                  <Text style={styles.drawerItemText}>My Account</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Categories Shortcut */}
                <Text style={[styles.drawerSectionHeading, { marginTop: 18 }]}>
                  SHOP BY CATEGORY
                </Text>

                {[
                  { name: "Men", icon: "shirt-outline", label: "Men's Collection" },
                  { name: "Women", icon: "rose-outline", label: "Women's Collection" },
                  { name: "Kids", icon: "happy-outline", label: "Kids & Teens" },
                  { name: "Shoes", icon: "footsteps-outline", label: "Sneakers & Shoes" },
                  { name: "Accessories", icon: "watch-outline", label: "Watches & Bags" },
                ].map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    style={styles.drawerItem}
                    onPress={() => {
                      setActiveCategory(cat.name);
                      setMenuDrawerVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.drawerItemIconBox}>
                      <Ionicons name={cat.icon as any} size={18} color="#4B5563" />
                    </View>
                    <Text style={styles.drawerCategoryText}>{cat.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Drawer Bottom Auth Action */}
              <View style={styles.drawerBottom}>
                {isAuthenticated ? (
                  <TouchableOpacity
                    style={styles.drawerSignOutBtn}
                    onPress={async () => {
                      setMenuDrawerVisible(false);
                      await logout();
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="log-out-outline" size={18} color="#DC2626" />
                    <Text style={styles.drawerSignOutText}>Sign Out</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.drawerSignInBtn}
                    onPress={() => {
                      setMenuDrawerVisible(false);
                      router.push("/(auth)/sign-in" as any);
                    }}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.drawerSignInText}>Sign In / Register</Text>
                  </TouchableOpacity>
                )}
              </View>
            </SafeAreaView>
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
  headerLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
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
  filterButtonActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  filterActiveDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#0F172A",
  },

  // 5-Slide Promotional Carousel
  carouselWrapper: {
    marginBottom: 20,
  },
  carouselScrollView: {
    borderRadius: 24,
    overflow: "hidden",
  },
  carouselSlide: {
    borderRadius: 24,
    paddingLeft: 18,
    paddingVertical: 15,
    paddingRight: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 160,
    overflow: "hidden",
  },
  slideLeft: {
    flex: 1.15,
    zIndex: 2,
    paddingRight: 8,
  },
  slideBadgeContainer: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 5,
  },
  slideBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  slideTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  slideDiscount: {
    fontSize: 21,
    fontWeight: "900",
    fontStyle: "italic",
    marginVertical: 3,
  },
  slideOff: {
    fontSize: 14,
    fontWeight: "700",
    fontStyle: "normal",
  },
  slideButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  slideButtonText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "700",
  },
  slideImageContainer: {
    flex: 0.95,
    height: 132,
    borderRadius: 18,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  slideImage: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
  },
  paginationDotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#111827",
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
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 24,
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: "#0F172A",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryChipInactive: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryIcon: {
    marginRight: 7,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "700",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  categoryTextInactive: {
    color: "#374151",
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
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productImageWrapper: {
    width: "100%",
    height: 165,
    backgroundColor: "#F9FAFB",
    position: "relative",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  cardHeartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardCategoryBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(17,24,39,0.75)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardCategoryBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: 10,
  },
  productTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 18,
  },
  productUnit: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  addCartBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  headerCartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#0F172A",
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
    backgroundColor: "#0F172A",
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
    overflow: "hidden",
  },
  floatingCartInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  floatingCartLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartBarBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1E293B",
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
    backgroundColor: "#1E293B",
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
    color: "#0F172A",
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
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
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
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  sizeModalConfirmText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Filter & Sort Modal
  filterModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  filterModalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 36,
  },
  filterModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  filterResetText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalCloseBtn: {
    padding: 4,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    marginTop: 10,
    marginBottom: 10,
  },
  filterChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  filterOptionChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  filterOptionChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  filterOptionChipText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#4B5563",
  },
  filterOptionChipTextActive: {
    color: "#FFFFFF",
  },
  filterToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginTop: 6,
    marginBottom: 16,
  },
  filterToggleLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  filterToggleSub: {
    fontSize: 11.5,
    color: "#6B7280",
    marginTop: 2,
  },
  toggleSwitchTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E5E7EB",
    padding: 2,
    justifyContent: "center",
  },
  toggleSwitchTrackActive: {
    backgroundColor: "#111827",
  },
  toggleSwitchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
  },
  toggleSwitchThumbActive: {
    alignSelf: "flex-end",
  },
  filterApplyBtn: {
    backgroundColor: "#111827",
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  filterApplyBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Side Menu Drawer Styles
  drawerOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  drawerBackdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  drawerSheet: {
    width: "80%",
    maxWidth: 320,
    height: "100%",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  drawerUserRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  drawerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  drawerAvatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  drawerUserName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  drawerUserEmail: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  drawerCloseBtn: {
    padding: 6,
  },
  drawerScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  drawerSectionHeading: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#9CA3AF",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 6,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 2,
  },
  drawerItemIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  drawerItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  drawerCategoryText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "600",
    color: "#4B5563",
  },
  drawerItemBadge: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  drawerItemBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  drawerBottom: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  drawerSignInBtn: {
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: 23,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  drawerSignInText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
  drawerSignOutBtn: {
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  drawerSignOutText: {
    color: "#DC2626",
    fontSize: 13.5,
    fontWeight: "700",
  },
});
