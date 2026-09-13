import mongoose from 'mongoose'

const returnSchema = new mongoose.Schema({
    orderId:    { type: String, required: true },
    userId:     { type: String, required: true },
    itemId:     { type: String, required: true },
    itemName:   { type: String, required: true },
    itemImage:  { type: String },
    itemPrice:  { type: Number },
    itemSize:   { type: String },
    reason:     { type: String, required: true },
    description:{ type: String, default: '' },
    status:     { type: String, default: 'Pending' }, // Pending | Approved | Rejected
    adminNote:  { type: String, default: '' },
    actionType: { type: String, default: 'Refund' }, // 'Refund' or 'Replace'
    refundMethod: { type: String }, // 'UPI' or 'Bank'
    refundDetails: { type: Object }, // { upiId } OR { accountNo, ifsc, accountName }
    requestedAt:{ type: Date, default: Date.now },
    resolvedAt: { type: Date }
}, { timestamps: true })

const Return = mongoose.model('Return', returnSchema)
export default Return
