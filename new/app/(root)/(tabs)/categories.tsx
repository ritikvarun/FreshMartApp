import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCart, ProductItem } from "../../../context/CartContext";
import { useSaved } from "../../../context/SavedContext";
import { ENDPOINTS } from "../../../config/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = 16;
const GRID_GAP = 10;
const FOUR_COL_WIDTH = Math.floor(
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GRID_GAP * 3) / 4
);
const TWO_COL_WIDTH = Math.floor(
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - 12) / 2
);

export interface CategoryItem {
  id: string;
  key: string;
  title: string;
  image: any;
  bgColor?: string;
}

// ── Section 1: Grocery & Kitchen (Exact 8 items matching screenshot) ────────
export const GROCERY_KITCHEN_CATEGORIES: CategoryItem[] = [
  {
    id: "gk1",
    key: "Vegetables",
    title: "Vegetables &\nFruits",
    image: require("../../../assets/images/quick_categories/veg_fruits.png"),
    bgColor: "#F0FDF4",
  },
  {
    id: "gk2",
    key: "Atta & Dal",
    title: "Atta, Rice &\nDal",
    image: require("../../../assets/images/quick_categories/atta_rice_dal.png"),
    bgColor: "#FFFBEB",
  },
  {
    id: "gk3",
    key: "Oil & Ghee",
    title: "Oil, Ghee &\nMasala",
    image: require("../../../assets/images/quick_categories/oil_ghee_masala.png"),
    bgColor: "#FFF7ED",
  },
  {
    id: "gk4",
    key: "Dairy",
    title: "Dairy, Bread &\nEggs",
    image: require("../../../assets/images/quick_categories/dairy_bread_eggs.png"),
    bgColor: "#FEFCE8",
  },
  {
    id: "gk5",
    key: "Bakery",
    title: "Bakery &\nBiscuits",
    image: require("../../../assets/images/quick_categories/bakery_biscuits.png"),
    bgColor: "#FFFBEB",
  },
  {
    id: "gk6",
    key: "Dry Fruits",
    title: "Dry Fruits &\nCereals",
    image: require("../../../assets/images/quick_categories/dry_fruits_cereals.png"),
    bgColor: "#FEF9C3",
  },
  {
    id: "gk7",
    key: "Meat & Fish",
    title: "Chicken, Meat &\nFish",
    image: require("../../../assets/images/quick_categories/chicken_meat_fish.png"),
    bgColor: "#FFF1F2",
  },
  {
    id: "gk8",
    key: "Kitchenware",
    title: "Kitchenware &\nAppliances",
    image: require("../../../assets/images/quick_categories/kitchenware.png"),
    bgColor: "#F8FAFC",
  },
];

// ── Section 2: Snacks & Drinks (Exact 8 items matching screenshot) ──────────
export const SNACKS_DRINKS_CATEGORIES: CategoryItem[] = [
  {
    id: "sd1",
    key: "Snacks",
    title: "Chips &\nNamkeen",
    image: require("../../../assets/images/quick_categories/chips_namkeen.png"),
    bgColor: "#FFF7ED",
  },
  {
    id: "sd2",
    key: "Sweets",
    title: "Sweets &\nChocolates",
    image: require("../../../assets/images/quick_categories/sweets_chocolates.png"),
    bgColor: "#FDF2F8",
  },
  {
    id: "sd3",
    key: "Drinks",
    title: "Drinks &\nJuices",
    image: require("../../../assets/images/quick_categories/drinks_juices.png"),
    bgColor: "#F0F9FF",
  },
  {
    id: "sd4",
    key: "Beverages",
    title: "Tea, Coffee &\nMilk Drinks",
    image: require("../../../assets/images/quick_categories/tea_coffee.png"),
    bgColor: "#FAF5FF",
  },
  {
    id: "sd5",
    key: "Instant Food",
    title: "Instant\nFood",
    image: require("../../../assets/images/quick_categories/instant_food.png"),
    bgColor: "#FEF2F2",
  },
  {
    id: "sd6",
    key: "Sauces",
    title: "Sauces &\nSpreads",
    image: require("../../../assets/images/quick_categories/sauces_spreads.png"),
    bgColor: "#FFF7ED",
  },
  {
    id: "sd7",
    key: "Paan Corner",
    title: "Paan\nCorner",
    image: require("../../../assets/images/quick_categories/paan_corner.png"),
    bgColor: "#F0FDF4",
  },
  {
    id: "sd8",
    key: "Ice Creams",
    title: "Ice Creams &\nMore",
    image: require("../../../assets/images/quick_categories/ice_creams.png"),
    bgColor: "#ECFEFF",
  },
];

