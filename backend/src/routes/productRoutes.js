import { Router } from 'express'
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js'
import { uploadSingle } from '../middleware/upload.js'

const router = Router()

router.get('/', listProducts)
router.get('/:id', getProduct)
router.post('/', uploadSingle, createProduct)
router.put('/:id', uploadSingle, updateProduct)
router.delete('/:id', deleteProduct)

export default router

