import { Router } from 'express'
import productRoutes from './productRoutes.js'
import deliveryRoutes from './deliveryRoutes.js'
import cartRoutes from './cartRoutes.js'
import orderRoutes from './orderRoutes.js'
import { requireAdmin } from '../middleware/auth.js'
import Order from '../models/Order.js'
import mongoose from 'mongoose'
import { ensureDbConnection } from '../config/db.js'

const router = Router()

router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok' })
})

router.get('/', (req, res) => {
  res.render('index', { title: 'Kick Thrift Shoes API', message: 'Kick Thrift API is running' })
})

router.use('/api/products', productRoutes)
router.use('/api/deliveries', deliveryRoutes)
router.use('/api/cart', cartRoutes)
router.use('/api/orders', orderRoutes)

// Admin API endpoint for orders
router.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const connected = await ensureDbConnection()
    if (!connected || mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: 'Database not connected'
      })
    }

    const orders = await Order.find()
      .populate('items.productId', 'name image price')
      .sort({ createdAt: -1 })
      .lean()

    const totalOrders = orders.length
    const pendingOrders = orders.filter(o => o.status === 'pending').length

    res.json({
      success: true,
      data: {
        orders,
        totalOrders,
        pendingOrders
      }
    })
  } catch (err) {
    console.error('Admin orders API error:', err)
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

export default router

