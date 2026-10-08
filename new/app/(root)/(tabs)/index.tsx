import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { useSaved } from "../../../context/SavedContext";
import { ENDPOINTS } from "../../../config/api";
import Footer from "../../../components/Footer";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40 - 12) / 2;
const CARD_WIDTH_3COL = Math.floor((width - 24 - 16) / 3);
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
    imageUrl:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
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
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
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
    imageUrl:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
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
    imageUrl:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
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
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
  },
];

// Category keyword mapping for Quick Grocery Section
const GROCERY_CATEGORY_MAP: Record<string, string[]> = {
  "Vegetables &\nFruits": ["fruit", "fresh", "veg", "banana", "apple"],
  "Atta, Rice &\nDal": ["atta", "rice", "dal", "grain", "flour"],
  "Oil, Ghee &\nMasala": ["oil", "oils", "ghee", "masala", "honey"],
  "Dairy, Bread &\nEggs": ["milk", "dairy", "bread", "egg", "fresh"],
  "Bakery &\nBiscuits": ["bakery", "biscuit", "cookie", "snack"],
  "Dry Fruits &\nCereals": ["dry fruit", "cereal", "oils", "snack"],
  "Chicken, Meat\n& Fish": ["meat", "chicken", "fish", "fresh"],
  "Kitchenware &\nAppliances": ["kitchen", "appliance", "hardware", "material", "paint"],
  "Chips &\nNamkeen": ["snack", "chips", "namkeen", "crunchy"],
  "Sweets &\nChocolates": ["sweet", "chocolate", "dessert", "snack"],
  "Drinks &\nJuices": ["drink", "juice", "beverage"],
  "Tea, Coffee &\nMilk Drinks": ["tea", "coffee", "beverage", "milk"],
  "Instant\nFood": ["instant", "noodle", "maggi", "snack"],
  "Sauces &\nSpreads": ["sauce", "spread", "ketchup", "honey", "oil"],
  "Paan\nCorner": ["paan", "mouth freshener", "snack"],
  "Ice Creams &\nMore": ["ice cream", "dessert", "fresh", "milk"],
};

function getCategoryIcon(name: string): any {
  const n = name.toLowerCase();
  if (n.includes("fruit")) return "nutrition-outline";
  if (n.includes("fresh") || n.includes("veg")) return "leaf-outline";
  if (n.includes("snack")) return "fast-food-outline";
  if (n.includes("oil")) return "water-outline";
  if (n.includes("shoe")) return "footsteps-outline";
  if (n.includes("men")) return "shirt-outline";
  if (n.includes("women")) return "rose-outline";
  if (n.includes("material") || n.includes("hardware") || n.includes("paint")) return "construct-outline";
  return "grid-outline";
}

