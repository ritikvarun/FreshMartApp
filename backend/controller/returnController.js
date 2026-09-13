import Return from '../model/returnModel.js'
import Order from '../model/orderModel.js'
import User from '../model/userModel.js'
import { sendReturnRequestEmail, sendReturnStatusEmail, sendAdminReturnAlert } from '../utils/mailer.js'

// ── User: Submit Return Request ──────────────────────────────
export const requestReturn = async (req, res) => {
    try {
        const userId = req.userId
        const { orderId, itemId, itemName, itemImage, itemPrice, itemSize, reason, description, actionType, refundMethod, refundDetails } = req.body
        
        console.log("Request Return payload:", { orderId, userId, itemId })

        const order = await Order.findById(orderId)
        if (!order) {
            console.log("Order completely not found by ID:", orderId)
            return res.status(404).json({ message: 'Order not found' })
        }
        
        if (order.userId.toString() !== userId.toString()) {
             console.log("Order userId mismatch:", order.userId, "vs", userId)
             return res.status(404).json({ message: 'Order not found' })
        }

        if (order.status !== 'Delivered') {
            return res.status(400).json({ message: 'Return only allowed for Delivered orders' })
        }

        const existing = await Return.findOne({ orderId, itemId, userId })
        if (existing) return res.status(400).json({ message: 'Return already requested for this item' })

        const returnRequest = new Return({
            orderId, userId, itemId, itemName, itemImage,
            itemPrice, itemSize, reason, description, actionType, refundMethod, refundDetails
        })
        await returnRequest.save()

        try {
            const user = await User.findById(userId)
            if (user) {
                await sendReturnRequestEmail(user.email, user.name, {
                    itemName, reason, actionType, returnId: returnRequest._id.toString()
                })
                await sendAdminReturnAlert(null, {
                    userName: user.name, userEmail: user.email,
                    itemName, reason, description,
                    actionType, refundMethod, refundDetails,
                    returnId: returnRequest._id.toString()
                })
            }
        } catch (mailErr) {
            console.error("Return alert email failed:", mailErr.message)
        }

        return res.status(201).json({ message: 'Return request submitted', returnId: returnRequest._id })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

// ── User: Get their returns ──────────────────────────────────
export const getUserReturns = async (req, res) => {
    try {
        const returns = await Return.find({ userId: req.userId }).sort({ createdAt: -1 })
        return res.status(200).json(returns)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// ── Admin: Get ALL returns ───────────────────────────────────
export const getAllReturns = async (req, res) => {
    try {
        const returns = await Return.find({}).sort({ createdAt: -1 })
        return res.status(200).json(returns)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// ── Admin: Update Return Status ──────────────────────────────
export const updateReturnStatus = async (req, res) => {
    try {
        const { returnId, status, adminNote } = req.body
        const returnReq = await Return.findByIdAndUpdate(
            returnId,
            { status, adminNote: adminNote || '', resolvedAt: Date.now() },
            { new: true }
        )
        if (!returnReq) return res.status(404).json({ message: 'Return not found' })

        try {
            const user = await User.findById(returnReq.userId)
            if (user) {
                await sendReturnStatusEmail(user.email, user.name, {
                    status, adminNote, itemName: returnReq.itemName, returnId
                })
            }
        } catch (mailErr) {
            console.error("Status update email failed:", mailErr.message)
        }
        return res.status(200).json({ message: 'Return status updated' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
