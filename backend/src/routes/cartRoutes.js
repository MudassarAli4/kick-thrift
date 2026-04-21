import { Router } from 'express'
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../controllers/cartController.js'

const router = Router()

router.post('/add', addToCart)
router.get('/', getCart)
router.put('/item/:itemId', updateCartItem)
router.delete('/item/:itemId', removeCartItem)
router.delete('/clear', clearCart)

export default router