// Combined for easy lookup
export const ALL_CATEGORIES = [
  ...GROCERY_KITCHEN_CATEGORIES,
  ...SNACKS_DRINKS_CATEGORIES,
];

// ── Complete Catalog Products for every single Category ─────────────────────
const CATEGORY_PRODUCTS_MAP: Record<string, any[]> = {
  Vegetables: [
    {
      _id: "vg_1",
      name: "Fresh Hybrid Tomatoes",
      category: "Vegetables",
      price: 38,
      mrp: 50,
      unit: "1 kg",
      image1: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80",
    },
    {
      _id: "vg_2",
      name: "Farm Fresh Potatoes",
      category: "Vegetables",
      price: 32,
      mrp: 45,
      unit: "1 kg",
      image1: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80",
    },
    {
      _id: "vg_3",
      name: "Crisp Red Onions",
      category: "Vegetables",
      price: 42,
      mrp: 60,
      unit: "1 kg",
      image1: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80",
    },
    {
      _id: "vg_4",
      name: "Organic Green Coriander",
      category: "Vegetables",
      price: 18,
      mrp: 25,
      unit: "100 g",
      image1: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&q=80",
    },
    {
      _id: "vg_5",
      name: "Fresh Green Capsicum",
      category: "Vegetables",
      price: 45,
      mrp: 60,
      unit: "500 g",
      image1: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&q=80",
    },
    {
      _id: "vg_6",
      name: "Royal Gala Apples",
      category: "Vegetables",
      price: 120,
      mrp: 160,
      unit: "4 pcs (500 g)",
      image1: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80",
    },
    {
      _id: "vg_7",
      name: "Robusta Fresh Bananas",
      category: "Vegetables",
      price: 48,
      mrp: 60,
      unit: "1 kg (6 pcs)",
      image1: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80",
    },
    {
      _id: "vg_8",
      name: "Sweet Red Pomegranate",
      category: "Vegetables",
      price: 110,
      mrp: 145,
      unit: "2 pcs (500 g)",
      image1: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80",
    },
  ],
  "Atta & Dal": [
    {
      _id: "at_1",
      name: "Aashirvaad Shudh Chakki Atta",
      category: "Atta & Dal",
      price: 245,
      mrp: 290,
      unit: "5 kg",
      image1: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80",
    },
    {
      _id: "at_2",
      name: "Tata Sampann Toor Dal",
      category: "Atta & Dal",
      price: 175,
      mrp: 195,
      unit: "1 kg",
      image1: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
    },
    {
      _id: "at_3",
      name: "Fortune Rozana Basmati Rice",
      category: "Atta & Dal",
      price: 99,
      mrp: 125,
      unit: "1 kg",
      image1: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
    },
    {
      _id: "at_4",
      name: "Tata Sampann Moong Dal",
      category: "Atta & Dal",
      price: 140,
      mrp: 160,
      unit: "1 kg",
      image1: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
    },
    {
      _id: "at_5",
      name: "India Gate Super Basmati Rice",
      category: "Atta & Dal",
      price: 490,
      mrp: 580,
      unit: "5 kg",
      image1: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
    },
  ],
  "Oil & Ghee": [
    {
      _id: "og_1",
      name: "Fortune Sunlite Refined Oil",
      category: "Oil & Ghee",
      price: 148,
      mrp: 175,
      unit: "1 L",
      image1: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80",
    },
    {
      _id: "og_2",
      name: "Amul Pure Cow Ghee",
      category: "Oil & Ghee",
      price: 310,
      mrp: 340,
      unit: "500 ml",
      image1: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80",
    },
    {
      _id: "og_3",
      name: "Everest Turmeric Powder",
      category: "Oil & Ghee",
      price: 45,
      mrp: 52,
      unit: "200 g",
      image1: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80",
    },
    {
      _id: "og_4",
      name: "MDH Garam Masala Blend",
      category: "Oil & Ghee",
      price: 85,
      mrp: 98,
      unit: "100 g",
      image1: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80",
    },
  ],
  Dairy: [
    {
      _id: "dy_1",
      name: "Amul Taaza Toned Fresh Milk",
      category: "Dairy",
      price: 54,
      mrp: 56,
      unit: "1 L",
      image1: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80",
    },
    {
      _id: "dy_2",
      name: "Amul Butter - Pasteurized",
      category: "Dairy",
      price: 58,
      mrp: 60,
      unit: "100 g",
      image1: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80",
    },
    {
      _id: "dy_3",
      name: "Brown Multigrain Bread",
      category: "Dairy",
      price: 45,
      mrp: 50,
      unit: "400 g",
      image1: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
    },
    {
      _id: "dy_4",
      name: "Farm Fresh Brown Eggs (Pack of 6)",
      category: "Dairy",
      price: 68,
      mrp: 80,
      unit: "6 pcs",
      image1: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&q=80",
    },
    {
      _id: "dy_5",
      name: "Amul Malai Fresh Paneer",
      category: "Dairy",
      price: 90,
      mrp: 95,
      unit: "200 g",
      image1: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80",
    },
  ],
  Bakery: [
    {
      _id: "bk_1",
      name: "Britannia Good Day Cashew Cookies",
      category: "Bakery",
      price: 40,
      mrp: 45,
      unit: "200 g",
      image1: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80",
    },
    {
      _id: "bk_2",
      name: "Parle-G Original Glucose Biscuits",
      category: "Bakery",
      price: 25,
      mrp: 30,
      unit: "250 g",
      image1: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&q=80",
    },
    {
      _id: "bk_3",
      name: "Sunfeast Dark Fantasy Choco Fills",
      category: "Bakery",
      price: 95,
      mrp: 120,
      unit: "300 g",
      image1: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80",
    },
    {
      _id: "bk_4",
      name: "Oreo Double Creme Vanilla Biscuits",
      category: "Bakery",
      price: 35,
      mrp: 40,
      unit: "120 g",
      image1: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80",
    },
  ],
  "Dry Fruits": [
    {
      _id: "df_1",
      name: "California Almonds Badam",
      category: "Dry Fruits",
      price: 225,
      mrp: 280,
      unit: "250 g",
      image1: "https://images.unsplash.com/photo-1508061252445-564467e24631?w=600&q=80",
    },
    {
      _id: "df_2",
      name: "Whole Cashews Kaju Premium",
      category: "Dry Fruits",
      price: 245,
      mrp: 300,
      unit: "250 g",
      image1: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&q=80",
    },
    {
      _id: "df_3",
      name: "Kellogg's Corn Flakes Original",
      category: "Dry Fruits",
      price: 185,
      mrp: 215,
      unit: "475 g",
      image1: "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=600&q=80",
    },
    {
      _id: "df_4",
      name: "Quaker Rolled Oats",
      category: "Dry Fruits",
      price: 190,
      mrp: 225,
      unit: "1 kg",
      image1: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80",
    },
  ],
  "Meat & Fish": [
    {
      _id: "mf_1",
      name: "Fresh Chicken Curry Cut Skinless",
      category: "Meat & Fish",
      price: 165,
      mrp: 200,
      unit: "500 g",
      image1: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&q=80",
    },
    {
      _id: "mf_2",
      name: "Fresh Chicken Boneless Breast",
      category: "Meat & Fish",
      price: 210,
      mrp: 250,
      unit: "500 g",
      image1: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&q=80",
    },
    {
      _id: "mf_3",
      name: "Fresh Rohu Fish Bengali Cut",
      category: "Meat & Fish",
      price: 195,
      mrp: 230,
      unit: "500 g",
      image1: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&q=80",
    },
  ],
  Kitchenware: [
    {
      _id: "kw_1",
      name: "Stainless Steel Water Bottle",
      category: "Kitchenware",
      price: 299,
      mrp: 450,
      unit: "1 L",
      image1: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80",
    },
    {
      _id: "kw_2",
      name: "Pigeon Non-Stick Fry Pan",
      category: "Kitchenware",
      price: 449,
      mrp: 695,
      unit: "24 cm",
      image1: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80",
    },
    {
      _id: "kw_3",
      name: "Prestige Electric Kettle",
      category: "Kitchenware",
      price: 699,
      mrp: 1195,
      unit: "1.5 L",
      image1: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&q=80",
    },
  ],
  Snacks: [
    {
      _id: "sn_1",
      name: "Lay's India's Magic Masala Chips",
      category: "Snacks",
      price: 20,
      mrp: 20,
      unit: "50 g",
      image1: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&q=80",
    },
    {
      _id: "sn_2",
      name: "Kurkure Masala Munch Crunchy",
      category: "Snacks",
      price: 20,
      mrp: 20,
      unit: "75 g",
      image1: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=600&q=80",
    },
    {
      _id: "sn_3",
      name: "Haldiram's Bhujia Sev",
      category: "Snacks",
      price: 55,
      mrp: 60,
      unit: "200 g",
      image1: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&q=80",
    },
    {
      _id: "sn_4",
      name: "Doritos Cheese Nacho Chips",
      category: "Snacks",
      price: 30,
      mrp: 35,
      unit: "60 g",
      image1: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&q=80",
    },
  ],
  Sweets: [
    {
      _id: "sw_1",
      name: "Cadbury Dairy Milk Silk",
      category: "Sweets",
      price: 165,
      mrp: 185,
      unit: "150 g",
      image1: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=80",
    },
    {
      _id: "sw_2",
      name: "Bikano Gulab Jamun Tin",
      category: "Sweets",
      price: 220,
      mrp: 260,
      unit: "1 kg",
      image1: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    },
    {
      _id: "sw_3",
      name: "Ferrero Rocher Box",
      category: "Sweets",
      price: 320,
      mrp: 370,
      unit: "8 pcs",
      image1: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=80",
    },
    {
      _id: "sw_4",
      name: "KitKat 4 Finger Chocolate",
      category: "Sweets",
      price: 30,
      mrp: 35,
      unit: "38 g",
      image1: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=80",
    },
  ],
  Drinks: [
    {
      _id: "dr_1",
      name: "Coca-Cola Zero Sugar Can",
      category: "Drinks",
      price: 40,
      mrp: 40,
      unit: "300 ml",
      image1: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80",
    },
    {
      _id: "dr_2",
      name: "Real Fruit Mixed Fruit Juice",
      category: "Drinks",
      price: 110,
      mrp: 130,
      unit: "1 L",
      image1: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&q=80",
    },
    {
      _id: "dr_3",
      name: "Thums Up Refreshing Can",
      category: "Drinks",
      price: 40,
      mrp: 40,
      unit: "300 ml",
      image1: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80",
    },
    {
      _id: "dr_4",
      name: "Sprite Lime Soda Bottle",
      category: "Drinks",
      price: 40,
      mrp: 40,
      unit: "750 ml",
      image1: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80",
    },
  ],
  Beverages: [
    {
      _id: "bv_1",
      name: "Tata Tea Gold Royal Blend",
      category: "Beverages",
      price: 155,
      mrp: 180,
      unit: "250 g",
      image1: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80",
    },
    {
      _id: "bv_2",
      name: "Nescafé Classic Instant Coffee",
      category: "Beverages",
      price: 95,
      mrp: 105,
      unit: "50 g",
      image1: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80",
    },
    {
      _id: "bv_3",
      name: "Red Label Strong CTC Tea",
      category: "Beverages",
      price: 240,
      mrp: 275,
      unit: "500 g",
      image1: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80",
    },
  ],
  "Instant Food": [
    {
      _id: "if_1",
      name: "Maggi 2-Minute Masala Noodles",
      category: "Instant Food",
      price: 56,
      mrp: 60,
      unit: "Pack of 4 (280 g)",
      image1: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&q=80",
    },
    {
      _id: "if_2",
      name: "Yippee! Magic Masala Noodles",
      category: "Instant Food",
      price: 52,
      mrp: 56,
      unit: "Pack of 4 (260 g)",
      image1: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&q=80",
    },
    {
      _id: "if_3",
      name: "Chings Secret Veg Hakka Noodles",
      category: "Instant Food",
      price: 35,
      mrp: 40,
      unit: "150 g",
      image1: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&q=80",
    },
  ],
  Sauces: [
    {
      _id: "sc_1",
      name: "Kissan Fresh Tomato Ketchup",
      category: "Sauces",
      price: 125,
      mrp: 150,
      unit: "950 g",
      image1: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80",
    },
    {
      _id: "sc_2",
      name: "Nutella Hazelnut Cocoa Spread",
      category: "Sauces",
      price: 340,
      mrp: 380,
      unit: "350 g",
      image1: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&q=80",
    },
    {
      _id: "sc_3",
      name: "Veeba Real Creamy Mayonnaise",
      category: "Sauces",
      price: 75,
      mrp: 89,
      unit: "250 g",
      image1: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    },
  ],
  "Paan Corner": [
    {
      _id: "pc_1",
      name: "Pass Pass Sweet Mint Mukhwas",
      category: "Paan Corner",
      price: 40,
      mrp: 50,
      unit: "100 g",
      image1: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&q=80",
    },
    {
      _id: "pc_2",
      name: "Happy Dent Spearmint Gum",
      category: "Paan Corner",
      price: 50,
      mrp: 60,
      unit: "Pack of 15",
      image1: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80",
    },
    {
      _id: "pc_3",
      name: "Center Fresh Mint Chewing Gum",
      category: "Paan Corner",
      price: 40,
      mrp: 50,
      unit: "Pack of 20",
      image1: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80",
    },
  ],
  "Ice Creams": [
    {
      _id: "ic_1",
      name: "Amul Gold Vanilla Tub",
      category: "Ice Creams",
      price: 160,
      mrp: 180,
      unit: "1 L",
      image1: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&q=80",
    },
    {
      _id: "ic_2",
      name: "Kwality Choco Brownie Fudge Tub",
      category: "Ice Creams",
      price: 230,
      mrp: 275,
      unit: "700 ml",
      image1: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80",
    },
    {
      _id: "ic_3",
      name: "Cornetto Double Chocolate Cone",
      category: "Ice Creams",
      price: 80,
      mrp: 90,
      unit: "Pack of 2",
      image1: "https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?w=600&q=80",
    },
  ],
};

