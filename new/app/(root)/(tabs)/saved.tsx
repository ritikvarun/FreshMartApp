import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCart } from "../../../context/CartContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48 - 14) / 2;

interface SavedProduct {
  id: string;
  title: string;
  category: string;
  price: string;
  rawPrice: number;
  unit: string;
  size: string;
  bgColor: string;
  image: string;
  rating: number;
}

const INITIAL_SAVED: SavedProduct[] = [
  {
    id: "s1",
    title: "Classic White\nLinen Shirt",
    category: "Men",
    price: "₹1,499",
    rawPrice: 1499,
    unit: "Size: L",
    size: "L",
    bgColor: "#F3F4F6",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    rating: 4.9,
  },
  {
    id: "s2",
    title: "Air Cushion\nRunning Shoes",
    category: "Shoes",
    price: "₹2,499",
    rawPrice: 2499,
    unit: "Size: 9",
    size: "9",
    bgColor: "#EEF2FF",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    rating: 4.8,
  },
  {
    id: "s3",
    title: "Floral Printed\nSummer Dress",
    category: "Women",
    price: "₹1,899",
    rawPrice: 1899,
    unit: "Size: M",
    size: "M",
    bgColor: "#FFF1F2",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
    rating: 4.7,
  },
  {
    id: "s4",
    title: "Casual Leather\nSneakers",
    category: "Shoes",
    price: "₹2,999",
    rawPrice: 2999,
    unit: "Size: 8",
    size: "8",
    bgColor: "#F8FAFC",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
    rating: 4.9,
  },
];

const CATEGORIES = ["All", "Men", "Women", "Shoes", "Kids"];

export default function SavedScreen() {
  const { addToCart } = useCart();
  const [savedItems, setSavedItems] = useState<SavedProduct[]>(INITIAL_SAVED);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const removeItem = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredItems = savedItems.filter((item) => {
    if (selectedFilter === "All") return true;
    return item.category === selectedFilter;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Wishlist</Text>
          <Text style={styles.headerSubtitle}>
            {savedItems.length} items saved for later
          </Text>
        </View>

        {savedItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearAllBtn}
            onPress={() => setSavedItems([])}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#8E94A4" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedFilter === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedFilter(cat)}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-dislike-outline" size={42} color="#E05315" />
            </View>
            <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
            <Text style={styles.emptySub}>
              Explore fresh products and tap the heart icon to save your
              favorites here.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => setSavedItems(INITIAL_SAVED)}
              activeOpacity={0.85}
            >
              <Text style={styles.exploreBtnText}>Restore Sample Items</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredItems.map((product) => (
              <View
                key={product.id}
                style={[styles.card, { backgroundColor: product.bgColor }]}
              >
                {/* Top Row: Title + Remove Button */}
                <View style={styles.cardHeader}>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {product.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeItem(product.id)}
                    style={styles.heartBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="heart" size={19} color="#E05315" />
                  </TouchableOpacity>
                </View>

                {/* Product Image */}
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: product.image }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>

                {/* Rating Badge */}
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={styles.ratingText}>{product.rating}</Text>
                  <Text style={styles.inStockBadge}>• In Stock</Text>
                </View>

                {/* Bottom Row: Price + Add Button */}
                <View style={styles.cardFooter}>
                  <Text style={styles.price}>
                    {product.price}{" "}
                    <Text style={styles.unit}>{product.unit}</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.addToCartBtn}
                    onPress={() =>
                      addToCart(
                        {
                          _id: product.id,
                          name: product.title.replace("\n", " "),
                          price: product.rawPrice,
                          image1: product.image,
                          category: product.category,
                          sizes: [product.size],
                        },
                        product.size
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1D26",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#8B92A2",
    marginTop: 2,
  },
  clearAllBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  filterWrapper: {
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F8F8FA",
    borderWidth: 1,
    borderColor: "#EFEFEF",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#E05315",
    borderColor: "#E05315",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C313C",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 110,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 22,
    padding: 12,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1D26",
    lineHeight: 17,
    flex: 1,
    paddingRight: 4,
  },
  heartBtn: {
    padding: 2,
  },
  imageContainer: {
    width: "100%",
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  image: {
    width: "90%",
    height: "90%",
    borderRadius: 10,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1A1D26",
    marginLeft: 3,
  },
  inStockBadge: {
    fontSize: 10,
    fontWeight: "500",
    color: "#10B981",
    marginLeft: 5,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1A1D26",
  },
  unit: {
    fontSize: 10,
    fontWeight: "400",
    color: "#8B92A2",
  },
  addToCartBtn: {
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF5EF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1D26",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: "#8B92A2",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: "#E05315",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
  },
  exploreBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
