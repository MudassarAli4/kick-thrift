import { Router } from 'express'
import { listDeliveries, getDelivery, createDelivery, updateDelivery, deleteDelivery } from '../controllers/deliveryController.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAdmin, listDeliveries)
router.get('/:id', requireAdmin, getDelivery)
router.post('/', requireAdmin, createDelivery)
router.put('/:id', requireAdmin, updateDelivery)
router.delete('/:id', requireAdmin, deleteDelivery)

export default router

