import express from 'express'
import { requestReturn, getUserReturns, getAllReturns, updateReturnStatus } from '../controller/returnController.js'
import isAuth from '../middleware/isAuth.js'
import adminAuth from '../middleware/adminAuth.js'

const router = express.Router()

// User routes (requires login)
router.post('/request', isAuth, requestReturn)
router.get('/my', isAuth, getUserReturns)

// Admin routes
router.get('/all', adminAuth, getAllReturns)
router.post('/update', adminAuth, updateReturnStatus)

export default router
