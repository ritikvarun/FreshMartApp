import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Linking,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ENDPOINTS } from "../../config/api";

interface ShopItem {
  _id: string;
  name: string;
  ownerName: string;
  phone: string;
  category: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    landmark?: string;
  };
  isOpen?: boolean;
  image?: string;
  status: string;
}

const CATEGORIES = [
  "All",
  "Building Material",
  "Hardware & Paints",
  "Grocery & Agro Supplies",
  "General",
];

export default function ShopsListScreen() {
  const router = useRouter();
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchShops();
  }, [selectedCategory]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      let url = ENDPOINTS.SHOPS.LIST;
      if (selectedCategory !== "All") {
        url += `?category=${encodeURIComponent(selectedCategory)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setShops(data.shops || []);
      }
    } catch (err) {
      console.warn("Error fetching shops:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string, name: string) => {
    if (!phone) {
      Alert.alert("Notice", "Shop phone number is not available.");
      return;
    }
    const cleanNumber = phone.replace(/[^0-9+]/g, "");
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert("Unable to Call", "Could not open phone dialer.");
    });
  };

  const handleWhatsApp = (phone: string, name: string) => {
    if (!phone) {
      Alert.alert("Notice", "Shop contact is not available.");
      return;
    }
    const cleanNumber = phone.replace(/[^0-9]/g, "");
    const formatted = cleanNumber.startsWith("91") ? cleanNumber : `91${cleanNumber}`;
    const text = encodeURIComponent(
      `Namaste ${name}! Maine aapki shop FreshMart app par dekhi. Mujhe materials/products ke baare me inquiry karni hai.`
    );
    const url = `whatsapp://send?phone=${formatted}&text=${text}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to web link
          Linking.openURL(`https://wa.me/${formatted}?text=${text}`);
        }
      })
      .catch(() => {
        Alert.alert("WhatsApp Unavailable", "Could not open WhatsApp.");
      });
  };

  const filteredShops = shops.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = s.name.toLowerCase().includes(q);
    const streetMatch = s.address?.street?.toLowerCase().includes(q);
    const cityMatch = s.address?.city?.toLowerCase().includes(q);
    const catMatch = s.category?.toLowerCase().includes(q);
    return nameMatch || streetMatch || cityMatch || catMatch;
  });

  const renderShopCard = ({ item }: { item: ShopItem }) => {
    const addressStr = [
      item.address?.street,
      item.address?.landmark,
      item.address?.city,
      item.address?.pinCode,
    ]
      .filter(Boolean)
      .join(", ");

    return (
      <View style={styles.card}>
        <View style={styles.cardImageContainer}>
          <Image
            source={{
              uri:
                item.image ||
                "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80",
            }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category || "Store"}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.isOpen ? "#10B981" : "#EF4444" }]}>
            <Text style={styles.statusBadgeText}>{item.isOpen ? "OPEN NOW" : "CLOSED"}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.nameRow}>
            <Text style={styles.shopName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>

          <View style={styles.ownerRow}>
            <Ionicons name="person-outline" size={13} color="#6B7280" />
            <Text style={styles.ownerText}>Prop: {item.ownerName || "Merchant"}</Text>
          </View>

          <View style={styles.addressRow}>
            <Ionicons name="location-sharp" size={15} color="#EF4444" style={styles.addressIcon} />
            <Text style={styles.addressText} numberOfLines={2}>
              {addressStr || "Address details on store profile"}
            </Text>
          </View>

          {/* Quick Action Buttons: Call, Inquiry & View Materials */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => handleCall(item.phone, item.name)}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={15} color="#FFFFFF" />
              <Text style={styles.callBtnText}>Call Shop</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.whatsappBtn}
              onPress={() => handleWhatsApp(item.phone, item.name)}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
              <Text style={styles.whatsappBtnText}>Inquiry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewMaterialsBtn}
              onPress={() => router.push(`/(root)/shop/${item._id}` as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.viewMaterialsText}>Materials</Text>
              <Ionicons name="chevron-forward" size={14} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Verified Shops & Suppliers</Text>
          <Text style={styles.headerSub}>Find local materials, call directly or order</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search by shop name, address or material..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                style={[styles.catPill, isSelected && styles.catPillActive]}
              >
                <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Shops List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Loading verified local shops...</Text>
        </View>
      ) : filteredShops.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="storefront-outline" size={54} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Shops Found</Text>
          <Text style={styles.emptySub}>Try searching with a different name or category.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredShops}
          keyExtractor={(item) => item._id}
          renderItem={renderShopCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  headerSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  categoriesWrapper: {
    marginBottom: 10,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  catPillActive: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  catPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  catPillTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImageContainer: {
    height: 130,
    width: "100%",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(17, 24, 39, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  statusBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  cardContent: {
    padding: 14,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shopName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    marginRight: 6,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
  },
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  ownerText: {
    fontSize: 12,
    color: "#6B7280",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 6,
  },
  addressIcon: {
    marginRight: 4,
    marginTop: 2,
  },
  addressText: {
    fontSize: 12,
    color: "#4B5563",
    flex: 1,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 8,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 5,
  },
  callBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16A34A",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 5,
  },
  whatsappBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  viewMaterialsBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 3,
  },
  viewMaterialsText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#374151",
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
  },
});
