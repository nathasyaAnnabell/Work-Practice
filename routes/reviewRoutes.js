import express from 'express'
import { createReview, getAllReviews, getReviewsByProductId, updateReview, deleteReview } from '../controllers/reviewController.js'
import { authenticateUser, adminOnly } from '../middleware/authMiddleware.js'

const router = express.Router()
router.use(authenticateUser)

router.post('/', createReview)
router.get('/', adminOnly, getAllReviews)
router.get('/product/:productId', getReviewsByProductId)
router.patch('/:id', updateReview)
router.delete('/:id', deleteReview)

export default router