const DEFAULT_DEAL_ITEMS = [
  {
    id: "deal1",
    title: "Epigamia Turbo Chocolate Protein...",
    price: "₹99",
    originalPrice: "₹141",
    badge: "29% OFF on MRP",
    detail: "140 kcal",
    image:
      "https://images.unsplash.com/photo-1574170566232-1f6a0f9a0f1a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "deal2",
    title: "Tide Plus Double Power Washing D...",
    price: "₹889",
    originalPrice: "₹1,179",
    badge: "₹290 OFF",
    detail: "8 mins",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "deal3",
    title: "Vaseline Lip Therapy Rosy Lip...",
    price: "₹189",
    originalPrice: "₹295",
    badge: "Lowest in 30 days",
    detail: "8 mins",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "deal4",
    title: "Nestasia Snacks Box",
    price: "₹559",
    originalPrice: "₹1,095",
    badge: "₹536 OFF",
    detail: "220 ml",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
  },
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
    image1:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    isFavorite: false,
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
    image1:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
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
    image1:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
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
    image1:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
    isFavorite: false,
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

function getProductCardMeta(product: HomeProduct, index: number) {
  // 1. Extract Unit & Options Count
  const rawSizes = product.rawProduct?.sizes || [];
  let unit = "1 unit";
  let optionsCount = 1;

  if (Array.isArray(rawSizes) && rawSizes.length > 0) {
    unit = rawSizes[0];
    optionsCount = rawSizes.length;
  } else if (product.unit) {
    if (product.unit.toLowerCase().startsWith("sizes:")) {
      const parts = product.unit.replace(/sizes:/i, "").split(",").map((s: string) => s.trim());
      unit = parts[0] || "1 unit";
      optionsCount = parts.length;
    } else {
      unit = product.unit;
    }
  }

  // 2. Price calculation
  const rawPrice =
    typeof product.rawProduct?.price === "number"
      ? product.rawProduct.price
      : parseFloat(String(product.price).replace(/[^0-9.]/g, "")) || 199;
  const currentPrice = `₹${Math.round(rawPrice)}`;
  const mrpPrice = `₹${Math.round(rawPrice * (index % 2 === 0 ? 1.25 : 1.35))}`;

  // 3. Dynamic tags (matching 2nd image beige pills)
  const cat = (product.category || "").toLowerCase();
  const title = (product.title || "").toLowerCase();
  let tags: string[] = [];

  if (title.includes("vitamin") || title.includes("serum") || title.includes("cream")) {
    tags = ["Vitamin C", "Glow Skin"];
  } else if (title.includes("banana") || title.includes("apple") || cat.includes("fruit")) {
    tags = ["Fresh", "Organic"];
  } else if (cat.includes("veg") || title.includes("veggie")) {
    tags = ["Farm Fresh", "Organic"];
  } else if (cat.includes("oil") || title.includes("oil") || title.includes("ghee")) {
    tags = ["Pure", "Cold Pressed"];
  } else if (cat.includes("milk") || cat.includes("dairy")) {
    tags = ["Farm Fresh", "Pure"];
  } else if (cat.includes("snack") || title.includes("snack") || title.includes("chips")) {
    tags = ["Crunchy", "Snack"];
  } else if (cat.includes("shoe")) {
    tags = ["Sneakers", "Running"];
  } else if (cat.includes("men") || cat.includes("women")) {
    tags = ["Pure Cotton", "Trending"];
  } else {
    tags = [product.category || "Fresh", "Verified"];
  }

  // 4. Delivery time & Lowest tag
  const deliveryTime = index % 3 === 0 ? "16 mins" : "8 mins";
  const isLowestDeal = index === 0;

  return {
    unit,
    optionsCount,
    currentPrice,
    mrpPrice,
    tags,
    deliveryTime,
    isLowestDeal,
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const { addToCart, updateQuantity, cartItems, cartCount, grandTotal } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { isSaved, toggleSave } = useSaved();
  const [menuDrawerVisible, setMenuDrawerVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<HomeProduct[]>(INITIAL_PRODUCTS);
  const [customSections, setCustomSections] = useState<any[]>([]);

  // Dynamic Categories synced with backend & admin products
  const dynamicCategories = useMemo(() => {
    const fromBackend = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    );
    const defaults = ["All", "Fresh", "Fruits", "Snack", "Oils", "Shoes", "Men"];
    const merged = Array.from(new Set([...defaults, ...fromBackend]));
    return merged.map((name) => ({
      id: name.toLowerCase(),
      name,
      icon: getCategoryIcon(name),
    }));
  }, [products]);

  useEffect(() => {
    async function loadHomeSections() {
      try {
        const res = await fetch(ENDPOINTS.SETTINGS.GET_HOME_SECTIONS);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setCustomSections(data);
        }
      } catch (err) {
        console.warn("Home sections fetch failed", err);
      }
    }
    loadHomeSections();
  }, []);

  const dealProducts: Array<{
    id: string;
    title: string;
    price: string;
    originalPrice: string;
    badge: string;
    detail: string;
    image: string;
    productId?: string;
  }> =
    products.length > 0
      ? products.slice(0, 4).map((product, index) => {
          const rawPrice =
            typeof product.rawProduct?.price === "number"
              ? product.rawProduct.price
              : parseFloat(String(product.price).replace(/[^0-9.]/g, "")) || 0;
          const listedPrice = `₹${Math.round(rawPrice)}`;
          const originalPrice = `₹${Math.round(rawPrice * (index % 2 === 0 ? 1.35 : 1.55))}`;

          return {
            id: product._id || product.id,
            title: product.title,
            price: listedPrice,
            originalPrice,
            badge: index % 2 === 0 ? "Hot Deal" : "Best Value",
            detail: product.unit || "Fresh pick",
            image:
              product.image1 ||
              "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
            productId: product._id || product.id,
          };
        })
      : DEFAULT_DEAL_ITEMS.map((item) => ({ ...item, productId: undefined }));

  // Smooth Animations for Cart Badge & Floating Cart Bar
  const cartBadgeScale = useRef(new Animated.Value(1)).current;
  const prevCartCountRef = useRef(cartCount);
  const floatingCartAnim = useRef(
    new Animated.Value(cartCount > 0 ? 1 : 0),
  ).current;

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
              unit:
                p.sizes && p.sizes.length > 0
                  ? `Sizes: ${p.sizes.join(", ")}`
                  : "Standard",
              bgColor: "#F9FAFB",
              image1: p.image1,
              isFavorite: false,
              rawProduct: p,
            }));
            setProducts(mapped);
          }
        }
      } catch (err) {
        console.warn(
          "Backend products fetch failed, using local defaults",
          err,
        );
      }
    }
    loadBackendProducts();
  }, []);

  const handleAddToCartClick = (product: any) => {
    let rawSizes =
      product.rawProduct?.sizes ||
      (Array.isArray(product.sizes) ? product.sizes : []);
    if (
      (!rawSizes || rawSizes.length === 0) &&
      product.unit &&
      product.unit.toLowerCase().startsWith("sizes:")
    ) {
      rawSizes = product.unit
        .replace(/sizes:/i, "")
        .split(",")
        .map((s: string) => s.trim());
    }
    const sizeToUse =
      rawSizes && rawSizes.length > 0 ? rawSizes[0] : "Standard";
    executeAddToCart(product, sizeToUse);
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
      sizeToUse,
    );
  };

  // Toggle favorite on card
  const toggleFavorite = (product: HomeProduct) => {
    toggleSave(product.rawProduct || product);
  };

  // Filter & Sort State
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<
    "featured" | "price_asc" | "price_desc" | "newest"
  >("featured");
  const [priceRange, setPriceRange] = useState<
    "all" | "under_1000" | "1000_2500" | "above_2500"
  >("all");
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
      const itemCat = (item.category || "").toLowerCase();
      const itemTitle = (item.title || "").toLowerCase();
      const itemSub = (item.rawProduct?.subCategory || "").toLowerCase();

      // 1. Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          itemTitle.includes(q) || itemCat.includes(q) || itemSub.includes(q);
        if (!matchesSearch) return false;
      }

      // 2. Horizontal Category Chip filter
      if (activeCategory !== "All") {
        if (itemCat !== activeCategory.toLowerCase()) return false;
      }

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

      return matchesPrice && matchesBestseller;
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
                  {
                    backgroundColor: slide.bgColor || "#F3F4F6",
                    width: BANNER_WIDTH,
                  },
                ]}
              >
                <View style={styles.slideLeft}>
                  <View
                    style={[
                      styles.slideBadgeContainer,
                      {
                        backgroundColor: `${slide.accentColor || "#111827"}15`,
                      },
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
                    style={[
                      styles.slideDiscount,
                      { color: slide.accentColor || "#111827" },
                    ]}
                  >
                    {slide.discount}{" "}
                    <Text
                      style={[
                        styles.slideOff,
                        { color: slide.accentColor || "#111827" },
                      ]}
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
                    <Text style={styles.slideButtonText}>
                      {slide.btnText || "Shop Now"}
                    </Text>
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

        {/* Verified Shops & Suppliers Banner Card */}
        <TouchableOpacity
          style={styles.shopsPromoCard}
          onPress={() => router.push("/(root)/shops" as any)}
          activeOpacity={0.88}
        >
          <View style={styles.shopsPromoLeft}>
            <View style={styles.shopsPromoBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#059669" />
              <Text style={styles.shopsPromoBadgeText}>
                LOCAL STORES & SUPPLIERS
              </Text>
            </View>
            <Text style={styles.shopsPromoTitle}>
              Nearby Materials & Verified Shops
            </Text>
            <Text style={styles.shopsPromoSub}>
              Browse shops, direct call to shopkeeper, or inquiry on WhatsApp
            </Text>
            <View style={styles.shopsPromoAction}>
              <Text style={styles.shopsPromoActionText}>Explore Stores</Text>
              <Ionicons name="arrow-forward-circle" size={18} color="#059669" />
            </View>
          </View>
          <View style={styles.shopsPromoIconBox}>
            <Ionicons name="storefront" size={32} color="#059669" />
          </View>
        </TouchableOpacity>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity
            onPress={() => router.push("/(root)/(tabs)/categories" as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {dynamicCategories.map((cat: any) => {
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

        {customSections.length > 0 &&
          customSections.map((section) => {
            const sectionProducts = (section.productIds || [])
              .map((productId: string) =>
                products.find(
                  (product) => (product._id || product.id) === productId,
                ),
              )
              .filter(Boolean)
              .slice(0, 4);

            if (!sectionProducts.length) return null;

            return (
              <View
                key={section.id || section.title}
                style={styles.customSection}
              >
                <Text style={styles.customSectionTitle}>{section.title}</Text>
                <View style={styles.customSectionGrid}>
                  {sectionProducts.map((product: HomeProduct) => (
                    <TouchableOpacity
                      key={product.id}
                      style={styles.customSectionCard}
                      activeOpacity={0.85}
                      onPress={() =>
                        router.push({
                          pathname: "/(root)/product/[id]",
                          params: { id: String(product._id || product.id) },
                        })
                      }
                    >
                      <Image
                        source={{
                          uri:
                            product.image1 ||
                            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
                        }}
                        style={styles.customSectionImage}
                        resizeMode="cover"
                      />
                      <Text
                        style={styles.customSectionCardText}
                        numberOfLines={2}
                      >
                        {product.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}

        {/* Featured Products Section (3-Column Grid) */}
        <View style={styles.productsHeaderRow}>
          <Text style={styles.sectionTitle}>
            {activeCategory !== "All"
              ? `${activeCategory} Products`
              : "Curated Collection"} ({filteredProducts.length})
          </Text>
          {(activeCategory !== "All" || searchQuery) ? (
            <TouchableOpacity
              onPress={() => {
                setActiveCategory("All");
                setSearchQuery("");
              }}
              activeOpacity={0.6}
            >
              <Text style={styles.seeAllText}>Show All ({products.length})</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity activeOpacity={0.6}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Product Cards 3-Column Grid */}
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyProductsBox}>
            <Ionicons name="basket-outline" size={44} color="#9CA3AF" />
            <Text style={styles.emptyProductsTitle}>
              No items in "{activeCategory}"
            </Text>
            <Text style={styles.emptyProductsSub}>
              Products added from the Admin Panel will appear here live.
            </Text>
            <TouchableOpacity
              style={styles.resetFilterBtn}
              onPress={() => {
                setActiveCategory("All");
                setSearchQuery("");
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.resetFilterBtnText}>
                Show All Available Products ({products.length})
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productsGrid3Col}>
            {filteredProducts.map((product, idx) => {
              const prodId = product._id || product.id;
              const inCart = cartItems.find((ci) => ci.productId === prodId);
              const meta = getProductCardMeta(product, idx);

              return (
                <TouchableOpacity
                  key={product.id}
                  style={styles.cardContainer3Col}
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/product/[id]",
                      params: { id: prodId },
                    })
                  }
                  activeOpacity={0.88}
                >
                  {/* Top Media Box with Light Grey Border */}
                  <View style={styles.cardMediaBox3Col}>
                    {/* Floating Wishlist Heart Icon at Top Right */}
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product);
                      }}
                      style={styles.cardHeartBtn3Col}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={
                          isSaved(product.id || product._id)
                            ? "heart"
                            : "heart-outline"
                        }
                        size={15}
                        color={
                          isSaved(product.id || product._id)
                            ? "#E11D48"
                            : "#94A3B8"
                        }
                      />
                    </TouchableOpacity>

                    {/* Centered Product Image */}
                    <View style={styles.imageInnerContainer3Col}>
                      {product.image1 ? (
                        <Image
                          source={{ uri: product.image1 }}
                          style={styles.productImage3Col}
                          resizeMode="contain"
                        />
                      ) : (
                        <Image
                          source={product.image}
                          style={styles.productImage3Col}
                          resizeMode="contain"
                        />
                      )}
                    </View>

                    {/* Docked Unit & ADD Button Bar at Bottom of Media Box */}
                    <View style={styles.dockedBar3Col}>
                      <Text style={styles.dockedUnitText3Col} numberOfLines={1}>
                        {meta.unit}
                      </Text>

                      {inCart && inCart.quantity > 0 ? (
                        <View style={styles.dockedQtyBox3Col}>
                          <TouchableOpacity
                            style={styles.dockedQtyBtn3Col}
                            onPress={(e) => {
                              e.stopPropagation();
                              updateQuantity(inCart.productId, inCart.size, inCart.quantity - 1);
                            }}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="remove" size={12} color="#FFFFFF" />
                          </TouchableOpacity>
                          <Text style={styles.dockedQtyText3Col}>{inCart.quantity}</Text>
                          <TouchableOpacity
                            style={styles.dockedQtyBtn3Col}
                            onPress={(e) => {
                              e.stopPropagation();
                              updateQuantity(inCart.productId, inCart.size, inCart.quantity + 1);
                            }}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="add" size={12} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.dockedAddBtn3Col}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleAddToCartClick(product);
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.dockedAddBtnText3Col}>ADD</Text>
                          {meta.optionsCount > 1 && (
                            <Text style={styles.dockedOptionsText3Col}>
                              {meta.optionsCount} options
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Below Media Box Content */}
                  <View style={styles.cardDetails3Col}>
                    {/* Price Row */}
                    <View style={styles.priceRow3Col}>
                      <Text style={styles.priceBold3Col}>{meta.currentPrice}</Text>
                      <Text style={styles.priceMrp3Col}>{meta.mrpPrice}</Text>
                    </View>

                    {/* Product Title (2 lines) */}
                    <Text style={styles.cardTitle3Col} numberOfLines={2}>
                      {product.title?.replace("\n", " ")}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

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
                <Text style={styles.cartBarPrice}>
                  ₹{grandTotal.toFixed(0)}
                </Text>
              </View>
            </View>

            <View style={styles.floatingCartRight}>
              <Text style={styles.viewCartText}>View Cart</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color="#FFFFFF"
                style={{ marginLeft: 4 }}
              />
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
                sizeModalProduct.rawProduct?.subCategory?.toLowerCase() ===
                  "shoes"
                  ? "👟 Select Shoe Size:"
                  : "👕 Select Apparel Size:"}
              </Text>

              {/* Sizes Row */}
              <View style={styles.sizeModalChipsRow}>
                {(sizeModalProduct.rawProduct?.sizes || ["Std"]).map(
                  (sz: string) => {
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
                  },
                )}
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
                  Add to Cart{" "}
                  {selectedModalSize ? `(Size: ${selectedModalSize})` : ""}
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
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Ionicons name="options-outline" size={20} color="#111827" />
                <Text style={styles.filterModalTitle}>Filter & Sort</Text>
              </View>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
              >
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

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 420 }}
            >
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
                      style={[
                        styles.filterOptionChip,
                        isSel && styles.filterOptionChipActive,
                      ]}
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
                      style={[
                        styles.filterOptionChip,
                        isSel && styles.filterOptionChipActive,
                      ]}
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
                  <Text style={styles.filterToggleSub}>
                    Show only top-selling trending items
                  </Text>
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

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.drawerScroll}
              >
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
                    router.push("/(root)/(tabs)/categories" as any);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.drawerItemIconBox}>
                    <Ionicons name="grid-outline" size={19} color="#111827" />
                  </View>
                  <Text style={styles.drawerItemText}>All Categories</Text>
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
                      <Text style={styles.drawerItemBadgeText}>
                        {cartCount}
                      </Text>
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
                  {
                    name: "Men",
                    icon: "shirt-outline",
                    label: "Men's Collection",
                  },
                  {
                    name: "Women",
                    icon: "rose-outline",
                    label: "Women's Collection",
                  },
                  {
                    name: "Kids",
                    icon: "happy-outline",
                    label: "Kids & Teens",
                  },
                  {
                    name: "Shoes",
                    icon: "footsteps-outline",
                    label: "Sneakers & Shoes",
                  },
                  {
                    name: "Accessories",
                    icon: "watch-outline",
                    label: "Watches & Bags",
                  },
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
                      <Ionicons
                        name={cat.icon as any}
                        size={18}
                        color="#4B5563"
                      />
                    </View>
                    <Text style={styles.drawerCategoryText}>{cat.label}</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#D1D5DB"
                    />
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
                    <Ionicons
                      name="log-out-outline"
                      size={18}
                      color="#DC2626"
                    />
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
                    <Text style={styles.drawerSignInText}>
                      Sign In / Register
                    </Text>
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

  dealSection: {
    backgroundColor: "#EFE3B8",
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 12,
    marginBottom: 24,
  },
  dealRow: {
    paddingBottom: 4,
    paddingRight: 8,
  },
  dealCard: {
    width: 175,
    backgroundColor: "#F8F8F4",
    borderRadius: 18,
    marginRight: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9E4D3",
  },
  dealImageWrapper: {
    height: 190,
    backgroundColor: "#F6F4EF",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  dealImage: {
    width: "100%",
    height: "100%",
  },
  dealPlusButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.82)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#2E8B57",
  },
  dealCardBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  dealPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dealPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginRight: 6,
  },
  dealOriginalPrice: {
    fontSize: 12,
    color: "#7B7F8A",
    textDecorationLine: "line-through",
  },
  dealBadge: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "600",
    marginBottom: 4,
  },
  dealName: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    color: "#111827",
    marginBottom: 6,
  },
  dealMeta: {
    fontSize: 11,
    color: "#6B7280",
  },

  customSection: {
    marginBottom: 22,
  },
  customSectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  customSectionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  customSectionCard: {
    width: (width - 40 - 18) / 4,
    backgroundColor: "#F4F8F7",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DDE9E5",
    paddingBottom: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
  customSectionImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#EAF1EF",
  },
  customSectionCardText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F2937",
    lineHeight: 17,
    paddingHorizontal: 10,
    paddingTop: 10,
  },

  // Products Header Row
  productsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    marginHorizontal: -10,
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
  shopsPromoCard: {
    backgroundColor: "#F0FDF4",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shopsPromoLeft: {
    flex: 1,
    paddingRight: 10,
  },
  shopsPromoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    gap: 4,
    marginBottom: 6,
  },
  shopsPromoBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#166534",
    letterSpacing: 0.5,
  },
  shopsPromoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 20,
  },
  shopsPromoSub: {
    fontSize: 12,
    color: "#4B5563",
    marginTop: 3,
    lineHeight: 16,
  },
  shopsPromoAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  shopsPromoActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
  },
  shopsPromoIconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  // 3-Column Product Grid styles (matching 2nd image Blinkit UI)
  productsGrid3Col: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    columnGap: 7,
    rowGap: 16,
    marginHorizontal: -10,
    paddingHorizontal: 0,
    marginBottom: 24,
  },
  cardContainer3Col: {
    width: "31.8%", // Exactly 3 in a row guaranteed (3 * 31.8% = 95.4% < 100%)
    marginBottom: 0,
  },
  cardMediaBox3Col: {
    width: "100%",
    aspectRatio: 0.82,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: "#E5E7EB",
    position: "relative",
    justifyContent: "space-between",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeartBtn3Col: {
    position: "absolute",
    top: 6,
    right: 6,
    zIndex: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  imageInnerContainer3Col: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingHorizontal: 4,
    paddingBottom: 2,
  },
  productImage3Col: {
    width: "92%",
    height: "92%",
    borderRadius: 12,
  },
  dockedBar3Col: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 3,
    height: 33,
  },
  dockedUnitText3Col: {
    fontSize: 10,
    fontWeight: "700",
    color: "#374151",
    flex: 1,
    marginRight: 4,
  },
  dockedAddBtn3Col: {
    borderWidth: 1.5,
    borderColor: "#16A34A",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1.5,
  },
  dockedAddBtnText3Col: {
    fontSize: 11,
    fontWeight: "800",
    color: "#16A34A",
    letterSpacing: 0.5,
    lineHeight: 13,
  },
  dockedOptionsText3Col: {
    fontSize: 7,
    fontWeight: "700",
    color: "#16A34A",
    marginTop: 0.5,
  },
  dockedQtyBox3Col: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16A34A",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 44,
    height: 25,
    justifyContent: "space-between",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  dockedQtyBtn3Col: {
    width: 13,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dockedQtyText3Col: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
    paddingHorizontal: 2,
  },
  cardDetails3Col: {
    paddingTop: 5,
    paddingHorizontal: 2,
  },
  priceRow3Col: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 2,
    marginTop: 4,
  },
  priceBold3Col: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  priceMrp3Col: {
    fontSize: 10,
    color: "#64748B",
    textDecorationLine: "line-through",
    fontWeight: "500",
  },
  cardTitle3Col: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#1E293B",
    lineHeight: 14,
    height: 28,
    marginTop: 1,
    marginBottom: 4,
  },

  // Empty products state
  emptyProductsBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 24,
  },
  emptyProductsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 10,
    textAlign: "center",
  },
  emptyProductsSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
    marginBottom: 16,
  },
  resetFilterBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  resetFilterBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
