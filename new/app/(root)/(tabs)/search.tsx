import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCart } from "../../../context/CartContext";

const { width } = Dimensions.get("window");

interface SearchProduct {
  id: string;
  title: string;
  category: string;
  price: string;
  rawPrice: number;
  unit: string;
  rating: number;
  image: string;
  bgColor: string;
  sizes: string[];
}

const ALL_PRODUCTS: SearchProduct[] = [
  {
    id: "sp1",
    title: "Air Cushion Running Shoes",
    category: "Shoes",
    price: "₹2,499",
    rawPrice: 2499,
    unit: "Sizes: 7, 8, 9, 10, 11",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    bgColor: "#EEF2FF",
    sizes: ["7", "8", "9", "10", "11"],
  },
  {
    id: "sp2",
    title: "Classic White Linen Shirt",
    category: "Men",
    price: "₹1,499",
    rawPrice: 1499,
    unit: "Sizes: S, M, L, XL",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    bgColor: "#F3F4F6",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "sp3",
    title: "Casual Streetwear Sneakers",
    category: "Shoes",
    price: "₹2,999",
    rawPrice: 2999,
    unit: "Sizes: 8, 9, 10",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
    bgColor: "#F8FAFC",
    sizes: ["8", "9", "10"],
  },
  {
    id: "sp4",
    title: "Floral Printed Summer Dress",
    category: "Women",
    price: "₹1,899",
    rawPrice: 1899,
    unit: "Sizes: S, M, L",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
    bgColor: "#FFF1F2",
    sizes: ["S", "M", "L"],
  },
  {
    id: "sp5",
    title: "Slim Fit Denim Jacket",
    category: "Men",
    price: "₹2,199",
    rawPrice: 2199,
    unit: "Sizes: M, L, XL",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
    bgColor: "#F1F5F9",
    sizes: ["M", "L", "XL"],
  },
];

const RECENT_SEARCHES = [
  "Running Shoes",
  "Sneakers",
  "Linen Shirt",
  "Summer Dress",
];

const POPULAR_CATEGORIES = [
  { id: "c1", name: "Shoes & Footwear", count: "36 items", color: "#EEF2FF", textColor: "#4F46E5", icon: "footsteps-outline" },
  { id: "c2", name: "Men's Wear", count: "48 items", color: "#F3F4F6", textColor: "#1F2937", icon: "shirt-outline" },
  { id: "c3", name: "Women's Fashion", count: "52 items", color: "#FFF1F2", textColor: "#E11D48", icon: "rose-outline" },
  { id: "c4", name: "Kids Collection", count: "24 items", color: "#FEFCE8", textColor: "#CA8A04", icon: "happy-outline" },
];

export default function SearchScreen() {
  const { addToCart } = useCart();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);

  const clearRecent = () => setRecentSearches([]);

  const searchResults = ALL_PRODUCTS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#9AA0B0"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search shoes, sneakers, clothing, apparel..."
            placeholderTextColor="#9AA0B0"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color="#9AA0B0" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
          <Ionicons name="options-outline" size={20} color="#1A1D26" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {query.length > 0 ? (
          /* Search Results */
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                Search Results ({searchResults.length})
              </Text>
            </View>

            {searchResults.length === 0 ? (
              <View style={styles.noResults}>
                <Ionicons name="search" size={40} color="#CBD5E1" />
                <Text style={styles.noResultsTitle}>No Products Found</Text>
                <Text style={styles.noResultsSub}>
                  Try searching for something else like "shoes", "sneakers", "shirt", or "dress".
                </Text>
              </View>
            ) : (
              searchResults.map((item) => (
                <View key={item.id} style={styles.resultCard}>
                  <View
                    style={[
                      styles.resultImageContainer,
                      { backgroundColor: item.bgColor },
                    ]}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.resultImage}
                      resizeMode="cover"
                    />
                  </View>

                  <View style={styles.resultInfo}>
                    <Text style={styles.resultCategory}>{item.category}</Text>
                    <Text style={styles.resultTitle}>{item.title}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                    <Text style={styles.resultPrice}>
                      {item.price}{" "}
                      <Text style={styles.resultUnit}>{item.unit}</Text>
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.addResultBtn}
                    onPress={() =>
                      addToCart(
                        {
                          _id: item.id,
                          name: item.title,
                          price: item.rawPrice,
                          image1: item.image,
                          category: item.category,
                          sizes: item.sizes,
                        },
                        item.sizes[0] || "Standard"
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        ) : (
          /* Default Discovery Content */
          <View>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearRecent}>
                    <Text style={styles.clearText}>Clear All</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.recentTagsWrapper}>
                  {recentSearches.map((tag, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.recentTag}
                      onPress={() => setQuery(tag)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color="#8E94A4"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.recentTagText}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Popular Categories */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Popular Categories</Text>
              </View>

              <View style={styles.catGrid}>
                {POPULAR_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catCard, { backgroundColor: cat.color }]}
                    onPress={() => setQuery(cat.name.split(" ")[0])}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.catIconCircle,
                        { backgroundColor: "#FFFFFF" },
                      ]}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={22}
                        color={cat.textColor}
                      />
                    </View>
                    <Text style={[styles.catName, { color: cat.textColor }]}>
                      {cat.name}
                    </Text>
                    <Text style={styles.catCount}>{cat.count}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recommended Products */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Trending Footwear & Fashion</Text>
              </View>

              {ALL_PRODUCTS.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.resultCard}>
                  <View
                    style={[
                      styles.resultImageContainer,
                      { backgroundColor: item.bgColor },
                    ]}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.resultImage}
                      resizeMode="cover"
                    />
                  </View>

                  <View style={styles.resultInfo}>
                    <Text style={styles.resultCategory}>{item.category}</Text>
                    <Text style={styles.resultTitle}>{item.title}</Text>
                    <Text style={styles.resultPrice}>
                      {item.price}{" "}
                      <Text style={styles.resultUnit}>{item.unit}</Text>
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.addResultBtn}
                    onPress={() =>
                      addToCart(
                        {
                          _id: item.id,
                          name: item.title,
                          price: item.rawPrice,
                          image1: item.image,
                          category: item.category,
                          sizes: item.sizes,
                        },
                        item.sizes[0] || "Standard"
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
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
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
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
  filterBtn: {
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 110,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1D26",
  },
  clearText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#8B92A2",
  },
  recentTagsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  recentTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FB",
    borderWidth: 1,
    borderColor: "#EEF0F4",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recentTagText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  catCard: {
    width: (width - 54) / 2,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  catIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  catName: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  catCount: {
    fontSize: 11,
    color: "#6B7280",
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: "#F0F2F6",
    marginBottom: 10,
  },
  resultImageContainer: {
    width: 72,
    height: 72,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  resultImage: {
    width: "85%",
    height: "85%",
  },
  resultInfo: {
    flex: 1,
  },
  resultCategory: {
    fontSize: 10,
    fontWeight: "700",
    color: "#E05315",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1D26",
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1A1D26",
    marginLeft: 3,
  },
  resultPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1A1D26",
    marginTop: 3,
  },
  resultUnit: {
    fontSize: 11,
    fontWeight: "400",
    color: "#8B92A2",
  },
  addResultBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E05315",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E05315",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
    marginLeft: 8,
  },
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  noResultsTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1D26",
    marginTop: 12,
  },
  noResultsSub: {
    fontSize: 13,
    color: "#8B92A2",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
});
