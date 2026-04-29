import Product from '../models/Product.js'
import mongoose from 'mongoose'
import { uploadFilesToCloudinary, uploadToCloudinary } from '../middleware/upload.js'
import { ensureDbConnection } from '../config/db.js'

async function checkDb() {
  // Ensure connection is established
  const connected = await ensureDbConnection()
  if (!connected || mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected. Please try again.')
  }
}

function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
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
    
    const uploadedFiles = [
      ...(req.files?.images || []),
      ...(req.files?.image || []),
      ...(req.file ? [req.file] : [])
    ]

    const directImages = Array.isArray(req.body.images)
      ? req.body.images
      : typeof req.body.images === 'string' && req.body.images.trim()
        ? req.body.images.split(',').map((item) => item.trim()).filter(Boolean)
        : []

    // Handle image upload
    let imageUrls = directImages
    if (uploadedFiles.length > 0) {
      try {
        imageUrls = await uploadFilesToCloudinary(uploadedFiles)
        console.log('Images uploaded to Cloudinary:', imageUrls)
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr)
        return res.status(400).json({ 
          success: false, 
          message: 'Image upload failed: ' + uploadErr.message 
        })
      }
    }
    
    if (imageUrls.length === 0 && req.body.image) {
      imageUrls = [req.body.image]
    }

    if (!imageUrls.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one product image is required. Please upload one or more images or provide an image URL.' 
      })
    }
    
    // Check if onSale is being set
    const isOnSale = req.body.onSale === 'on' || req.body.onSale === true
    const advancePayment = parseOptionalNumber(req.body.advancePayment)
    const receivedAmount = parseOptionalNumber(req.body.receivedAmount)
    const remainingPayment = parseOptionalNumber(req.body.remainingPayment)
    const derivedSellingPrice = (advancePayment ?? 0) + (remainingPayment ?? 0)
    
    // Build product data
    const productData = {
      name: req.body.name,
      price: parseFloat(req.body.price),
      buyPrice: parseOptionalNumber(req.body.buyPrice),
      advancePayment,
      receivedAmount,
      remainingPayment,
      sellingPrice: parseOptionalNumber(req.body.sellingPrice) ?? derivedSellingPrice,
      image: imageUrls[0],
      images: imageUrls,
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
    
    const existingImages = Array.isArray(existingProduct.images) && existingProduct.images.length > 0
      ? existingProduct.images
      : existingProduct.image
        ? [existingProduct.image]
        : []

    const uploadedFiles = [
      ...(req.files?.images || []),
      ...(req.files?.image || []),
      ...(req.file ? [req.file] : [])
    ]

    const directImages = Array.isArray(req.body.images)
      ? req.body.images
      : typeof req.body.images === 'string' && req.body.images.trim()
        ? req.body.images.split(',').map((item) => item.trim()).filter(Boolean)
        : []

    // Handle image upload if new image provided
    let imageUrls = existingImages.length > 0 ? existingImages : [existingProduct.image].filter(Boolean)
    if (uploadedFiles.length > 0) {
      try {
        imageUrls = await uploadFilesToCloudinary(uploadedFiles)
        console.log('Images updated on Cloudinary:', imageUrls)
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr)
        return res.status(400).json({ 
          success: false, 
          message: 'Image upload failed: ' + uploadErr.message 
        })
      }
    } else if (directImages.length > 0) {
      imageUrls = directImages
    }
    
    // Check if onSale is being set to false
    const isOnSale = req.body.onSale === 'on' || req.body.onSale === true
    const nextAdvancePayment = parseOptionalNumber(req.body.advancePayment) ?? existingProduct.advancePayment
    const nextReceivedAmount = parseOptionalNumber(req.body.receivedAmount) ?? existingProduct.receivedAmount
    const nextRemainingPayment = parseOptionalNumber(req.body.remainingPayment) ?? existingProduct.remainingPayment
    const derivedSellingPrice = (nextAdvancePayment ?? 0) + (nextRemainingPayment ?? 0)
    
    // Build update data
    const updateData = {
      name: req.body.name,
      price: parseFloat(req.body.price),
      buyPrice: parseOptionalNumber(req.body.buyPrice) ?? existingProduct.buyPrice,
      advancePayment: nextAdvancePayment,
      receivedAmount: nextReceivedAmount,
      remainingPayment: nextRemainingPayment,
      sellingPrice: parseOptionalNumber(req.body.sellingPrice) ?? derivedSellingPrice,
      image: imageUrls[0] || existingProduct.image || '', // Always set image (either new or existing)
      images: imageUrls,
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

