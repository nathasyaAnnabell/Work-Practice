import express from 'express'
import { addToCart, getCartItems, getCartItemById, updateCartItem, deleteCartItem } from '../controllers/cartController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'

const router = express.Router()
router.use(authenticateUser)

router.post('/', addToCart)               
router.get('/', getCartItems)             
router.get('/:id', getCartItemById)       
router.patch('/:id', updateCartItem) 
router.delete('/:id', deleteCartItem)

export default router