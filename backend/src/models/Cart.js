import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1,
    default: 1 
  },
  price: { 
    type: Number, 
    required: true 
  }
}, { timestamps: true })

const cartSchema = new mongoose.Schema({
  sessionId: { 
    type: String, 
    required: true,
    index: true
  },
  items: [cartItemSchema],
  total: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true })

// Calculate total before saving
cartSchema.pre('save', function(next) {
  this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  next()
})

export default mongoose.model('Cart', cartSchema)

