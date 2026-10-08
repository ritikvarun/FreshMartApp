import React, { useState, useMemo } from "react";
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
import { useCart } from "../../../context/CartContext";
import { useSaved, SavedProduct } from "../../../context/SavedContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48 - 14) / 2;

export default function SavedScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { savedItems, removeSaved, clearSaved } = useSaved();
  const [selectedFilter, setSelectedFilter] = useState("All");

  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(savedItems.map((item) => item.category).filter(Boolean))
    );
    return ["All", ...cats];
  }, [savedItems]);

  const filteredItems = useMemo(() => {
    if (selectedFilter === "All") return savedItems;
    return savedItems.filter((item) => item.category === selectedFilter);
  }, [savedItems, selectedFilter]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Wishlist</Text>
          <Text style={styles.headerSubtitle}>
            {savedItems.length} {savedItems.length === 1 ? "item" : "items"} saved for later
          </Text>
        </View>

        {savedItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearAllBtn}
            onPress={clearSaved}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#8E94A4" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Chips - Only show if there are saved items with multiple categories */}
      {savedItems.length > 0 && categories.length > 2 && (
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {categories.map((cat) => {
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
      )}

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {savedItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-dislike-outline" size={42} color="#E11D48" />
            </View>
            <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
            <Text style={styles.emptySub}>
              Explore fresh groceries and tap the heart icon on any product to save it here.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.push("/(root)/(tabs)" as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.exploreBtnText}>Explore Products</Text>
            </TouchableOpacity>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No items in this category</Text>
            <Text style={styles.emptySub}>Try selecting a different filter.</Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => setSelectedFilter("All")}
              activeOpacity={0.85}
            >
              <Text style={styles.exploreBtnText}>View All Items</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredItems.map((product) => (
              <View
                key={product.id}
                style={[styles.card, { backgroundColor: product.bgColor || "#F9FAFB" }]}
              >
                {/* Top Row: Title + Remove Button */}
                <View style={styles.cardHeader}>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {product.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeSaved(product.id)}
                    style={styles.heartBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="heart" size={19} color="#E11D48" />
                  </TouchableOpacity>
                </View>

                {/* Product Image */}
                <View style={styles.imageContainer}>
                  {product.image ? (
                    <Image
                      source={{ uri: product.image }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="cube-outline" size={40} color="#CBD5E1" />
                  )}
                </View>

                {/* Rating Badge */}
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={styles.ratingText}>{product.rating || 4.8}</Text>
                  <Text style={styles.inStockBadge}>• In Stock</Text>
                </View>

                {/* Bottom Row: Price + Add Button */}
                <View style={styles.cardFooter}>
                  <Text style={styles.price}>
                    {product.price}{" "}
                    {product.unit ? (
                      <Text style={styles.unit}>{product.unit}</Text>
                    ) : null}
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
                          sizes: product.size ? [product.size] : [],
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
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
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
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
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
    backgroundColor: "#FFF1F2",
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
    backgroundColor: "#0F172A",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  exploreBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
