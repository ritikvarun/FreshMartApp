import React, { useState, useEffect } from "react";
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
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ENDPOINTS } from "../../config/api";

export default function AdminProductsScreen() {
  const { adminToken } = useAdminAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Store Inventory</Text>
          <Text style={styles.headerSub}>{products.length} products published</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchProducts}>
          <Ionicons name="refresh-outline" size={20} color="#1A1D26" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Filter products by name or category..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Products List */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#E05315" />
          <Text style={styles.loaderText}>Loading Inventory...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Products Found</Text>
          <Text style={styles.emptySub}>No catalog items match your search.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filtered.map((item) => (
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
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
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
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1D26",
  },
  headerSub: {
    fontSize: 12,
    color: "#8B92A2",
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 10,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#1A1D26",
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    marginTop: 10,
    color: "#8B92A2",
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
    fontWeight: "700",
    color: "#1A1D26",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: "#8B92A2",
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
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  productThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
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
    fontWeight: "600",
    color: "#E05315",
    textTransform: "uppercase",
  },
  bestsellerBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  bestsellerText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#D97706",
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1D26",
    marginTop: 2,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1A1D26",
    marginTop: 3,
  },
  packSizes: {
    fontSize: 11,
    fontWeight: "400",
    color: "#8B92A2",
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
