import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  image: { type: String },
  availability: { type: String, enum: ['in-stock', 'out-of-stock'], default: 'in-stock' },
  description: { type: String },
  // Product specifications
  movement: { type: String },
  dial: { type: String },
  chainStrap: { type: String },
  case: { type: String },
  caseBack: { type: String },
  crown: { type: String },
  glass: { type: String },
  size: { type: String },
  weight: { type: String },
  color: { type: String },
  shape: { type: String },
  warranty: { type: String },
  // Sale tag
  onSale: { type: Boolean, default: false }
}, { timestamps: true })

export default mongoose.model('Product', productSchema)

