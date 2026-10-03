import Shop from "../model/shopModel.js";
import Product from "../model/productModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper token generator for shop
const genShopToken = (id) => {
  return jwt.sign(
    { shopId: id, role: "shop" },
    process.env.JWT_SECRET || "freshmart_secret_key",
    {
      expiresIn: "30d",
    },
  );
};

// ── Register New Shop (with ₹500 fee status) ────────────────
export const registerShop = async (req, res) => {
  try {
    const {
      name,
      ownerName,
      phone,
      password,
      email,
      gstNumber,
      aadhaarNumber,
      aadhaarImage,
      address,
      category,
      registrationFeePaid,
      registrationTxnId,
      image,
    } = req.body;

    if (!name || !ownerName || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Name, Owner Name, Phone and Password are required" });
    }

    if (!gstNumber && !aadhaarNumber) {
      return res.status(400).json({
        message:
          "Either GST Number or Aadhaar Number is mandatory for shop onboarding",
      });
    }

    const existingShop = await Shop.findOne({ phone });
    if (existingShop) {
      return res
        .status(400)
        .json({ message: "A shop with this phone number already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newShop = new Shop({
      name,
      ownerName,
      phone,
      password: hashedPassword,
      email: email || "",
      gstNumber: gstNumber || "",
      aadhaarNumber: aadhaarNumber || "",
      aadhaarImage: aadhaarImage || "",
      address:
        typeof address === "object" ? address : { street: address || "" },
      category: category || "Building & General Materials",
      registrationFeePaid: false,
      registrationFeeAmount: 500,
      registrationTxnId: registrationTxnId || `REG_SH_${Date.now()}`,
      status: "Pending",
      isOpen: true,
      image:
        image ||
        "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80",
    });

    await newShop.save();

    const token = genShopToken(newShop._id);
    const shopObj = newShop.toObject();
    delete shopObj.password;

    return res.status(201).json({
      message: "Shop registered successfully! Registration Fee ₹500 recorded.",
      shop: shopObj,
      token,
    });
  } catch (error) {
    console.error("registerShop error:", error);
    return res
      .status(500)
      .json({ message: "Registration error: " + error.message });
  }
};

// ── Shop Login (Supports Phone / Aadhaar Number / GST Number) ──
export const loginShop = async (req, res) => {
  try {
    const { identifier, phone, password } = req.body;
    const loginKey = (identifier || phone || "").trim();
    if (!loginKey || !password) {
      return res
        .status(400)
        .json({ message: "Phone / Aadhaar / GST and password are required" });
    }

    const shop = await Shop.findOne({
      $or: [
        { phone: loginKey },
        { aadhaarNumber: loginKey },
        { gstNumber: loginKey },
      ],
    });

    if (!shop) {
      return res.status(404).json({
        message: "Shop not found with provided Phone, Aadhaar, or GST Number",
      });
    }

    if (shop.status !== "Approved") {
      return res.status(403).json({ message: "Shop is not approved" });
    }

    const isMatch = await bcrypt.compare(password, shop.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = genShopToken(shop._id);
    const shopObj = shop.toObject();
    delete shopObj.password;

    return res.status(200).json({
      message: "Login successful",
      shop: shopObj,
      token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Shop login error: " + error.message });
  }
};

// ── Shop Partner: Add Product Directly from Mobile ──────────
export const addShopProduct = async (req, res) => {
  try {
    const {
      shopId,
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      image1,
      image2,
      image3,
      bestseller,
    } = req.body;

    if (!shopId || shopId.toString() !== req.shopId || !name || !price) {
      return res
        .status(403)
        .json({
          message: "Shop ownership or required product fields are invalid",
        });
    }

    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
      return res
        .status(400)
        .json({ message: "Product price must be positive" });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    let parsedSizes = [];
    try {
      parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
    } catch (e) {
      parsedSizes = Array.isArray(sizes) ? sizes : [sizes || "Standard"];
    }

    const product = new Product({
      name,
      description: description || `${name} supplied by ${shop.name}`,
      price: Number(price),
      category: category || shop.category || "Building Materials",
      subCategory: subCategory || "Supplies",
      sizes: parsedSizes.length > 0 ? parsedSizes : ["Standard"],
      image1:
        image1 ||
        shop.image ||
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
      image2: image2 || "",
      image3: image3 || "",
      image4: "",
      image5: "",
      bestseller: bestseller === true || bestseller === "true",
      date: Date.now(),
      shopId: shop._id,
      shopName: shop.name,
      shopPhone: shop.phone,
      shopAddress: shop.address?.street
        ? `${shop.address.street}, ${shop.address.city || ""}`
        : "",
      isAvailable: true,
    });

    await product.save();
    return res
      .status(201)
      .json({ message: "Material listed successfully!", product });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "addShopProduct error: " + error.message });
  }
};

// ── Shop Partner: Get All Products by Shop ──────────────────
export const getMyShopProducts = async (req, res) => {
  try {
    const { shopId } = req.params;
    if (shopId !== req.shopId) {
      return res
        .status(403)
        .json({ message: "You can only view your own products" });
    }
    const products = await Product.find({ shopId }).sort({ createdAt: -1 });
    return res.status(200).json({ count: products.length, products });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "getMyShopProducts error: " + error.message });
  }
};

