import { Router } from 'express'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

router.use(verifyToken)

router.get('/', getProducts)
router.post('/', createProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

export default router
