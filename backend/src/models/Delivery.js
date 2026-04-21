import mongoose from 'mongoose'

const deliverySchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  address: { type: String, required: true },
  items: [{ productId: String, name: String, qty: Number }],
  status: { type: String, enum: ['new', 'pending', 'shipped', 'delivered', 'cancelled'], default: 'new' }
}, { timestamps: true })

export default mongoose.model('Delivery', deliverySchema)

