import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1
  },
  price: { 
    type: Number, 
    required: true 
  },
  productName: {
    type: String,
    required: true
  }
}, { _id: false })

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true
  },
  // Contact Information
  contact: {
    email: { type: String, required: true },
    newsletter: { type: Boolean, default: false }
  },
  // Delivery Information
  delivery: {
    country: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    apartment: { type: String },
    city: { type: String, required: true },
    postalCode: { type: String },
    phone: { type: String, required: true },
    saveInfo: { type: Boolean, default: false }
  },
  // Payment Information
  payment: {
    method: { type: String, required: true, enum: ['cod'] },
    status: { type: String, default: 'pending', enum: ['pending', 'paid', 'failed'] }
  },
  // Billing Information
  billing: {
    sameAsShipping: { type: Boolean, default: true },
    address: {
      country: { type: String },
      firstName: { type: String },
      lastName: { type: String },
      address: { type: String },
      apartment: { type: String },
      city: { type: String },
      postalCode: { type: String },
      phone: { type: String }
    }
  },
  // Order Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  // Tracking Information
  trackingId: {
    type: String,
    default: ''
  },
  courier: {
    type: String,
    enum: ['TCS', 'M&P', 'other'],
    default: null
  }
}, { timestamps: true })

// Generate unique order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.isNew || this.orderNumber) {
    return next()
  }
  
  try {
    // Generate unique order number
    let orderNumber
    let isUnique = false
    let attempts = 0
    const maxAttempts = 10
    
    while (!isUnique && attempts < maxAttempts) {
      const timestamp = Date.now()
      const random = Math.random().toString(36).substr(2, 6).toUpperCase()
      orderNumber = `ORD-${timestamp}-${random}`
      
      // Check if order number already exists
      const existing = await mongoose.model('Order').findOne({ orderNumber })
      if (!existing) {
        isUnique = true
      }
      attempts++
    }
    
    if (!isUnique) {
      // Fallback: use timestamp and random if uniqueness check fails
      const timestamp = Date.now()
      const random = Math.random().toString(36).substr(2, 9).toUpperCase()
      orderNumber = `ORD-${timestamp}-${random}`
    }
    
    this.orderNumber = orderNumber
    next()
  } catch (error) {
    // Fallback if anything goes wrong
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9).toUpperCase()
    this.orderNumber = `ORD-${timestamp}-${random}`
    next()
  }
})

export default mongoose.model('Order', orderSchema)