export default function CategoriesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const { addToCart, updateQuantity, cartItems, cartCount } = useCart();
  const { isSaved, toggleSave } = useSaved();

  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(
    null
  );
  const [backendProducts, setBackendProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // If navigated with category query param, open that category
  useEffect(() => {
    if (params.category) {
      const match = ALL_CATEGORIES.find(
        (c) =>
          c.key.toLowerCase() === params.category?.toLowerCase() ||
          c.title.toLowerCase().includes(params.category?.toLowerCase() || "")
      );
      if (match) {
        setSelectedCategory(match);
      }
    }
  }, [params.category]);

  // Handle hardware back button on Android
  useEffect(() => {
    const onBackPress = () => {
      if (selectedCategory) {
        setSelectedCategory(null);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => subscription.remove();
  }, [selectedCategory]);

  // Load backend products
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch(ENDPOINTS.PRODUCTS.LIST);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setBackendProducts(data);
          }
        }
      } catch (err) {
        console.warn("Categories fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Compute products for selected category
  const activeProducts = useMemo(() => {
    if (!selectedCategory) return [];

    const targetKey = selectedCategory.key.toLowerCase().trim();
    const targetTitle = selectedCategory.title
      .toLowerCase()
      .replace("\n", " ")
      .trim();

    const matchedBackend = backendProducts.filter((p: any) => {
      const pCat = String(p.category || "").toLowerCase().trim();
      return (
        pCat === targetKey ||
        pCat === targetTitle ||
        pCat.includes(targetKey) ||
        targetKey.includes(pCat) ||
        pCat.includes(targetTitle) ||
        targetTitle.includes(pCat)
      );
    });

    const backendFormatted = matchedBackend.map((p) => ({
      _id: p._id,
      name: p.name,
      category: p.category,
      price: Number(p.price || 0),
      mrp: Math.round(Number(p.price || 0) * 1.25),
      unit: p.sizes && p.sizes.length > 0 ? p.sizes[0] : "1 unit",
      image1: p.image1,
      rawProduct: p,
    }));

    const fallbacks = CATEGORY_PRODUCTS_MAP[selectedCategory.key] || [];
    const backendNames = new Set(
      backendFormatted.map((b) => b.name?.toLowerCase().trim())
    );
    const uniqueFallbacks = fallbacks
      .filter((f) => !backendNames.has(f.name?.toLowerCase().trim()))
      .map((f) => ({ ...f, rawProduct: f }));

    return [...backendFormatted, ...uniqueFallbacks];
  }, [selectedCategory, backendProducts]);

  const getItemQuantity = (productId: string) => {
    const item = cartItems.find((ci) => ci.productId === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product: any) => {
    const productItem: ProductItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      image1: product.image1,
      category: product.category,
      sizes: [product.unit || "1 unit"],
    };
    addToCart(productItem, product.unit || "1 unit");
  };

  // Render 4-column category card
  const renderCategoryCard = (item: CategoryItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.gridItemContainer}
      activeOpacity={0.78}
      onPress={() => setSelectedCategory(item)}
    >
      <View style={styles.cardBox}>
        <Image
          source={item.image}
          style={styles.cardImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.itemLabel} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Sub-Page: When a category is tapped, show 2-column products ── */}
      {selectedCategory ? (
        <View style={styles.subPageContainer}>
          {/* Subpage Header with Back Arrow */}
          <View style={styles.subHeader}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setSelectedCategory(null)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>

            <View style={styles.subHeaderTitles}>
              <Text style={styles.subHeaderTitle} numberOfLines={1}>
                {selectedCategory.title.replace("\n", " ")}
              </Text>
              <Text style={styles.subHeaderCount}>
                {activeProducts.length} items available
              </Text>
            </View>

            <TouchableOpacity
              style={styles.cartBtn}
              onPress={() => router.push("/(root)/cart" as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="cart-outline" size={22} color="#0F172A" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Subpage Scroll Content with 2-Grid Items */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.subScrollContent}
          >
            {/* Top Category Tag Banner */}
            <View style={styles.subBanner}>
              <View style={styles.subBannerTextCol}>
                <Text style={styles.subBannerTitle}>
                  {selectedCategory.title.replace("\n", " ")}
                </Text>
                <View style={styles.subBannerTimeRow}>
                  <Ionicons name="flash" size={12} color="#059669" />
                  <Text style={styles.subBannerTimeText}>
                    Delivery in 10 minutes
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.subBannerImageBox,
                  { backgroundColor: selectedCategory.bgColor || "#F1F5F9" },
                ]}
              >
                <Image
                  source={selectedCategory.image}
                  style={styles.subBannerImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color="#059669" size="small" />
                <Text style={styles.loadingText}>Loading fresh items...</Text>
              </View>
            ) : activeProducts.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="basket-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No items currently listed</Text>
                <Text style={styles.emptySub}>
                  Please check back soon or browse another category.
                </Text>
              </View>
            ) : (
              /* 2-Column Product Grid */
              <View style={styles.twoColumnGrid}>
                {activeProducts.map((product) => {
                  const qty = getItemQuantity(product._id);
                  const isItemFav = isSaved(product._id);
                  const discount =
                    product.mrp && product.mrp > product.price
                      ? Math.round(
                          ((product.mrp - product.price) / product.mrp) * 100
                        )
                      : 0;

                  return (
                    <TouchableOpacity
                      key={product._id}
                      style={styles.twoColCard}
                      activeOpacity={0.88}
                      onPress={() =>
                        router.push({
                          pathname: "/(root)/product/[id]",
                          params: { id: product._id },
                        })
                      }
                    >
                      {/* Media Box */}
                      <View style={styles.twoColMediaBox}>
                        {discount > 0 && (
                          <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>
                              {discount}% OFF
                            </Text>
                          </View>
                        )}

                        <TouchableOpacity
                          style={styles.cardHeartBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            toggleSave(product.rawProduct || product);
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={isItemFav ? "heart" : "heart-outline"}
                            size={16}
                            color={isItemFav ? "#E11D48" : "#94A3B8"}
                          />
                        </TouchableOpacity>

                        <Image
                          source={{ uri: product.image1 }}
                          style={styles.twoColProductImage}
                          resizeMode="contain"
                        />
                      </View>

                      {/* Delivery Tag */}
                      <View style={styles.deliveryTagRow}>
                        <Ionicons name="flash" size={10} color="#059669" />
                        <Text style={styles.deliveryTagText}>10 MINS</Text>
                      </View>

                      {/* Product Title */}
                      <Text style={styles.twoColTitle} numberOfLines={2}>
                        {product.name}
                      </Text>

                      {/* Unit / Weight */}
                      <Text style={styles.twoColUnit}>{product.unit}</Text>

                      {/* Price & Add to Cart Counter */}
                      <View style={styles.twoColBottomRow}>
                        <View style={styles.priceCol}>
                          <Text style={styles.priceText}>₹{product.price}</Text>
                          {product.mrp && product.mrp > product.price ? (
                            <Text style={styles.mrpText}>₹{product.mrp}</Text>
                          ) : null}
                        </View>

                        {qty === 0 ? (
                          <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() => handleAddToCart(product)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.addBtnText}>ADD</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.qtyCounter}>
                            <TouchableOpacity
                              style={styles.qtyBtn}
                              onPress={() =>
                                updateQuantity(
                                  product._id,
                                  product.unit || "1 unit",
                                  qty - 1
                                )
                              }
                            >
                              <Ionicons
                                name="remove"
                                size={14}
                                color="#059669"
                              />
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{qty}</Text>
                            <TouchableOpacity
                              style={styles.qtyBtn}
                              onPress={() =>
                                updateQuantity(
                                  product._id,
                                  product.unit || "1 unit",
                                  qty + 1
                                )
                              }
                            >
                              <Ionicons name="add" size={14} color="#059669" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      ) : (
        /* ── Main View: Exact 4-Column Layout Matching User Screenshot in White Theme ── */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.mainScrollContent}
        >
          {/* Main Top Header */}
          <View style={styles.mainHeader}>
            <View>
              <Text style={styles.mainHeaderTitle}>All Categories</Text>
              <Text style={styles.mainHeaderSubtitle}>
                Explore fresh groceries delivered in minutes
              </Text>
            </View>

            <TouchableOpacity
              style={styles.cartBtn}
              onPress={() => router.push("/(root)/cart" as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="cart-outline" size={22} color="#0F172A" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Section 1: Grocery & Kitchen */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Grocery & Kitchen</Text>
            <View style={styles.gridRow}>
              {GROCERY_KITCHEN_CATEGORIES.map(renderCategoryCard)}
            </View>
          </View>

          {/* Section 2: Snacks & Drinks */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Snacks & Drinks</Text>
            <View style={styles.gridRow}>
              {SNACKS_DRINKS_CATEGORIES.map(renderCategoryCard)}
            </View>
          </View>
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
  /* Main Overview Page Styles */
  mainScrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
    paddingBottom: 100,
  },
  mainHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  mainHeaderTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  mainHeaderSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  cartBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#059669",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  sectionBlock: {
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  gridItemContainer: {
    width: FOUR_COL_WIDTH,
    alignItems: "center",
  },
  cardBox: {
    width: FOUR_COL_WIDTH,
    height: Math.round(FOUR_COL_WIDTH * 0.98),
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardImage: {
    width: "82%",
    height: "82%",
  },
  itemLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "600",
    color: "#1E293B",
    textAlign: "center",
    lineHeight: 14,
    height: 28,
  },

  /* Subpage Product Grid Styles */
  subPageContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginLeft: -4,
  },
  subHeaderTitles: {
    flex: 1,
  },
  subHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  subHeaderCount: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
    marginTop: 1,
  },
  subScrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 14,
    paddingBottom: 100,
  },
  subBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  subBannerTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  subBannerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  subBannerTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  subBannerTimeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
    marginLeft: 4,
  },
  subBannerImageBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  subBannerImage: {
    width: 42,
    height: 42,
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 13,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  /* 2-Column Grid */
  twoColumnGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  twoColCard: {
    width: TWO_COL_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 8,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  twoColMediaBox: {
    width: "100%",
    height: 110,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 8,
  },
  twoColProductImage: {
    width: "82%",
    height: "82%",
  },
  discountBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#2563EB",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    zIndex: 2,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
  },
  cardHeartBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    zIndex: 2,
  },
  deliveryTagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  deliveryTagText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#059669",
    marginLeft: 3,
    letterSpacing: 0.3,
  },
  twoColTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 17,
    minHeight: 34,
  },
  twoColUnit: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 2,
    marginBottom: 6,
  },
  twoColBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceCol: {
    flex: 1,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  mrpText: {
    fontSize: 10,
    color: "#94A3B8",
    textDecorationLine: "line-through",
    marginTop: 1,
  },
  addBtn: {
    borderWidth: 1.2,
    borderColor: "#059669",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addBtnText: {
    color: "#059669",
    fontSize: 11,
    fontWeight: "800",
  },
  qtyCounter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    padding: 3,
  },
  qtyText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    marginHorizontal: 6,
  },
});
