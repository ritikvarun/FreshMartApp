import Order from "../model/orderModel.js";
import User from "../model/userModel.js";
import Product from "../model/productModel.js";
import DeliveryPartner from "../model/deliveryModel.js";
import mongoose from "mongoose";
import razorpay from "razorpay";
import dotenv from "dotenv";
import {
  sendOrderConfirmation,
  sendAdminOrderAlert,
  sendStatusUpdate,
} from "../utils/mailer.js";
dotenv.config();

const currency = "inr";

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// ── Commission & Settlement Split Calculation Helper ────────
const computeSplits = (items = [], deliveryFee = 50) => {
  const computedItemsTotal = items.reduce((sum, it) => {
    const p = Number(it.price || 0);
    const q = Number(it.quantity || it.qty || 1);
    return sum + p * q;
  }, 0);
  const itemTotal = computedItemsTotal;
  const adminCommission = Math.round(itemTotal * 0.1); // 10% platform commission
  const shopPayout = Math.max(0, itemTotal - adminCommission);
  const deliveryBoyPayout = deliveryFee;
  return {
    itemTotal,
    deliveryFee,
    adminCommission,
    shopPayout,
    deliveryBoyPayout,
  };
};

const prepareOrderTotals = async (items) => {
  if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
    throw new Error("At least one and at most 100 items are required");
  }

  const normalizedItems = [];
  for (const item of items) {
    const productId = item?._id || item?.productId || item?.id;
    const quantity = Number(item?.quantity ?? item?.qty);
    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      quantity > 1000
    ) {
      throw new Error("Each item must have a valid product ID and quantity");
    }

    const product = await Product.findById(productId);
    if (!product || product.isAvailable === false) {
      throw new Error("One or more products are unavailable");
    }

    normalizedItems.push({
      ...item,
      _id: product._id,
      price: product.price,
      quantity,
      shopId: product.shopId || null,
      shopName: product.shopName,
      shopPhone: product.shopPhone,
      name: product.name,
    });
  }

  const deliveryFee = 50;
  const splits = computeSplits(normalizedItems, deliveryFee);
  return {
    items: normalizedItems,
    amount: splits.itemTotal + deliveryFee,
    deliveryFee,
    splits,
  };
};

// ── Place Order (COD) ────────────────────────────────────────
export const placeOrder = async (req, res) => {
  try {
    const {
      items,
      address,
      orderType,
      orderNotes,
      shopId,
      shopName,
      shopPhone,
      deliveryFee: userDeliveryFee,
    } = req.body;
    const userId = req.userId;

    const prepared = await prepareOrderTotals(items);
    const trustedItems = prepared.items;
    const primaryShopId = trustedItems?.[0]?.shopId || null;
    const primaryShopName = trustedItems?.[0]?.shopName || "AkA Partner Store";
    const primaryShopPhone = trustedItems?.[0]?.shopPhone || "";

    const orderData = {
      items: trustedItems,
      amount,
      amount: prepared.amount,
      userId,
      address,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
      orderType:
        orderType ||
        (items?.length === 1 && (items[0]?.quantity || 1) === 1
          ? "single"
          : "multi"),
      orderNotes: orderNotes || "",
      shopId: primaryShopId,
      shopName: primaryShopName,
      shopPhone: primaryShopPhone,
      deliveryStatus: "Unassigned",
      ...prepared.splits,
    };

    const newOrder = new Order(orderData);
    await newOrder.save();
    await User.findByIdAndUpdate(userId, { cartData: {} });

    // ── Send admin order alert ──────────────────────
    try {
      const user = await User.findById(userId);
      const customerName =
        user?.name ||
        `${address?.firstName || ""} ${address?.lastName || ""}`.trim() ||
        "Customer";
      const customerEmail = user?.email || address?.email || "Customer";

      const alertResult = await sendAdminOrderAlert({
        userName: customerName,
        userEmail: customerEmail,
        items: trustedItems,
        amount: prepared.amount,
        address,
        paymentMethod: "COD",
        orderId: newOrder._id.toString(),
      });
      console.log(
        "Order alert email sent result (COD):",
        alertResult ? "success" : "failed",
      );
    } catch (mailErr) {
      console.error("Failed to trigger order alert email:", mailErr);
    }

    return res
      .status(201)
      .json({ message: "Order Placed successfully", order: newOrder });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Order Place error" });
  }
};

