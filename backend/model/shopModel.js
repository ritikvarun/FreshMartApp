import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    gstNumber: {
      type: String,
      trim: true,
      default: "",
    },
    aadhaarNumber: {
      type: String,
      trim: true,
      default: "",
    },
    aadhaarImage: {
      type: String,
      default: "",
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pinCode: { type: String, default: "" },
      landmark: { type: String, default: "" },
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    category: {
      type: String,
      required: true,
      default: "Grocery & General",
    },
    registrationFeePaid: {
      type: Boolean,
      default: false,
    },
    registrationFeeAmount: {
      type: Number,
      default: 500,
    },
    registrationTxnId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Suspended"],
      default: "Pending",
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80",
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Shop = mongoose.model("Shop", shopSchema);

export default Shop;
