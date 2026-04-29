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

router.get('/products', requireAdmin, async (req, res) => {
  try {
    const connected = await ensureDbConnection()
    if (!connected || mongoose.connection.readyState !== 1) {
      return res.render('admin-products', {
        products: [],
        error: 'Database not connected. Please check your MongoDB connection.'
      })
    }

    const products = await Product.find().sort({ createdAt: -1 }).lean()
    res.render('admin-products', { products, error: null })
  } catch (err) {
    console.error('Admin products error:', err)
    res.render('admin-products', { products: [], error: err.message })
  }
})

router.post('/products/:id/pricing', requireAdmin, async (req, res) => {
  try {
    const connected = await ensureDbConnection()
    if (!connected || mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database not connected.' })
    }

    const { id } = req.params
    const buyPrice = req.body.buyPrice === '' || req.body.buyPrice === undefined ? undefined : Number(req.body.buyPrice)
    const sellingPrice = req.body.sellingPrice === '' || req.body.sellingPrice === undefined ? undefined : Number(req.body.sellingPrice)
    const advancePayment = req.body.advancePayment === '' || req.body.advancePayment === undefined ? undefined : Number(req.body.advancePayment)
    const receivedAmount = req.body.receivedAmount === '' || req.body.receivedAmount === undefined ? undefined : Number(req.body.receivedAmount)
    const remainingPayment = req.body.remainingPayment === '' || req.body.remainingPayment === undefined ? undefined : Number(req.body.remainingPayment)

    const update = {}
    if (Number.isFinite(buyPrice)) update.buyPrice = buyPrice
    if (Number.isFinite(sellingPrice)) update.sellingPrice = sellingPrice
    if (Number.isFinite(advancePayment)) update.advancePayment = advancePayment
    if (Number.isFinite(receivedAmount)) update.receivedAmount = receivedAmount
    if (Number.isFinite(remainingPayment)) update.remainingPayment = remainingPayment

    const nextSellingPrice = Number.isFinite(sellingPrice) ? sellingPrice : undefined
    const nextAdvancePayment = Number.isFinite(advancePayment) ? advancePayment : undefined
    const nextReceivedAmount = Number.isFinite(receivedAmount) ? receivedAmount : undefined
    const nextRemainingPayment = Number.isFinite(remainingPayment) ? remainingPayment : undefined

    if (nextSellingPrice !== undefined || nextAdvancePayment !== undefined || nextReceivedAmount !== undefined || nextRemainingPayment !== undefined) {
      const existingProduct = await Product.findById(id).lean()
      if (!existingProduct) {
        return res.status(404).json({ success: false, message: 'Product not found' })
      }

      const resolvedSelling = nextSellingPrice !== undefined ? nextSellingPrice : (Number(existingProduct.sellingPrice) || 0)
      const resolvedAdvance = nextAdvancePayment !== undefined ? nextAdvancePayment : (Number(existingProduct.advancePayment) || 0)
      const resolvedReceived = nextReceivedAmount !== undefined ? nextReceivedAmount : (Number(existingProduct.receivedAmount) || 0)
      const resolvedRemaining = nextRemainingPayment !== undefined
        ? nextRemainingPayment
        : Math.max(resolvedSelling - resolvedReceived, 0)

      update.sellingPrice = resolvedSelling
      update.advancePayment = resolvedAdvance
      update.receivedAmount = resolvedReceived
      update.remainingPayment = resolvedRemaining
    }

    const product = await Product.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean()
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    console.log('Product pricing updated:', {
      id,
      buyPrice: product.buyPrice,
      sellingPrice: product.sellingPrice,
      advancePayment: product.advancePayment,
      receivedAmount: product.receivedAmount,
      remainingPayment: product.remainingPayment,
      totalReceived: product.receivedAmount
    })
    res.json({ success: true, data: product })
  } catch (err) {
    console.error('Update product pricing error:', err)
    res.status(500).json({ success: false, message: err.message })
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

