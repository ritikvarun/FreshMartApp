import mongoose from "mongoose";

const deliveryPartnerSchema = new mongoose.Schema(
  {
    name: {
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
    password: {
      type: String,
      required: true,
    },
    aadhaarNumber: {
      type: String,
      trim: true,
      default: "",
    },
    drivingLicenseNumber: {
      type: String,
      trim: true,
      default: "",
    },
    vehicleType: {
      type: String,
      enum: ["Bike", "Scooter", "Cycle", "Auto", "Tempo", "Other"],
      default: "Bike",
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: "",
    },
    currentLocation: {
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
      address: { type: String, default: "" },
      lastUpdated: { type: Date, default: Date.now },
    },
    isOnline: {
      type: Boolean,
      default: false,
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
    walletBalance: {
      type: Number,
      default: 0,
    },
    activeOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
  },
  { timestamps: true }
);

const DeliveryPartner = mongoose.model("DeliveryPartner", deliveryPartnerSchema);

export default DeliveryPartner;
