import mongoose from "mongoose";


const orderSchema = new mongoose.Schema({
    userId: {
        type:String,
        required: true
    },
    items: {
          type:Array,
        required: true
    },
    amount: {
        type:Number,
        required: true
    },
    address: {
        type:Object,
        required: true
    },
    status: {
        type:String,
        required: true,
        default:'Order Placed'
    },
    paymentMethod: {
        type:String,
        required: true
    },
    payment: {
        type:Boolean,
        required: true,
        default:false
    },
    date: {
        type: Number,
        required:true
    },
    orderType: {
        type: String,
        enum: ["single", "multi"],
        default: "multi"
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        default: null
    },
    shopName: {
        type: String,
        default: "FreshMart Store"
    },
    shopPhone: {
        type: String,
        default: ""
    },
    deliveryBoyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryPartner",
        default: null
    },
    deliveryBoyName: {
        type: String,
        default: ""
    },
    deliveryBoyPhone: {
        type: String,
        default: ""
    },
    deliveryStatus: {
        type: String,
        enum: ["Unassigned", "Assigned", "PickedUp", "Delivered", "Cancelled"],
        default: "Unassigned"
    },
    itemTotal: {
        type: Number,
        default: 0
    },
    deliveryFee: {
        type: Number,
        default: 50
    },
    adminCommission: {
        type: Number,
        default: 0
    },
    shopPayout: {
        type: Number,
        default: 0
    },
    deliveryBoyPayout: {
        type: Number,
        default: 0
    },
    payoutStatus: {
        type: String,
        enum: ["Pending", "Settled"],
        default: "Pending"
    }
},{timestamps:true}) 

const Order = mongoose.model('Order' , orderSchema)

export default Order