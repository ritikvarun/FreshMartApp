import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Product from "../model/productModel.js";
import connectDb from "../config/db.js";

const sampleProducts = [
  {
    name: "Fresh Yellow Banana",
    image1: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80",
    image2: "https://images.unsplash.com/photo-1543218024-57a70143c369?w=600&auto=format&fit=crop&q=80",
    image3: "",
    image4: "",
    description: "Farm-fresh ripe yellow Cavendish bananas, naturally sweet and rich in potassium and energy.",
    price: 3.5,
    category: "Fruits",
    subCategory: "Fresh Fruits",
    sizes: ["1 kg", "2 kg"],
    date: Date.now(),
    bestseller: true,
  },
  {
    name: "Organic Mixed Farm Veggies",
    image1: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
    image2: "",
    image3: "",
    image4: "",
    description: "Crisp and pesticide-free mixed green vegetables including broccoli, carrots, bell peppers, and spinach.",
    price: 4.8,
    category: "Fresh",
    subCategory: "Vegetables",
    sizes: ["1 kg", "2 kg"],
    date: Date.now(),
    bestseller: true,
  },
  {
    name: "Natural Crunchy Snack Mix",
    image1: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80",
    image2: "",
    image3: "",
    image4: "",
    description: "Roasted almond, cashew, walnut, and cranberry mix. Perfect guilt-free healthy snack.",
    price: 5.9,
    category: "Snack",
    subCategory: "Dry Fruits",
    sizes: ["250 g", "500 g"],
    date: Date.now(),
    bestseller: false,
  },
  {
    name: "Extra Virgin Olive Oil",
    image1: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
    image2: "",
    image3: "",
    image4: "",
    description: "Cold-pressed, 100% pure Mediterranean extra virgin olive oil for salads and healthy cooking.",
    price: 12.4,
    category: "Oils",
    subCategory: "Cooking Oils",
    sizes: ["500 ml", "1 L"],
    date: Date.now(),
    bestseller: true,
  },
  {
    name: "Crisp Red Royal Gala Apples",
    image1: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80",
    image2: "",
    image3: "",
    image4: "",
    description: "Juicy, sweet, and crisp Royal Gala apples imported directly from certified organic orchards.",
    price: 6.2,
    category: "Fruits",
    subCategory: "Fresh Fruits",
    sizes: ["1 kg", "2 kg"],
    date: Date.now(),
    bestseller: true,
  },
  {
    name: "Fresh Whole Cow Milk",
    image1: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
    image2: "",
    image3: "",
    image4: "",
    description: "Pasteurized, farm-fresh whole cow milk with high protein and essential calcium.",
    price: 2.8,
    category: "Fresh",
    subCategory: "Dairy",
    sizes: ["1 L", "2 L"],
    date: Date.now(),
    bestseller: false,
  },
  {
    name: "Artisan Multigrain Bread",
    image1: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    image2: "",
    image3: "",
    image4: "",
    description: "Freshly baked artisan whole grain bread loaf with flax, oats, and sunflower seeds.",
    price: 3.2,
    category: "Snack",
    subCategory: "Bakery",
    sizes: ["400 g"],
    date: Date.now(),
    bestseller: false,
  },
  {
    name: "Organic Raw Forest Honey",
    image1: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80",
    image2: "",
    image3: "",
    image4: "",
    description: "Unfiltered, 100% natural raw wild forest honey. Rich in antioxidants and natural sweetness.",
    price: 8.5,
    category: "Oils",
    subCategory: "Organic",
    sizes: ["500 g", "1 kg"],
    date: Date.now(),
    bestseller: true,
  },
];

async function seed() {
  try {
    await connectDb();
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} products. Skipping duplicate seed.`);
      process.exit(0);
    }

    console.log("Seeding initial FreshMart products...");
    await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${sampleProducts.length} grocery products into MongoDB!`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
