import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });
import bcrypt from "bcryptjs";
import connectDb from "../config/db.js";
import Shop from "../model/shopModel.js";
import Product from "../model/productModel.js";
import DeliveryPartner from "../model/deliveryModel.js";

const seedMarketplace = async () => {
  try {
    await connectDb();
    console.log("Connected to MongoDB for grocery marketplace seeding...");

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash("Pass@1234", salt);

    const initialShops = [
      {
        name: "Gupta Daily Kirana & Superstore",
        ownerName: "Ramesh Gupta",
        phone: "9876543210",
        password: defaultPassword,
        email: "guptakirana@gmail.com",
        gstNumber: "07AAAAA0000A1Z5",
        aadhaarNumber: "123456789012",
        category: "Daily Kirana & Staples",
        address: {
          street: "Shop 12, Main Market, Sector 14",
          city: "Delhi NCR",
          state: "Delhi",
          pinCode: "110034",
          landmark: "Near City Park",
          latitude: 28.6139,
          longitude: 77.209,
        },
        registrationFeePaid: true,
        registrationFeeAmount: 500,
        registrationTxnId: "TXN_SH_001",
        status: "Approved",
        isOpen: true,
        image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80",
        walletBalance: 2450,
      },
      {
        name: "Fresh Farm Fruits & Veggie Mart",
        ownerName: "Sunil Verma",
        phone: "9811223344",
        password: defaultPassword,
        email: "freshfarm.veggies@gmail.com",
        gstNumber: "07BBBBB1111B2Z6",
        aadhaarNumber: "234567890123",
        category: "Fruits & Vegetables",
        address: {
          street: "Shop 4-5, Subzi Mandi Complex",
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
        image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80",
        walletBalance: 1800,
      },
      {
        name: "Amul Dairy Booth & Daily Bakery",
        ownerName: "Mukesh Yadav",
        phone: "9899887766",
        password: defaultPassword,
        email: "amuldairy.mukesh@gmail.com",
        gstNumber: "",
        aadhaarNumber: "345678901234",
        category: "Dairy & Bakery",
        address: {
          street: "Booth 8, Pocket B Commercial Center",
          city: "Delhi NCR",
          state: "Delhi",
          pinCode: "110044",
          landmark: "Near Community Center",
          latitude: 28.5033,
          longitude: 77.301,
        },
        registrationFeePaid: true,
        registrationFeeAmount: 500,
        registrationTxnId: "TXN_SH_003",
        status: "Approved",
        isOpen: true,
        image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&auto=format&fit=crop&q=80",
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

    // Seed sample freelance grocery delivery rider
    const sampleDelivery = {
      name: "Vikram Singh (Express Rider)",
      phone: "9711002233",
      password: defaultPassword,
      aadhaarNumber: "987654321098",
      drivingLicenseNumber: "DL-042022001928",
      vehicleType: "Bike",
      vehicleNumber: "DL 3S AB 1234",
      registrationFeePaid: true,
      registrationFeeAmount: 500,
      registrationTxnId: "TXN_DL_001",
      status: "Approved",
      isOnline: true,
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

    const firstShop = await Shop.findOne({ phone: "9876543210" });
    const secondShop = await Shop.findOne({ phone: "9811223344" });

    // Seed realistic grocery catalog products
    const grocerySample = [
      {
        name: "Aashirvaad Superior MP Shudh Chakki Atta (5 kg)",
        image1: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
        description: "100% pure whole wheat flour processed with traditional chakki grinding for soft rotis.",
        price: 245,
        category: "Atta, Rice & Dal",
        subCategory: "Atta",
        sizes: ["1 kg", "5 kg", "10 kg"],
        date: Date.now(),
        bestseller: true,
        shopId: firstShop ? firstShop._id : null,
        shopName: firstShop ? firstShop.name : "Gupta Daily Kirana & Superstore",
        shopPhone: firstShop ? firstShop.phone : "9876543210",
        shopAddress: firstShop ? `${firstShop.address.street}, ${firstShop.address.city}` : "Delhi NCR",
        isAvailable: true,
      },
      {
        name: "Amul Taaza Fresh Toned Milk (1 Litre Pouch)",
        image1: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
        description: "Fresh pasteurized toned milk enriched with Vitamin A & D. Daily essential milk.",
        price: 54,
        category: "Dairy & Breakfast",
        subCategory: "Milk",
        sizes: ["500 ml", "1 L"],
        date: Date.now(),
        bestseller: true,
        shopId: firstShop ? firstShop._id : null,
        shopName: firstShop ? firstShop.name : "Gupta Daily Kirana & Superstore",
        shopPhone: firstShop ? firstShop.phone : "9876543210",
        shopAddress: firstShop ? `${firstShop.address.street}, ${firstShop.address.city}` : "Delhi NCR",
        isAvailable: true,
      },
      {
        name: "Fresh Hybrid Farm Tomatoes (1 kg)",
        image1: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
        description: "Farm-fresh ripe red tomatoes directly procured from local vegetable mandis.",
        price: 38,
        category: "Vegetables & Fruits",
        subCategory: "Fresh Vegetables",
        sizes: ["500g", "1 kg", "2 kg"],
        date: Date.now(),
        bestseller: true,
        shopId: secondShop ? secondShop._id : null,
        shopName: secondShop ? secondShop.name : "Fresh Farm Fruits & Veggie Mart",
        shopPhone: secondShop ? secondShop.phone : "9811223344",
        shopAddress: secondShop ? `${secondShop.address.street}, ${secondShop.address.city}` : "Delhi NCR",
        isAvailable: true,
      },
    ];

    for (const g of grocerySample) {
      const exists = await Product.findOne({ name: g.name });
      if (!exists) {
        await Product.create(g);
        console.log(`Created sample grocery product: ${g.name}`);
      }
    }

    console.log("Grocery marketplace seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedMarketplace();
