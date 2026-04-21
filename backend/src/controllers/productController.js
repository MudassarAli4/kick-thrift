import Product from '../models/Product.js'
import mongoose from 'mongoose'
import { uploadToCloudinary } from '../middleware/upload.js'
import { ensureDbConnection } from '../config/db.js'

async function checkDb() {
  // Ensure connection is established
  const connected = await ensureDbConnection()
  if (!connected || mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected. Please try again.')
  }
}

export async function listProducts (req, res) {
  try {
    await checkDb()
    const items = await Product.find().sort({ createdAt: -1 }).lean()
    res.json({ success: true, data: items })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export async function getProduct (req, res) {
  try {
    await checkDb()
    const { id } = req.params
    const item = await Product.findById(id).lean()
    if (!item) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, data: item })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export async function createProduct (req, res) {
  try {
    await checkDb()
    
    // Handle image upload
    let imageUrl = req.body.image // If URL provided directly
    if (req.file) {
      try {
        // Upload to Cloudinary
        imageUrl = await uploadToCloudinary(req.file)
        console.log('Image uploaded to Cloudinary:', imageUrl)
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr)
        return res.status(400).json({ 
          success: false, 
          message: 'Image upload failed: ' + uploadErr.message 
        })
      }
    }
    
    if (!imageUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image is required. Please upload an image or provide an image URL.' 
      })
    }
    
    // Check if onSale is being set
    const isOnSale = req.body.onSale === 'on' || req.body.onSale === true
    
    // Build product data
    const productData = {
      name: req.body.name,
      price: parseFloat(req.body.price),
      image: imageUrl,
      availability: req.body.availability || 'in-stock',
      description: req.body.description,
      // Specifications
      movement: req.body.movement,
      dial: req.body.dial,
      chainStrap: req.body.chainStrap,
      case: req.body.case,
      caseBack: req.body.caseBack,
      crown: req.body.crown,
      glass: req.body.glass,
      size: req.body.size,
      weight: req.body.weight,
      color: req.body.color,
      shape: req.body.shape,
      warranty: req.body.warranty,
      onSale: isOnSale
    }
    
    // If onSale is false, set oldPrice to null. Otherwise, set it if provided.
    if (!isOnSale) {
      productData.oldPrice = null
    } else {
      productData.oldPrice = req.body.oldPrice ? parseFloat(req.body.oldPrice) : undefined
    }
    
    console.log('Creating product:', productData.name)
    const item = await Product.create(productData)
    console.log('Product created successfully:', item._id)
    res.status(201).json({ success: true, data: item })
  } catch (err) {
    console.error('Create product error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
}

export async function updateProduct (req, res) {
  try {
    await checkDb()
    const { id } = req.params
    
    // Get existing product to keep current image if no new one provided
    const existingProduct = await Product.findById(id)
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }
    
    // Handle image upload if new image provided
    let imageUrl = existingProduct.image // Keep existing image by default
    if (req.file) {
      try {
        // Upload new image to Cloudinary
        imageUrl = await uploadToCloudinary(req.file)
        console.log('Image updated on Cloudinary:', imageUrl)
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr)
        return res.status(400).json({ 
          success: false, 
          message: 'Image upload failed: ' + uploadErr.message 
        })
      }
    }
    
    // Check if onSale is being set to false
    const isOnSale = req.body.onSale === 'on' || req.body.onSale === true
    
    // Build update data
    const updateData = {
      name: req.body.name,
      price: parseFloat(req.body.price),
      image: imageUrl, // Always set image (either new or existing)
      availability: req.body.availability || 'in-stock',
      description: req.body.description,
      // Specifications
      movement: req.body.movement,
      dial: req.body.dial,
      chainStrap: req.body.chainStrap,
      case: req.body.case,
      caseBack: req.body.caseBack,
      crown: req.body.crown,
      glass: req.body.glass,
      size: req.body.size,
      weight: req.body.weight,
      color: req.body.color,
      shape: req.body.shape,
      warranty: req.body.warranty,
      onSale: isOnSale
    }
    
    // If onSale is false, set oldPrice to null. Otherwise, set it if provided.
    if (!isOnSale) {
      updateData.oldPrice = null
    } else {
      updateData.oldPrice = req.body.oldPrice ? parseFloat(req.body.oldPrice) : undefined
    }
    
    console.log('Updating product:', id)
    const item = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    if (!item) return res.status(404).json({ success: false, message: 'Product not found' })
    console.log('Product updated successfully:', item._id)
    res.json({ success: true, data: item })
  } catch (err) {
    console.error('Update product error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
}

export async function deleteProduct (req, res) {
  try {
    await checkDb()
    const { id } = req.params
    const item = await Product.findByIdAndDelete(id)
    if (!item) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

