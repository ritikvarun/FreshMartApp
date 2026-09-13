import Order from "../model/orderModel.js";
import User from "../model/userModel.js";
import razorpay from 'razorpay'
import dotenv from 'dotenv'
import { sendOrderConfirmation, sendAdminOrderAlert, sendStatusUpdate } from '../utils/mailer.js'
dotenv.config()

const currency = 'inr'

const getRazorpayInstance = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return null
    }
    return new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })
}

// ── Place Order (COD) ────────────────────────────────────────
export const placeOrder = async (req, res) => {
    try {
        const { items, amount, address } = req.body
        const userId = req.userId

        const orderData = {
            items,
            amount,
            userId,
            address,
            paymentMethod: 'COD',
            payment: false,
            date: Date.now()
        }

        const newOrder = new Order(orderData)
        await newOrder.save()
        await User.findByIdAndUpdate(userId, { cartData: {} })

        // ── Send admin order alert ──────────────────────
        try {
            const user = await User.findById(userId)
            const customerName = user?.name || `${address?.firstName || ''} ${address?.lastName || ''}`.trim() || 'Customer'
            const customerEmail = user?.email || address?.email || 'Customer'

            const alertResult = await sendAdminOrderAlert({
                userName: customerName,
                userEmail: customerEmail,
                items,
                amount,
                address,
                paymentMethod: 'COD',
                orderId: newOrder._id.toString()
            })
            console.log("Order alert email sent result (COD):", alertResult ? "success" : "failed")
        } catch (mailErr) {
            console.error("Failed to trigger order alert email:", mailErr)
        }

        return res.status(201).json({ message: 'Order Place' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Order Place error' })
    }
}


// ── Place Order (Razorpay) ────────────────────────────────────
export const placeOrderRazorpay = async (req, res) => {
    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ message: "Razorpay credentials not configured" })
        }

        const { items, amount, address } = req.body
        const userId = req.userId

        const orderData = {
            items,
            amount,
            userId,
            address,
            paymentMethod: 'Razorpay',
            payment: false,
            date: Date.now()
        }

        const newOrder = new Order(orderData)
        await newOrder.save()

        const rzp = getRazorpayInstance()
        if (!rzp) {
            return res.status(500).json({ message: "Razorpay credentials not configured" })
        }

        const options = {
            amount: amount * 100,
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString()
        }

        rzp.orders.create(options, (error, order) => {
            if (error) {
                return res.status(500).json({ message: "Razorpay order creation failed", error: error.message })
            }
            res.status(200).json(order)
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


// ── Verify Razorpay + Send Emails ────────────────────────────
export const verifyRazorpay = async (req, res) => {
    try {
        const userId = req.userId
        const { razorpay_order_id } = req.body

        const rzp = getRazorpayInstance()
        if (!rzp) {
            return res.status(500).json({ message: "Razorpay credentials not configured" })
        }

        const orderInfo = await rzp.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            const updatedOrder = await Order.findByIdAndUpdate(
                orderInfo.receipt,
                { payment: true },
                { new: true }
            )
            await User.findByIdAndUpdate(userId, { cartData: {} })

            // ── Send admin order alert after successful Razorpay payment ──
            try {
                const user = await User.findById(userId)
                const customerName = user?.name || `${updatedOrder.address?.firstName || ''} ${updatedOrder.address?.lastName || ''}`.trim() || 'Customer'
                const customerEmail = user?.email || updatedOrder.address?.email || 'Customer'

                const alertResult = await sendAdminOrderAlert({
                    userName: customerName,
                    userEmail: customerEmail,
                    items: updatedOrder.items,
                    amount: updatedOrder.amount,
                    address: updatedOrder.address,
                    paymentMethod: 'Razorpay',
                    orderId: updatedOrder._id.toString()
                })
                console.log("Order alert email sent result (Razorpay):", alertResult ? "success" : "failed")
            } catch (mailErr) {
                console.error("Failed to trigger Razorpay order alert email:", mailErr)
            }

            res.status(200).json({ success: true, message: 'Payment Successful' })
        } else {
            res.status(400).json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}


// ── User Orders ──────────────────────────────────────────────
export const userOrders = async (req, res) => {
    try {
        const userId = req.userId
        const orders = await Order.find({ userId })
        return res.status(200).json(orders)
    } catch (error) {
        return res.status(500).json({ message: "userOrders error " + error.message })
    }
}


// ── Admin: All Orders ────────────────────────────────────────
export const allOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
        res.status(200).json(orders)
    } catch (error) {
        return res.status(500).json({ message: "adminAllOrders error" })
    }
}


// ── Admin: Update Status + Send Email to User ────────────────
export const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body

        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true })

        // ── Send status update email to user ──
        if (order) {
            const user = await User.findById(order.userId)
            if (user) {
                sendStatusUpdate(
                    user.email,
                    user.name,
                    status,
                    orderId
                )
            }
        }

        return res.status(201).json({ message: 'Status Updated' })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}