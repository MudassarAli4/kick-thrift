import { Router } from 'express'
import {
  createOrder,
  getOrder,
  getOrders,
  updateOrderStatus
} from '../controllers/orderController.js'

const router = Router()

router.post('/create', createOrder)
router.put('/:id/status', updateOrderStatus)
router.get('/:id', getOrder)
router.get('/', getOrders)

export default router