// ── Place Order (Razorpay) ────────────────────────────────────
export const placeOrderRazorpay = async (req, res) => {
  try {
    const {
      items,
      address,
      orderType,
      orderNotes,
      shopId,
      shopName,
      shopPhone,
      deliveryFee: userDeliveryFee,
    } = req.body;
    const userId = req.userId;

    const prepared = await prepareOrderTotals(items);
    const trustedItems = prepared.items;
    const primaryShopId = trustedItems?.[0]?.shopId || null;
    const primaryShopName = trustedItems?.[0]?.shopName || "AkA Partner Store";
    const primaryShopPhone = trustedItems?.[0]?.shopPhone || "";

    const orderData = {
      items: trustedItems,
      amount,
      amount: prepared.amount,
      userId,
      address,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
      orderType:
        orderType ||
        (items?.length === 1 && (items[0]?.quantity || 1) === 1
          ? "single"
          : "multi"),
      orderNotes: orderNotes || "",
      shopId: primaryShopId,
      shopName: primaryShopName,
      shopPhone: primaryShopPhone,
      deliveryStatus: "Unassigned",
      ...prepared.splits,
    };

    const newOrder = new Order(orderData);
    await newOrder.save();

    const hasRealKeys =
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_KEY_ID !== "your_razorpay_key_id" &&
      process.env.RAZORPAY_KEY_SECRET !== "your_razorpay_key_secret";

    if (!hasRealKeys) {
      // Test / Sandbox Mode Fallback
      return res.status(200).json({
        id: `order_test_${newOrder._id}`,
        amount: prepared.amount * 100,
        currency: currency.toUpperCase(),
        receipt: newOrder._id.toString(),
        status: "created",
        isTestMode: true,
        message: "Test mode Razorpay order created",
      });
    }

    const rzp = getRazorpayInstance();
    if (!rzp) {
      return res
        .status(500)
        .json({ message: "Razorpay credentials not configured" });
    }

    const options = {
      amount: prepared.amount * 100,
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString(),
    };

    rzp.orders.create(options, (error, order) => {
      if (error) {
        return res.status(500).json({
          message: "Razorpay order creation failed",
          error: error.message,
        });
      }
      res.status(200).json(order);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Verify Razorpay + Send Emails ────────────────────────────
export const verifyRazorpay = async (req, res) => {
  try {
    const userId = req.userId;
    const { razorpay_order_id } = req.body;

    if (razorpay_order_id && razorpay_order_id.startsWith("order_test_")) {
      if (process.env.NODE_ENV === "production") {
        return res
          .status(400)
          .json({ message: "Test payments are disabled in production" });
      }
      const orderReceipt = razorpay_order_id.replace("order_test_", "");
      if (!mongoose.Types.ObjectId.isValid(orderReceipt)) {
        return res.status(400).json({ message: "Invalid test payment order" });
      }
      const pendingOrder = await Order.findOne({ _id: orderReceipt, userId });
      if (!pendingOrder) {
        return res.status(404).json({ message: "Payment order not found" });
      }
      if (pendingOrder.payment) {
        return res.status(409).json({ message: "Payment already verified" });
      }
      const updatedOrder = await Order.findByIdAndUpdate(
        { _id: orderReceipt, userId, payment: false },
        { payment: true },
        { new: true },
      );
      await User.findByIdAndUpdate(userId, { cartData: {} });

      try {
        const user = await User.findById(userId);
        const customerName =
          user?.name ||
          `${updatedOrder?.address?.firstName || ""} ${updatedOrder?.address?.lastName || ""}`.trim() ||
          "Customer";
        const customerEmail =
          user?.email || updatedOrder?.address?.email || "Customer";

        await sendAdminOrderAlert({
          userName: customerName,
          userEmail: customerEmail,
          items: updatedOrder?.items || [],
          amount: updatedOrder?.amount || 0,
          address: updatedOrder?.address || {},
          paymentMethod: "Razorpay",
          orderId: orderReceipt,
        });
      } catch (mailErr) {
        console.error("Failed to trigger Razorpay order alert email:", mailErr);
      }

      return res
        .status(200)
        .json({ success: true, message: "Payment Successful (Test Mode)" });
    }

    const rzp = getRazorpayInstance();
    if (!rzp) {
      return res
        .status(500)
        .json({ message: "Razorpay credentials not configured" });
    }

    const orderInfo = await rzp.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      if (!mongoose.Types.ObjectId.isValid(orderInfo.receipt)) {
        return res.status(400).json({ message: "Invalid payment receipt" });
      }
      const pendingOrder = await Order.findOne({
        _id: orderInfo.receipt,
        userId,
        payment: false,
      });
      if (!pendingOrder || orderInfo.amount !== pendingOrder.amount * 100) {
        return res
          .status(400)
          .json({ message: "Payment does not match the order" });
      }
      const updatedOrder = await Order.findByIdAndUpdate(
        { _id: orderInfo.receipt, userId, payment: false },
        { payment: true },
        { new: true },
      );
      await User.findByIdAndUpdate(userId, { cartData: {} });

      // ── Send admin order alert after successful Razorpay payment ──
      try {
        const user = await User.findById(userId);
        const customerName =
          user?.name ||
          `${updatedOrder.address?.firstName || ""} ${updatedOrder.address?.lastName || ""}`.trim() ||
          "Customer";
        const customerEmail =
          user?.email || updatedOrder.address?.email || "Customer";

        const alertResult = await sendAdminOrderAlert({
          userName: customerName,
          userEmail: customerEmail,
          items: updatedOrder.items,
          amount: updatedOrder.amount,
          address: updatedOrder.address,
          paymentMethod: "Razorpay",
          orderId: updatedOrder._id.toString(),
        });
        console.log(
          "Order alert email sent result (Razorpay):",
          alertResult ? "success" : "failed",
        );
      } catch (mailErr) {
        console.error("Failed to trigger Razorpay order alert email:", mailErr);
      }

      res.status(200).json({ success: true, message: "Payment Successful" });
    } else {
      res.status(400).json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ── User Orders ──────────────────────────────────────────────
export const userOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ userId });
    return res.status(200).json(orders);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "userOrders error " + error.message });
  }
};

