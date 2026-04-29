import { Router } from 'express'
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js'
import { uploadProductImages } from '../middleware/upload.js'

const router = Router()

router.get('/', listProducts)
router.get('/:id', getProduct)
router.post('/', uploadProductImages, createProduct)
router.put('/:id', uploadProductImages, updateProduct)
router.delete('/:id', deleteProduct)

export default router

