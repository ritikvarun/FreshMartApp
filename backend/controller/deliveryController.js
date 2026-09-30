import DeliveryPartner from "../model/deliveryModel.js";
import Order from "../model/orderModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const genDeliveryToken = (id) => {
  return jwt.sign(
    { deliveryId: id, role: "delivery" },
    process.env.JWT_SECRET || "freshmart_secret_key",
    { expiresIn: "30d" }
  );
};

// ── Register Delivery Partner (with ₹500 fee) ────────────────
export const registerDeliveryPartner = async (req, res) => {
  try {
    const {
      name,
      phone,
      password,
      aadhaarNumber,
      drivingLicenseNumber,
      vehicleType,
      vehicleNumber,
      registrationFeePaid,
      registrationTxnId,
    } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: "Name, Phone and Password are required" });
    }

    if (!aadhaarNumber && !drivingLicenseNumber) {
      return res.status(400).json({ message: "Aadhaar number or Driving License is mandatory for verification" });
    }

    const existing = await DeliveryPartner.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: "A delivery partner with this phone number already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const partner = new DeliveryPartner({
      name,
      phone,
      password: hashedPassword,
      aadhaarNumber: aadhaarNumber || "",
      drivingLicenseNumber: drivingLicenseNumber || "",
      vehicleType: vehicleType || "Bike",
      vehicleNumber: vehicleNumber || "",
      registrationFeePaid: registrationFeePaid !== undefined ? registrationFeePaid : true,
      registrationFeeAmount: 500,
      registrationTxnId: registrationTxnId || `REG_DL_${Date.now()}`,
      status: "Approved", // Auto-approved for easy testing & freelance onboarding
      isOnline: true,
      walletBalance: 0,
    });

    await partner.save();

    const token = genDeliveryToken(partner._id);
    const partnerObj = partner.toObject();
    delete partnerObj.password;

    return res.status(201).json({
      message: "Delivery partner registered successfully! Registration Fee ₹500 recorded.",
      partner: partnerObj,
      token,
    });
  } catch (error) {
    console.error("registerDeliveryPartner error:", error);
    return res.status(500).json({ message: "Registration error: " + error.message });
  }
};

// ── Login Delivery Partner ───────────────────────────────────
export const loginDeliveryPartner = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: "Phone and password are required" });
    }

    const partner = await DeliveryPartner.findOne({ phone });
    if (!partner) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }

    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = genDeliveryToken(partner._id);
    const partnerObj = partner.toObject();
    delete partnerObj.password;

    return res.status(200).json({
      message: "Login successful",
      partner: partnerObj,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Delivery login error: " + error.message });
  }
};

// ── Toggle Online / Offline Status ───────────────────────────
export const toggleOnlineStatus = async (req, res) => {
  try {
    const { partnerId, isOnline } = req.body;
    const partner = await DeliveryPartner.findByIdAndUpdate(
      partnerId,
      { isOnline },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      message: `Status updated to ${isOnline ? "Online" : "Offline"}`,
      partner,
    });
  } catch (error) {
    return res.status(500).json({ message: "Toggle online error: " + error.message });
  }
};

// ── Update Live Location ─────────────────────────────────────
export const updateLocation = async (req, res) => {
  try {
    const { partnerId, latitude, longitude, address } = req.body;
    const partner = await DeliveryPartner.findByIdAndUpdate(
      partnerId,
      {
        currentLocation: {
          latitude: Number(latitude) || 0,
          longitude: Number(longitude) || 0,
          address: address || "",
          lastUpdated: Date.now(),
        },
      },
      { new: true }
    ).select("-password");

    return res.status(200).json({ message: "Location updated", partner });
  } catch (error) {
    return res.status(500).json({ message: "Update location error: " + error.message });
  }
};

// ── Get Available Orders (Unassigned orders nearby) ──────────
export const getAvailableOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryStatus: { $in: ["Unassigned", null] },
      status: { $ne: "Delivered" },
    }).sort({ createdAt: -1 });

    return res.status(200).json({ count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ message: "getAvailableOrders error: " + error.message });
  }
};

// ── Accept Order ─────────────────────────────────────────────
export const acceptOrder = async (req, res) => {
  try {
    const { orderId, partnerId } = req.body;
    const partner = await DeliveryPartner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.deliveryBoyId && order.deliveryBoyId.toString() !== partnerId) {
      return res.status(400).json({ message: "This order was already accepted by another partner" });
    }

    order.deliveryBoyId = partner._id;
    order.deliveryBoyName = partner.name;
    order.deliveryBoyPhone = partner.phone;
    order.deliveryStatus = "Assigned";
    await order.save();

    partner.activeOrderId = order._id;
    await partner.save();

    return res.status(200).json({ message: "Order accepted successfully", order });
  } catch (error) {
    return res.status(500).json({ message: "acceptOrder error: " + error.message });
  }
};

// ── Update Delivery Status (PickedUp / Delivered) ────────────
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId, partnerId, status } = req.body; // status: "PickedUp" | "Delivered"
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.deliveryStatus = status;
    if (status === "Delivered") {
      order.status = "Delivered";
      order.payment = true;

      // Credit delivery earnings to partner's wallet
      const payout = order.deliveryBoyPayout || 50;
      await DeliveryPartner.findByIdAndUpdate(partnerId, {
        $inc: { walletBalance: payout, totalDeliveries: 1 },
        $set: { activeOrderId: null },
      });
    }

    await order.save();
    return res.status(200).json({ message: `Order marked as ${status}`, order });
  } catch (error) {
    return res.status(500).json({ message: "updateDeliveryStatus error: " + error.message });
  }
};

// ── Admin: List All Delivery Partners ────────────────────────
export const adminGetAllDeliveryPartners = async (req, res) => {
  try {
    const partners = await DeliveryPartner.find({}).select("-password").sort({ createdAt: -1 });
    return res.status(200).json(partners);
  } catch (error) {
    return res.status(500).json({ message: "adminGetAllDeliveryPartners error: " + error.message });
  }
};

// ── Admin: Approve / Reject Delivery Partner ─────────────────
export const adminApproveDeliveryPartner = async (req, res) => {
  try {
    const { partnerId, status } = req.body;
    const updated = await DeliveryPartner.findByIdAndUpdate(
      partnerId,
      { status },
      { new: true }
    ).select("-password");

    return res.status(200).json({ message: `Delivery partner ${status} successfully`, partner: updated });
  } catch (error) {
    return res.status(500).json({ message: "adminApproveDeliveryPartner error: " + error.message });
  }
};
