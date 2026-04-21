import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import mongoose from 'mongoose'
import { ensureDbConnection } from '../config/db.js'
import { sendOrderConfirmationEmail, sendOrderDeliveredEmail, sendOrderNotificationToAdmin } from '../services/emailService.js'

async function checkDb() {
  const connected = await ensureDbConnection()
  if (!connected || mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected. Please try again.')
  }
}

// Get or create session ID
function getSessionId(req) {
  let sessionId = req.cookies?.cartSessionId
  
  if (!sessionId) {
    sessionId = req.headers['x-session-id']
  }
  
  if (!sessionId) {
    sessionId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  return sessionId
}

// Create order
export async function createOrder(req, res) {
  try {
    await checkDb()
    
    const sessionId = getSessionId(req)

    // Extract order data from request
    const { contact, delivery, payment, billing, items: payloadItems } = req.body

    if (!contact || !delivery || !payment) {
      return res.status(400).json({
        success: false,
        message: 'Missing required information. Please fill all required fields.'
      })
    }

    let cart = null
    let orderItems = []

    if (Array.isArray(payloadItems) && payloadItems.length > 0) {
      const requestedIds = payloadItems
        .map((item) => String(item.productId || item.id || ''))
        .filter((id) => mongoose.Types.ObjectId.isValid(id))

      if (requestedIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid product IDs found in order items.'
        })
      }

      const products = await Product.find({ _id: { $in: requestedIds } })
        .select('_id name price oldPrice')
        .lean()
      const productMap = new Map(products.map((product) => [String(product._id), product]))

      orderItems = payloadItems
        .map((item) => {
          const productId = String(item.productId || item.id || '')
          const product = productMap.get(productId)
          if (!product) return null

          const quantity = Math.max(1, Number(item.quantity) || 1)
          const itemPrice = Number(item.price ?? product.oldPrice ?? product.price ?? 0)

          return {
            productId: product._id,
            quantity,
            price: itemPrice,
            productName: item.productName || product.name || 'Unknown Product'
          }
        })
        .filter(Boolean)
    } else {
      // Fallback to legacy flow using server-side cart session
      cart = await Cart.findOne({ sessionId }).populate('items.productId')

      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty. Please add items to cart before placing order.'
        })
      }

      orderItems = cart.items.map((item) => {
        const product = item.productId
        const itemPrice = item.price || (product.oldPrice || product.price)
        return {
          productId: product._id,
          quantity: item.quantity,
          price: itemPrice,
          productName: product.name || 'Unknown Product'
        }
      })
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order has no valid items.'
      })
    }

    const orderTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Prepare billing address
    const billingData = {
      sameAsShipping: true,
      address: null
    }

    if (typeof billing === 'string') {
      billingData.sameAsShipping = billing !== 'different'
      billingData.address = billing === 'different' && req.body.billingAddress ? req.body.billingAddress : null
    } else if (billing && typeof billing === 'object') {
      billingData.sameAsShipping = billing.sameAsShipping !== false
      billingData.address = billing.address || null
    }

    const paymentMethod = typeof payment === 'string' ? payment : payment.method || 'cod'

    // Generate order number
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 6).toUpperCase()
    const orderNumber = `ORD-${timestamp}-${random}`
    
    // Create order
    const orderData = {
      orderNumber: orderNumber,
      sessionId,
      items: orderItems,
      total: orderTotal,
      contact: {
        email: contact.email,
        newsletter: contact.newsletter || false
      },
      delivery: {
        country: delivery.country || 'Pakistan',
        firstName: delivery.firstName,
        lastName: delivery.lastName,
        address: delivery.address,
        apartment: delivery.apartment || '',
        city: delivery.city,
        postalCode: delivery.postalCode || '',
        phone: delivery.phone,
        saveInfo: delivery.saveInfo || false
      },
      payment: {
        method: paymentMethod,
        status: 'pending'
      },
      billing: billingData,
      status: 'pending'
    }

    console.log('Creating order with data:', {
      orderNumber: orderData.orderNumber,
      sessionId: orderData.sessionId,
      itemsCount: orderData.items.length,
      total: orderData.total
    })

    const order = await Order.create(orderData)

    // Clear server cart only for legacy session-cart flow
    if (cart) {
      cart.items = []
      cart.total = 0
      await cart.save()
    }

    // Populate product details for response
    await order.populate('items.productId', 'name image price')

    console.log('Order created successfully:', {
      orderNumber: order.orderNumber,
      orderId: String(order._id),
      savedItems: order.items.length,
      savedTotal: order.total
    })

    // Send confirmation email to customer (don't wait for it to complete)
    sendOrderConfirmationEmail(order).catch(err => {
      console.error('Failed to send order confirmation email:', err)
      // Don't fail the order creation if email fails
    })

    // Send notification email to admin (don't wait for it to complete)
    sendOrderNotificationToAdmin(order).catch(err => {
      console.error('Failed to send order notification to admin:', err)
      // Don't fail the order creation if email fails
    })

    res.json({
      success: true,
      message: 'Order placed successfully!',
      data: {
        orderNumber: order.orderNumber,
        orderId: order._id,
        total: order.total,
        status: order.status
      }
    })
  } catch (err) {
    console.error('Create order error:', err)
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to place order. Please try again.'
    })
  }
}

