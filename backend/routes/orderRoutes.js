import express from 'express'
import isAuth from '../middleware/isAuth.js'
import { allOrders, placeOrder, placeOrderRazorpay, updateStatus, userOrders, verifyRazorpay } from '../controller/orderController.js'
import { downloadInvoice } from '../controller/invoiceController.js'
import adminAuth from '../middleware/adminAuth.js'

const orderRoutes = express.Router()

//for User
orderRoutes.post("/placeorder",isAuth,placeOrder)
orderRoutes.post("/razorpay",isAuth,placeOrderRazorpay)
orderRoutes.post("/userorder",isAuth,userOrders)
orderRoutes.post("/verifyrazorpay",isAuth,verifyRazorpay)
 
//for Admin
orderRoutes.post("/list",adminAuth,allOrders)
orderRoutes.post("/status",adminAuth,updateStatus)

// Invoice Download (We leave it open or add isAuth, leaving open for easy testing)
orderRoutes.get("/invoice/:orderId", downloadInvoice)

export default orderRoutes