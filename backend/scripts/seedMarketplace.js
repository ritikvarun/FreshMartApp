import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDb from "../config/db.js";
import Shop from "../model/shopModel.js";
import Product from "../model/productModel.js";
import DeliveryPartner from "../model/deliveryModel.js";

const seedMarketplace = async () => {
  try {
    await connectDb();
    console.log("Connected to MongoDB for marketplace seeding...");

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash("Pass@1234", salt);

    const initialShops = [
      {
        name: "Shree Ram Building Materials & Cement",
        ownerName: "Ramesh Sharma",
        phone: "9876543210",
        password: defaultPassword,
        email: "shreeram.materials@gmail.com",
        gstNumber: "07AAAAA0000A1Z5",
        aadhaarNumber: "123456789012",
        category: "Building Material & Cement",
        address: {
          street: "Shop 12, Main Mandi Road, Sector 4",
          city: "Delhi NCR",
          state: "Delhi",
          pinCode: "110034",
          landmark: "Near Hanuman Mandir",
          latitude: 28.6139,
          longitude: 77.209,
        },
        registrationFeePaid: true,
        registrationFeeAmount: 500,
        registrationTxnId: "TXN_SH_001",
        status: "Approved",
        isOpen: true,
        image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
        walletBalance: 2450,
      },
      {
        name: "Gupta Hardware, Paints & Sanitary",
        ownerName: "Sunil Gupta",
        phone: "9811223344",
        password: defaultPassword,
        email: "guptahardware@gmail.com",
        gstNumber: "07BBBBB1111B2Z6",
        aadhaarNumber: "234567890123",
        category: "Hardware & Paints",
        address: {
          street: "Plot 45, Industrial Area Phase 2",
          city: "Delhi NCR",
          state: "Delhi",
          pinCode: "110020",
          landmark: "Opposite Metro Pillar 112",
          latitude: 28.5355,
          longitude: 77.261,
        },
        registrationFeePaid: true,
        registrationFeeAmount: 500,
        registrationTxnId: "TXN_SH_002",
        status: "Approved",
        isOpen: true,
        image: "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800&auto=format&fit=crop&q=80",
        walletBalance: 1800,
      },
      {
        name: "Kisan Wholesale Agro & Fresh Market",
        ownerName: "Mukesh Yadav",
        phone: "9899887766",
        password: defaultPassword,
        email: "kisanfresh@gmail.com",
        gstNumber: "",
        aadhaarNumber: "345678901234",
        category: "Grocery & Agro Supplies",
        address: {
          street: "Kisan Bhawan Chowk, Badarpur Road",
          city: "Delhi NCR",
          state: "Delhi",
          pinCode: "110044",
          landmark: "Near Sabzi Mandi Gate 2",
          latitude: 28.5033,
          longitude: 77.301,
        },
        registrationFeePaid: true,
        registrationFeeAmount: 500,
        registrationTxnId: "TXN_SH_003",
        status: "Approved",
        isOpen: true,
        image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80",
        walletBalance: 3200,
      },
    ];

    for (const s of initialShops) {
      const exists = await Shop.findOne({ phone: s.phone });
      if (!exists) {
        const createdShop = await Shop.create(s);
        console.log(`Created shop: ${createdShop.name}`);
      } else {
        console.log(`Shop already exists: ${s.name}`);
      }
    }

    // Seed sample freelance delivery boy
    const sampleDelivery = {
      name: "Vikram Singh (Rider)",
      phone: "9711002233",
      password: defaultPassword,
      aadhaarNumber: "987654321098",
      drivingLicenseNumber: "DL-042022001928",
      vehicleType: "Bike",
      vehicleNumber: "DL 3S AB 4590",
      registrationFeePaid: true,
      registrationFeeAmount: 500,
      registrationTxnId: "TXN_DL_001",
      status: "Approved",
      isOnline: true,
      walletBalance: 350,
      currentLocation: {
        latitude: 28.6139,
        longitude: 77.209,
        address: "Connaught Place / Central Hub",
      },
    };

    const deliveryExists = await DeliveryPartner.findOne({ phone: sampleDelivery.phone });
    if (!deliveryExists) {
      await DeliveryPartner.create(sampleDelivery);
      console.log(`Created delivery partner: ${sampleDelivery.name}`);
    }

    // Tag products with shops if they have null shopId
    const firstShop = await Shop.findOne({ phone: "9876543210" });
    const secondShop = await Shop.findOne({ phone: "9811223344" });

    if (firstShop) {
      await Product.updateMany(
        { shopId: null },
        {
          $set: {
            shopId: firstShop._id,
            shopName: firstShop.name,
            shopPhone: firstShop.phone,
            shopAddress: `${firstShop.address.street}, ${firstShop.address.city}`,
            isAvailable: true,
          },
        }
      );
      console.log("Updated products with default partner shop details");
    }

    // Add specific material products if needed
    const materialSample = [
      {
        name: "UltraTech Super Cement (50kg Bag)",
        image1: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
        description: "Premium Portland Pozzolana Cement for high strength home construction, plastering, and RCC foundation.",
        price: 380,
        category: "Building Material",
        subCategory: "Cement",
        sizes: ["50 kg", "10 Bags", "50 Bags"],
        date: Date.now(),
        bestseller: true,
        shopId: firstShop ? firstShop._id : null,
        shopName: firstShop ? firstShop.name : "Shree Ram Building Materials",
        shopPhone: firstShop ? firstShop.phone : "9876543210",
        shopAddress: firstShop ? `${firstShop.address.street}, ${firstShop.address.city}` : "Delhi NCR",
        isAvailable: true,
      },
      {
        name: "Asian Paints Apex Exterior Emulsion (20L)",
        image1: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80",
        description: "Smooth water-based exterior wall finish with silicone additives for long-lasting weather protection.",
        price: 3450,
        category: "Hardware & Paints",
        subCategory: "Paints",
        sizes: ["4 L", "10 L", "20 L"],
        date: Date.now(),
        bestseller: true,
        shopId: secondShop ? secondShop._id : null,
        shopName: secondShop ? secondShop.name : "Gupta Hardware, Paints & Sanitary",
        shopPhone: secondShop ? secondShop.phone : "9811223344",
        shopAddress: secondShop ? `${secondShop.address.street}, ${secondShop.address.city}` : "Delhi NCR",
        isAvailable: true,
      },
      {
        name: "Red Clay Construction Bricks (Pack of 500)",
        image1: "https://images.unsplash.com/photo-1584463699042-453b3bcf5246?w=600&auto=format&fit=crop&q=80",
        description: "Kiln-burnt standard first-class red clay building bricks with high compressive strength.",
        price: 4200,
        category: "Building Material",
        subCategory: "Bricks",
        sizes: ["500 Bricks", "1000 Bricks"],
        date: Date.now(),
        bestseller: false,
        shopId: firstShop ? firstShop._id : null,
        shopName: firstShop ? firstShop.name : "Shree Ram Building Materials",
        shopPhone: firstShop ? firstShop.phone : "9876543210",
        shopAddress: firstShop ? `${firstShop.address.street}, ${firstShop.address.city}` : "Delhi NCR",
        isAvailable: true,
      },
    ];

    for (const m of materialSample) {
      const exists = await Product.findOne({ name: m.name });
      if (!exists) {
        await Product.create(m);
        console.log(`Created sample material product: ${m.name}`);
      }
    }

    console.log("Marketplace seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedMarketplace();