// ── Shop Partner: Toggle Open/Closed ────────────────────────
export const toggleShopOpen = async (req, res) => {
  try {
    const { shopId, isOpen } = req.body;
    if (shopId?.toString() !== req.shopId || typeof isOpen !== "boolean") {
      return res
        .status(403)
        .json({ message: "Invalid shop ownership or status" });
    }
    const shop = await Shop.findByIdAndUpdate(
      shopId,
      { isOpen },
      { new: true },
    ).select("-password");
    return res
      .status(200)
      .json({ message: `Shop is now ${isOpen ? "Open" : "Closed"}`, shop });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "toggleShopOpen error: " + error.message });
  }
};

// ── Public: Get All Active Shops (For Customer App) ─────────
export const getActiveShops = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { status: "Approved" };

    if (category && category !== "All") {
      filter.category = new RegExp(category, "i");
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { "address.street": new RegExp(search, "i") },
        { "address.city": new RegExp(search, "i") },
        { category: new RegExp(search, "i") },
      ];
    }

    const shops = await Shop.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });
    return res.status(200).json({ count: shops.length, shops });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "getActiveShops error: " + error.message });
  }
};

// ── Public: Get Shop Detail & Shop-wise Material/Product List
export const getShopWithProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await Shop.findById(id).select("-password");
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // Find products specifically tagged with this shop, or fallback to general products if newly created
    let products = await Product.find({ shopId: shop._id });
    if (!products || products.length === 0) {
      // Return catalog products marked with this shop's name for immediate display
      products = await Product.find({}).limit(20);
    }

    return res.status(200).json({
      shop,
      productsCount: products.length,
      products,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "getShopWithProducts error: " + error.message });
  }
};

// ── Admin: List All Registered Shops ────────────────────────
export const adminGetAllShops = async (req, res) => {
  try {
    const shops = await Shop.find({})
      .select("-password")
      .sort({ createdAt: -1 });
    return res.status(200).json(shops);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "adminGetAllShops error: " + error.message });
  }
};

// ── Admin: Approve / Reject Shop ────────────────────────────
export const adminApproveShop = async (req, res) => {
  try {
    const { shopId, status } = req.body;
    if (!["Pending", "Approved", "Rejected", "Suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Shop.findByIdAndUpdate(
      shopId,
      { status },
      { new: true },
    ).select("-password");
    return res
      .status(200)
      .json({ message: `Shop ${status} successfully`, shop: updated });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "adminApproveShop error: " + error.message });
  }
};