// Get order by ID
export async function getOrder(req, res) {
  try {
    await checkDb()
    
    const { id } = req.params
    const order = await Order.findById(id).populate('items.productId', 'name image price')
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    res.json({
      success: true,
      data: order
    })
  } catch (err) {
    console.error('Get order error:', err)
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

// Get orders by session
export async function getOrders(req, res) {
  try {
    await checkDb()
    
    const sessionId = getSessionId(req)
    const orders = await Order.find({ sessionId })
      .populate('items.productId', 'name image price')
      .sort({ createdAt: -1 })
      .lean()

    res.json({
      success: true,
      data: orders
    })
  } catch (err) {
    console.error('Get orders error:', err)
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

// Update order status
export async function updateOrderStatus(req, res) {
  try {
    await checkDb()
    
    const { id } = req.params
    const { status, trackingId, courier, updateTracking } = req.body
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      })
    }
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      })
    }
    
    const order = await Order.findById(id).populate('items.productId', 'name image price')
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }
    
    const oldStatus = order.status
    const oldTrackingId = order.trackingId
    const oldCourier = order.courier
    
    order.status = status
    
    // Update tracking information if provided
    if (trackingId) {
      order.trackingId = trackingId.trim()
    }
    if (courier) {
      order.courier = courier
    }
    
    await order.save()
    
    // If status changed to delivered, send email
    // IMPORTANT: Await email sending to ensure it completes before response
    // In serverless environments, the function may terminate before async operations complete
    if (status === 'delivered' && oldStatus !== 'delivered') {
      try {
        console.log('Sending delivery email for order:', order.orderNumber)
        const emailResult = await Promise.race([
          sendOrderDeliveredEmail(order),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Email timeout after 10 seconds')), 10000)
          )
        ])
        
        if (emailResult.success) {
          console.log('✅ Delivery email sent successfully:', emailResult.messageId)
        } else {
          console.error('❌ Failed to send delivery email:', emailResult.error)
        }
      } catch (err) {
        console.error('❌ Error sending order delivered email:', err.message)
        // Don't fail the status update if email fails, but log it
      }
    }
    
    // If tracking information was updated (and order is already delivered), send updated tracking email
    if (updateTracking && status === 'delivered' && oldStatus === 'delivered' && 
        (order.trackingId !== oldTrackingId || order.courier !== oldCourier)) {
      try {
        console.log('Sending updated tracking email for order:', order.orderNumber)
        const { sendUpdatedTrackingEmail } = await import('../services/emailService.js')
        const emailResult = await Promise.race([
          sendUpdatedTrackingEmail(order, oldTrackingId, oldCourier),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Email timeout after 10 seconds')), 10000)
          )
        ])
        
        if (emailResult.success) {
          console.log('✅ Updated tracking email sent successfully:', emailResult.messageId)
        } else {
          console.error('❌ Failed to send updated tracking email:', emailResult.error)
        }
      } catch (err) {
        console.error('❌ Error sending updated tracking email:', err.message)
        // Don't fail the update if email fails
      }
    }
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    })
  } catch (err) {
    console.error('Update order status error:', err)
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

