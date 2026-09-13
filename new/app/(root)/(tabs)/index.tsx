import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48 - 14) / 2;

// Asset references
const avatarImg = require("../../../assets/images/avatar_romina.jpg");
const bannerBasketImg = require("../../../assets/images/banner_basket.jpg");
const bananaImg = require("../../../assets/images/product_banana.jpg");
const vegImg = require("../../../assets/images/product_vegetables.jpg");
const snackImg = require("../../../assets/images/cat_snack.jpg");
const oilsImg = require("../../../assets/images/cat_oils.jpg");

// Category definitions
const CATEGORIES = [
  { id: "1", name: "Fresh", image: vegImg },
  { id: "2", name: "Snack", image: snackImg },
  { id: "3", name: "Oils", image: oilsImg },
  { id: "4", name: "Fruits", image: bananaImg },
];

// Products list matching screenshot
const INITIAL_PRODUCTS = [
  {
    id: "p1",
    title: "Fresh Fruits\nBanana",
    category: "Fruits",
    price: "$3.50",
    unit: "/ kg",
    bgColor: "#FFF9EE",
    image: bananaImg,
    isFavorite: true,
  },
  {
    id: "p2",
    title: "Fresh Fruits &\nVegetable",
    category: "Fresh",
    price: "$4.80",
    unit: "/ kg",
    bgColor: "#EBF8F2",
    image: vegImg,
    isFavorite: false,
  },
  {
    id: "p3",
    title: "Natural Crunchy\nSnack Mix",
    category: "Snack",
    price: "$5.90",
    unit: "/ pack",
    bgColor: "#FFF1E8",
    image: snackImg,
    isFavorite: false,
  },
  {
    id: "p4",
    title: "Extra Virgin\nOlive Oil",
    category: "Oils",
    price: "$12.40",
    unit: "/ bottle",
    bgColor: "#FFFBEA",
    image: oilsImg,
    isFavorite: true,
  },
];

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState("Fresh");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

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
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
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
          <View style={styles.profileSection}>
            <Image source={avatarImg} style={styles.avatar} />
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingTitle}>Morning, Romina</Text>
              <Text style={styles.greetingSubtitle}>
                What would you buy today?
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={20} color="#1A1D26" />
          </TouchableOpacity>
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
          {CATEGORIES.map((cat) => {
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
                <View style={styles.categoryIconCircle}>
                  <Image source={cat.image} style={styles.categoryThumb} />
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

        {/* Fresh Products Section */}
        <View style={styles.productsHeaderRow}>
          <Text style={styles.sectionTitle}>Fresh Products</Text>
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
                <Image
                  source={product.image}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              </View>

              {/* Card Bottom: Price and Quick Add */}
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.productPrice}>
                    {product.price}{" "}
                    <Text style={styles.productUnit}>{product.unit}</Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.addCartBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
});
