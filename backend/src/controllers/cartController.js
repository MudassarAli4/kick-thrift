import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import mongoose from 'mongoose'
import { ensureDbConnection } from '../config/db.js'

async function checkDb() {
  const connected = await ensureDbConnection()
  if (!connected || mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected. Please try again.')
  }
}

// Get or create session ID
function getSessionId(req) {
  // Try to get from cookie first
  let sessionId = req.cookies?.cartSessionId
  
  // If no cookie, try to get from header (for localStorage fallback)
  if (!sessionId) {
    sessionId = req.headers['x-session-id']
  }
  
  // Debug: log cookie info
  console.log('Cookies received:', req.cookies)
  console.log('Header X-Session-Id:', req.headers['x-session-id'])
  console.log('Session ID from cookie/header:', sessionId)
  
  // If no session ID, generate new one
  if (!sessionId) {
    sessionId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log('Generated new session ID:', sessionId)
  }
  
  return sessionId
}

// Add item to cart
export async function addToCart(req, res) {
  try {
    await checkDb()
    
    const { productId, quantity = 1 } = req.body
    
    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      })
    }

    // Validate product exists
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      })
    }

    // Check availability
    if (product.availability !== 'in-stock') {
      return res.status(400).json({ 
        success: false, 
        message: 'Product is out of stock' 
      })
    }

    const sessionId = getSessionId(req)
    const qty = parseInt(quantity, 10) || 1

    // Find or create cart
    let cart = await Cart.findOne({ sessionId })
    
    if (!cart) {
      cart = await Cart.create({ 
        sessionId, 
        items: [] 
      })
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    )

    // Use oldPrice (sale price) if exists, otherwise use price (regular price)
    const itemPrice = product.oldPrice || product.price
    
    if (existingItemIndex >= 0) {
      // Update quantity and price (in case price changed)
      cart.items[existingItemIndex].quantity += qty
      cart.items[existingItemIndex].price = itemPrice
    } else {
      // Add new item
      cart.items.push({
        productId: product._id,
        quantity: qty,
        price: itemPrice
      })
    }

    // Save cart (total will be calculated by pre-save hook)
    await cart.save()
    
    // Populate product details for response (include oldPrice for discount display)
    await cart.populate('items.productId', 'name image price oldPrice')

    // Set cookie for session ID
    res.cookie('cartSessionId', sessionId, { 
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // Set to true in production with HTTPS
      path: '/'
    })
    console.log('Set cookie cartSessionId:', sessionId)

    res.json({ 
      success: true, 
      message: 'Item added to cart successfully',
      data: cart 
    })
  } catch (err) {
    console.error('Add to cart error:', err)
    res.status(500).json({ 
      success: false, 
      message: err.message 
    })
  }
}

// Get cart
export async function getCart(req, res) {
  try {
    await checkDb()
    
    const sessionId = getSessionId(req)
    let cart = await Cart.findOne({ sessionId }).populate('items.productId', 'name image price oldPrice availability')
    
    if (!cart) {
      cart = await Cart.create({ 
        sessionId, 
        items: [] 
      })
    }

    res.cookie('cartSessionId', sessionId, { 
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // Set to true in production with HTTPS
      path: '/'
    })
    console.log('Set cookie cartSessionId in getCart:', sessionId)

    res.json({ 
      success: true, 
      data: cart 
    })
  } catch (err) {
    console.error('Get cart error:', err)
    res.status(500).json({ 
      success: false, 
      message: err.message 
    })
  }
}

// Update cart item quantity
export async function updateCartItem(req, res) {
  try {
    await checkDb()
    
    const { itemId } = req.params
    const { quantity } = req.body
    
    console.log('Update cart item - itemId:', itemId, 'quantity:', quantity)
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quantity must be at least 1' 
      })
    }

    const sessionId = getSessionId(req)
    console.log('Update cart item - sessionId:', sessionId)
    
    const cart = await Cart.findOne({ sessionId })
    
    if (!cart) {
      console.log('Cart not found for sessionId:', sessionId)
      return res.status(404).json({ 
        success: false, 
        message: 'Cart not found' 
      })
    }

    console.log('Cart found, items:', cart.items.map(i => ({ id: i._id.toString(), productId: i.productId })))
    
    const item = cart.items.id(itemId)
    if (!item) {
      console.log('Item not found in cart. itemId:', itemId, 'Available IDs:', cart.items.map(i => i._id.toString()))
      return res.status(404).json({ 
        success: false, 
        message: 'Cart item not found' 
      })
    }

    item.quantity = parseInt(quantity, 10)
    await cart.save()
    
    await cart.populate('items.productId', 'name image price oldPrice')

    res.json({ 
      success: true, 
      message: 'Cart updated successfully',
      data: cart 
    })
  } catch (err) {
    console.error('Update cart error:', err)
    res.status(500).json({ 
      success: false, 
      message: err.message 
    })
  }
}

// Remove item from cart
export async function removeCartItem(req, res) {
  try {
    await checkDb()
    
    const { itemId } = req.params
    const sessionId = getSessionId(req)
    
    console.log('Remove cart item - itemId:', itemId, 'sessionId:', sessionId)
    
    const cart = await Cart.findOne({ sessionId })
    
    if (!cart) {
      console.log('Cart not found for sessionId:', sessionId)
      return res.status(404).json({ 
        success: false, 
        message: 'Cart not found' 
      })
    }

    console.log('Cart found, items before remove:', cart.items.map(i => ({ id: i._id.toString(), productId: i.productId })))
    
    const item = cart.items.id(itemId)
    if (!item) {
      console.log('Item not found in cart. itemId:', itemId, 'Available IDs:', cart.items.map(i => i._id.toString()))
      return res.status(404).json({ 
        success: false, 
        message: 'Cart item not found' 
      })
    }

    cart.items.pull(itemId)
    await cart.save()
    
    await cart.populate('items.productId', 'name image price oldPrice')

    res.json({ 
      success: true, 
      message: 'Item removed from cart',
      data: cart 
    })
  } catch (err) {
    console.error('Remove cart item error:', err)
    res.status(500).json({ 
      success: false, 
      message: err.message 
    })
  }
}

// Clear cart
export async function clearCart(req, res) {
  try {
    await checkDb()
    
    const sessionId = getSessionId(req)
    const cart = await Cart.findOne({ sessionId })
    
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart not found' 
      })
    }

    cart.items = []
    await cart.save()

    res.json({ 
      success: true, 
      message: 'Cart cleared successfully',
      data: cart 
    })
  } catch (err) {
    console.error('Clear cart error:', err)
    res.status(500).json({ 
      success: false, 
      message: err.message 
    })
  }
}

