import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ENDPOINTS } from "../../config/api";

const PRESET_CATEGORIES = ["All", "Men", "Women", "Kids", "Shoes", "Accessories", "Unisex"];

const getCategoryIcon = (cat: string) => {
  switch (cat.toLowerCase()) {
    case "men":
      return "shirt-outline";
    case "women":
      return "woman-outline";
    case "kids":
      return "happy-outline";
    case "shoes":
      return "footsteps-outline";
    case "accessories":
      return "watch-outline";
    case "oils":
    case "organic":
      return "water-outline";
    case "snack":
    case "bakery":
      return "fast-food-outline";
    case "fresh":
    case "dairy":
      return "leaf-outline";
    case "beauty":
      return "sparkles-outline";
    default:
      return "pricetag-outline";
  }
};

export default function AdminProductsScreen() {
  const router = useRouter();
  const { adminToken } = useAdminAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(ENDPOINTS.PRODUCTS.LIST);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts([...data].reverse());
        }
      }
    } catch (err) {
      console.warn("Failed to fetch products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = (productId: string, name: string) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to permanently remove "${name}" from the store catalog?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(ENDPOINTS.PRODUCTS.REMOVE(productId), {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${adminToken}`,
                },
              });

              if (res.ok) {
                Alert.alert("Deleted", "Item removed successfully.");
                fetchProducts();
              } else {
                Alert.alert("Error", "Could not delete product.");
              }
            } catch (err) {
              Alert.alert("Error", "Network request failed.");
            }
          },
        },
      ]
    );
  };

  // Collect all unique categories from products & presets
  const availableCategories = useMemo(() => {
    const cats = new Set<string>(PRESET_CATEGORIES);
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        const norm = p.category.trim().charAt(0).toUpperCase() + p.category.trim().slice(1);
        cats.add(norm);
      }
    });
    return Array.from(cats);
  }, [products]);

  // Product counts per category
  const getCategoryCount = (cat: string) => {
    if (cat === "All") return products.length;
    return products.filter(
      (p) => (p.category || "").trim().toLowerCase() === cat.trim().toLowerCase()
    ).length;
  };

  // Filtered by Search & Active Category
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase()) ||
        p.subCategory?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "All" ||
        (p.category || "").trim().toLowerCase() === activeCategory.trim().toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  // Grouped by Category for structured sections
  const groupedProducts = useMemo(() => {
    const map: { [cat: string]: any[] } = {};
    filtered.forEach((item) => {
      const cat = (item.category || "General").trim();
      const normCat = cat.charAt(0).toUpperCase() + cat.slice(1);
      if (!map[normCat]) {
        map[normCat] = [];
      }
      map[normCat].push(item);
    });
    return map;
  }, [filtered]);

  const renderProductCard = (item: any) => (
    <View key={item._id} style={styles.productCard}>
      <Image
        source={{ uri: item.image1 || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600" }}
        style={styles.productThumb}
        resizeMode="cover"
      />

      <View style={styles.productDetails}>
        <View style={styles.row}>
          <Text style={styles.productCategory}>{item.category} · {item.subCategory || "General"}</Text>
          {item.bestseller ? (
            <View style={styles.bestsellerBadge}>
              <Text style={styles.bestsellerText}>BESTSELLER</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={styles.productPrice}>
          ₹{Number(item.price || 0)}{" "}
          <Text style={styles.packSizes}>
            • Sizes: {Array.isArray(item.sizes) ? item.sizes.join(", ") : "Std"}
          </Text>
        </Text>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDeleteProduct(item._id, item.name)}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={17} color="#000000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Store Inventory</Text>
          <Text style={styles.headerSub}>{products.length} products organized by category</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchProducts}>
          <Ionicons name="refresh-outline" size={20} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Filter products by name or category..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#94A3B8"
        />
      </View>

      {/* Category Tabs Bar */}
      <View style={styles.categoryTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsScroll}
        >
          {availableCategories.map((cat) => {
            const isSelected = activeCategory.toLowerCase() === cat.toLowerCase();
            const count = getCategoryCount(cat);
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryTab, isSelected && styles.categoryTabActive]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.75}
              >
                <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextActive]}>
                  {cat}
                </Text>
                <View
                  style={[
                    styles.categoryCountPill,
                    isSelected && styles.categoryCountPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryCountPillText,
                      isSelected && styles.categoryCountPillTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Products Content */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loaderText}>Loading Inventory...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>
            {activeCategory === "All"
              ? "No Products Found"
              : `No Products in "${activeCategory}"`}
          </Text>
          <Text style={styles.emptySub}>
            {activeCategory === "All"
              ? "No catalog items match your search."
              : `You haven't added any products to the ${activeCategory} category yet.`}
          </Text>

          {activeCategory !== "All" && (
            <TouchableOpacity
              style={styles.addCategoryBtn}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/add",
                  params: { category: activeCategory },
                } as any)
              }
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={18} color="#FFFFFF" />
              <Text style={styles.addCategoryBtnText}>
                Add Product to {activeCategory}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activeCategory === "All" ? (
            // Grouped By Category View
            Object.keys(groupedProducts).map((catName) => {
              const catItems = groupedProducts[catName];
              return (
                <View key={catName} style={styles.categorySection}>
                  <View style={styles.categorySectionHeader}>
                    <View style={styles.categoryTitleRow}>
                      <Ionicons
                        name={getCategoryIcon(catName) as any}
                        size={17}
                        color="#000000"
                      />
                      <Text style={styles.categorySectionTitle}>
                        {catName.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.categorySectionBadge}>
                      <Text style={styles.categorySectionBadgeText}>
                        {catItems.length} {catItems.length === 1 ? "item" : "items"}
                      </Text>
                    </View>
                  </View>

                  {catItems.map((item) => renderProductCard(item))}
                </View>
              );
            })
          ) : (
            // Single Category View
            <View style={styles.categorySection}>
              <View style={styles.categorySectionHeader}>
                <View style={styles.categoryTitleRow}>
                  <Ionicons
                    name={getCategoryIcon(activeCategory) as any}
                    size={17}
                    color="#000000"
                  />
                  <Text style={styles.categorySectionTitle}>
                    {activeCategory.toUpperCase()} CATALOG
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.categoryAddQuickBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/add",
                      params: { category: activeCategory },
                    } as any)
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={14} color="#000000" />
                  <Text style={styles.categoryAddQuickBtnText}>Add More</Text>
                </TouchableOpacity>
              </View>

              {filtered.map((item) => renderProductCard(item))}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 10,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#000000",
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000000",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  productThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  productCategory: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bestsellerBadge: {
    backgroundColor: "#000000",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  bestsellerText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
    marginTop: 2,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000000",
    marginTop: 3,
  },
  packSizes: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  categoryTabsContainer: {
    height: 48,
    marginBottom: 6,
  },
  categoryTabsScroll: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: "center",
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 6,
    height: 36,
  },
  categoryTabActive: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  categoryTabTextActive: {
    color: "#FFFFFF",
  },
  categoryCountPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  categoryCountPillActive: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
  },
  categoryCountPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
  },
  categoryCountPillTextActive: {
    color: "#FFFFFF",
  },
  categorySection: {
    marginBottom: 20,
  },
  categorySectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  categoryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categorySectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 0.5,
  },
  categorySectionBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  categorySectionBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#000000",
  },
  categoryAddQuickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  categoryAddQuickBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#000000",
  },
  addCategoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 16,
    gap: 8,
  },
  addCategoryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