// ── Admin: All Orders ────────────────────────────────────────
export const allOrders = async (req, res) => {
  try {
    const orders = await Order.find({});
    res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: "adminAllOrders error" });
  }
};

// ── Admin: Update Status + Send Email to User ────────────────
export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const allowedStatuses = [
      "Order Placed",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];
    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({ message: "Invalid order ID or status" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true },
    );

    // ── Send status update email to user ──
    if (order) {
      const user = await User.findById(order.userId);
      if (user) {
        sendStatusUpdate(user.email, user.name, status, orderId);
      }
    }

    return res.status(201).json({ message: "Status Updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Admin: Financial Splits & Settlement Summary ────────────
export const getOrderSplitsSummary = async (req, res) => {
  try {
    const orders = await Order.find({});
    const totalGrossVolume = orders.reduce(
      (sum, o) => sum + (o.amount || 0),
      0,
    );
    const totalAdminCommission = orders.reduce(
      (sum, o) => sum + (o.adminCommission || 0),
      0,
    );
    const totalShopPayouts = orders.reduce(
      (sum, o) => sum + (o.shopPayout || 0),
      0,
    );
    const totalDeliveryPayouts = orders.reduce(
      (sum, o) => sum + (o.deliveryBoyPayout || 0),
      0,
    );

    res.status(200).json({
      totalOrders: orders.length,
      totalGrossVolume,
      totalAdminCommission,
      totalShopPayouts,
      totalDeliveryPayouts,
      orders,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Splits summary error: " + error.message });
  }
};

// ── Assign Delivery Partner to Order ─────────────────────────
export const assignDeliveryPartner = async (req, res) => {
  try {
    const { orderId, deliveryBoyId, deliveryBoyName, deliveryBoyPhone } =
      req.body;
    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(deliveryBoyId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid order or delivery partner ID" });
    }
    const partner = await DeliveryPartner.findOne({
      _id: deliveryBoyId,
      status: "Approved",
    });
    if (!partner)
      return res
        .status(400)
        .json({ message: "Delivery partner is not approved" });
    const updated = await Order.findByIdAndUpdate(
      orderId,
      {
        deliveryBoyId,
        deliveryBoyName: partner.name,
        deliveryBoyPhone: partner.phone,
        deliveryStatus: "Assigned",
      },
      { new: true },
    );
    return res
      .status(200)
      .json({ message: "Delivery partner assigned", order: updated });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Assign delivery error: " + error.message });
  }
};
