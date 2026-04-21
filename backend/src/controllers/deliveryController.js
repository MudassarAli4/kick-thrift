import Delivery from '../models/Delivery.js'
import { ensureDbConnection } from '../config/db.js'
import mongoose from 'mongoose'

async function checkDb() {
  const connected = await ensureDbConnection()
  if (!connected || mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected. Please try again.')
  }
}

export async function listDeliveries (req, res) {
  try {
    await checkDb()
    const items = await Delivery.find().sort({ createdAt: -1 }).lean()
    res.json({ success: true, data: items })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export async function getDelivery (req, res) {
  try {
    await checkDb()
    const { id } = req.params
    const item = await Delivery.findById(id).lean()
    if (!item) return res.status(404).json({ success: false, message: 'Delivery not found' })
    res.json({ success: true, data: item })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export async function createDelivery (req, res) {
  try {
    await checkDb()
    const item = await Delivery.create(req.body)
    res.status(201).json({ success: true, data: item })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export async function updateDelivery (req, res) {
  try {
    await checkDb()
    const { id } = req.params
    const item = await Delivery.findByIdAndUpdate(id, req.body, { new: true })
    if (!item) return res.status(404).json({ success: false, message: 'Delivery not found' })
    res.json({ success: true, data: item })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export async function deleteDelivery (req, res) {
  try {
    await checkDb()
    const { id } = req.params
    const item = await Delivery.findByIdAndDelete(id)
    if (!item) return res.status(404).json({ success: false, message: 'Delivery not found' })
    res.json({ success: true, message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

