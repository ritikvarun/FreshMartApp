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

const { width } = Dimensions.get("window");

// Assets
const bananaImg = require("../../../assets/images/product_banana.jpg");
const vegImg = require("../../../assets/images/product_vegetables.jpg");
const snackImg = require("../../../assets/images/cat_snack.jpg");
const oilsImg = require("../../../assets/images/cat_oils.jpg");

const ALL_PRODUCTS = [
  {
    id: "sp1",
    title: "Fresh Yellow Banana",
    category: "Fruits",
    price: "$3.50",
    unit: "/ kg",
    rating: 4.9,
    image: bananaImg,
    bgColor: "#FFF9EE",
  },
  {
    id: "sp2",
    title: "Organic Mixed Vegetables",
    category: "Fresh",
    price: "$4.80",
    unit: "/ kg",
    rating: 4.8,
    image: vegImg,
    bgColor: "#EBF8F2",
  },
  {
    id: "sp3",
    title: "Gourmet Roasted Nut Mix",
    category: "Snack",
    price: "$5.90",
    unit: "/ pack",
    rating: 4.7,
    image: snackImg,
    bgColor: "#FFF1E8",
  },
  {
    id: "sp4",
    title: "Extra Virgin Olive Oil 500ml",
    category: "Oils",
    price: "$12.40",
    unit: "/ bot",
    rating: 4.9,
    image: oilsImg,
    bgColor: "#FFFBEA",
  },
];

const RECENT_SEARCHES = [
  "Fresh Banana",
  "Green Salad",
  "Olive Oil",
  "Almond Snack",
];

const POPULAR_CATEGORIES = [
  { id: "c1", name: "Fresh Fruits", count: "48 items", color: "#FFF8ED", textColor: "#D97706", icon: "nutrition-outline" },
  { id: "c2", name: "Vegetables", count: "64 items", color: "#ECFDF5", textColor: "#059669", icon: "leaf-outline" },
  { id: "c3", name: "Nuts & Snacks", count: "32 items", color: "#FFF1F2", textColor: "#E11D48", icon: "fast-food-outline" },
  { id: "c4", name: "Cooking Oils", count: "19 items", color: "#FEFCE8", textColor: "#CA8A04", icon: "water-outline" },
];

export default function SearchScreen() {
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
            placeholder="Search fresh groceries, fruits, snacks..."
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
                  Try searching for something else like "banana", "vegetable", or "oil".
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
                      source={item.image}
                      style={styles.resultImage}
                      resizeMode="contain"
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
                <Text style={styles.sectionTitle}>Trending Groceries</Text>
              </View>

              {ALL_PRODUCTS.slice(0, 2).map((item) => (
                <View key={item.id} style={styles.resultCard}>
                  <View
                    style={[
                      styles.resultImageContainer,
                      { backgroundColor: item.bgColor },
                    ]}
                  >
                    <Image
                      source={item.image}
                      style={styles.resultImage}
                      resizeMode="contain"
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
