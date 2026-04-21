import { Router } from 'express'
import { authenticateAdmin, logoutAdmin, requireAdmin } from '../middleware/auth.js'
import Product from '../models/Product.js'
import Delivery from '../models/Delivery.js'
import Order from '../models/Order.js'
import mongoose from 'mongoose'
import { ensureDbConnection } from '../config/db.js'

const router = Router()

router.get('/', (req, res) => {
  res.render('admin-login', { error: null })
})

router.post('/login', authenticateAdmin)
router.post('/logout', logoutAdmin)

router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    // Ensure database connection before querying
    const connected = await ensureDbConnection()
    if (!connected || mongoose.connection.readyState !== 1) {
      return res.render('admin-dashboard', { 
        products: [], 
        pendingDeliveries: 0, 
        newDeliveries: 0,
        error: 'Database not connected. Please check your MongoDB connection.' 
      })
    }
    const [products, pendingDeliveries, newDeliveries] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).lean(),
      Delivery.countDocuments({ status: 'pending' }),
      Delivery.countDocuments({ status: 'new' }),
    ])
    res.render('admin-dashboard', { products, pendingDeliveries, newDeliveries, error: null })
  } catch (err) {
    console.error('Admin dashboard error:', err)
    res.render('admin-dashboard', { 
      products: [], 
      pendingDeliveries: 0, 
      newDeliveries: 0,
      error: err.message 
    })
  }
})

router.get('/orders', requireAdmin, async (req, res) => {
  try {
    // Ensure database connection before querying
    const connected = await ensureDbConnection()
    if (!connected || mongoose.connection.readyState !== 1) {
      return res.render('admin-orders', { 
        orders: [],
        totalOrders: 0,
        pendingOrders: 0,
        error: 'Database not connected. Please check your MongoDB connection.' 
      })
    }
    
    const orders = await Order.find()
      .populate('items.productId', 'name image price')
      .sort({ createdAt: -1 })
      .lean()
    
    const totalOrders = orders.length
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    
    res.render('admin-orders', { 
      orders, 
      totalOrders, 
      pendingOrders,
      error: null 
    })
  } catch (err) {
    console.error('Admin orders error:', err)
    res.render('admin-orders', { 
      orders: [],
      totalOrders: 0,
      pendingOrders: 0,
      error: err.message 
    })
  }
})

export default router

