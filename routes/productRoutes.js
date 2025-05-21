import express from 'express'
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from '../controllers/productController.js'

import { authenticateUser, adminOnly } from '../middleware/authMiddleware.js'
import upload from '../middleware/multer.js'

const router = express.Router()
router.use(authenticateUser)

router.post('/', adminOnly, upload.single('image'), createProduct)
router.get('/', getAllProducts)
router.get('/:id', getProductById)
router.patch('/:id', adminOnly, updateProduct)
router.delete('/:id', adminOnly, deleteProduct)

export default router