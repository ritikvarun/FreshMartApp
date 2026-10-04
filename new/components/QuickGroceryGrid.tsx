import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = 16;
const GAP = 10;
const ITEM_WIDTH = Math.floor((width - HORIZONTAL_PADDING * 2 - GAP * 3) / 4);

export interface GroceryCategoryItem {
  id: string;
  title: string;
  category: string;
  image: any;
}

export const GROCERY_KITCHEN_ITEMS: GroceryCategoryItem[] = [
  {
    id: "gk1",
    title: "Vegetables &\nFruits",
    category: "Vegetables",
    image: require("../assets/images/quick_categories/veg_fruits.png"),
  },
  {
    id: "gk2",
    title: "Atta, Rice &\nDal",
    category: "Atta & Dal",
    image: require("../assets/images/quick_categories/atta_rice_dal.png"),
  },
  {
    id: "gk3",
    title: "Oil, Ghee &\nMasala",
    category: "Oil & Ghee",
    image: require("../assets/images/quick_categories/oil_ghee_masala.png"),
  },
  {
    id: "gk4",
    title: "Dairy, Bread &\nEggs",
    category: "Dairy",
    image: require("../assets/images/quick_categories/dairy_bread_eggs.png"),
  },
  {
    id: "gk5",
    title: "Bakery &\nBiscuits",
    category: "Bakery",
    image: require("../assets/images/quick_categories/bakery_biscuits.png"),
  },
  {
    id: "gk6",
    title: "Dry Fruits &\nCereals",
    category: "Dry Fruits",
    image: require("../assets/images/quick_categories/dry_fruits_cereals.png"),
  },
  {
    id: "gk7",
    title: "Chicken, Meat\n& Fish",
    category: "Meat & Fish",
    image: require("../assets/images/quick_categories/chicken_meat_fish.png"),
  },
  {
    id: "gk8",
    title: "Kitchenware &\nAppliances",
    category: "Kitchenware",
    image: require("../assets/images/quick_categories/kitchenware.png"),
  },
];

export const SNACKS_DRINKS_ITEMS: GroceryCategoryItem[] = [
  {
    id: "sd1",
    title: "Chips &\nNamkeen",
    category: "Snacks",
    image: require("../assets/images/quick_categories/chips_namkeen.png"),
  },
  {
    id: "sd2",
    title: "Sweets &\nChocolates",
    category: "Sweets",
    image: require("../assets/images/quick_categories/sweets_chocolates.png"),
  },
  {
    id: "sd3",
    title: "Drinks &\nJuices",
    category: "Drinks",
    image: require("../assets/images/quick_categories/drinks_juices.png"),
  },
  {
    id: "sd4",
    title: "Tea, Coffee &\nMilk Drinks",
    category: "Beverages",
    image: require("../assets/images/quick_categories/tea_coffee.png"),
  },
  {
    id: "sd5",
    title: "Instant\nFood",
    category: "Instant Food",
    image: require("../assets/images/quick_categories/instant_food.png"),
  },
  {
    id: "sd6",
    title: "Sauces &\nSpreads",
    category: "Sauces",
    image: require("../assets/images/quick_categories/sauces_spreads.png"),
  },
  {
    id: "sd7",
    title: "Paan\nCorner",
    category: "Paan Corner",
    image: require("../assets/images/quick_categories/paan_corner.png"),
  },
  {
    id: "sd8",
    title: "Ice Creams &\nMore",
    category: "Ice Creams",
    image: require("../assets/images/quick_categories/ice_creams.png"),
  },
];

interface QuickGroceryGridProps {
  onSelectCategory?: (title: string, category: string) => void;
}

export default function QuickGroceryGrid({ onSelectCategory }: QuickGroceryGridProps) {
  const renderItem = (item: GroceryCategoryItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.itemContainer}
      activeOpacity={0.78}
      onPress={() => onSelectCategory && onSelectCategory(item.title.replace("\n", " "), item.category)}
    >
      <View style={styles.cardBox}>
        <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
      </View>
      <Text style={styles.itemLabel} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      {/* Section 1: Grocery & Kitchen */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Grocery & Kitchen</Text>
        <View style={styles.gridRow}>
          {GROCERY_KITCHEN_ITEMS.map(renderItem)}
        </View>
      </View>

      {/* Section 2: Snacks & Drinks */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Snacks & Drinks</Text>
        <View style={styles.gridRow}>
          {SNACKS_DRINKS_ITEMS.map(renderItem)}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginVertical: 14,
  },
  sectionBlock: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    alignItems: "center",
  },
  cardBox: {
    width: ITEM_WIDTH,
    height: Math.round(ITEM_WIDTH * 0.96),
    borderRadius: 16,
    backgroundColor: "#E5F3F3",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  itemLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 14,
    height: 28,
  },
});
