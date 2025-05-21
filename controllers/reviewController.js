import prisma from '../config/prisma.js'

export const createReview = async (req, res) => {
    const { productId, comment, rating } = req.body
    const userId = req.user.id

    const product = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    if (!comment || comment.trim() === "") {
        return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    try {
        const review = await prisma.review.create({
            data: {
                userId,
                productId,
                comment,
                rating
            }
        })

        res.status(201).json({ message: 'Review added', review })

    } catch (err) {
        res.status(500).json({ message: 'Failed to create review', error: err.message })
    }
}

export const getAllReviews = async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            select: {
                id: true,
                comment: true,
                rating: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                product: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.status(200).json(reviews);

    } catch (err) {
        res.status(500).json({ message: 'Failed to get reviews', error: err.message })
    }
}

export const getReviewsByProductId = async (req, res) => {
    const { productId } = req.params

    try {
        const reviews = await prisma.review.findMany({
            where: { productId },
            select: {
                id: true,
                comment: true,
                rating: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        });

        const avgResult = await prisma.review.aggregate({
            where: { productId },
            _avg: { rating: true }
        });

        const averageRating = avgResult._avg.rating;

        const totalReviews = await prisma.review.count({
            where: { productId }
        });

        res.status(200).json({
            reviews,
            averageRating,
            totalReviews
        });

    } catch (err) {
        res.status(500).json({ message: 'Failed to get reviews for product', error: err.message })
    }
}

export const updateReview = async (req, res) => {
    const { id } = req.params
    const { comment, rating } = req.body
    const userId = req.user.id

    if (rating !== undefined && (rating < 1 || rating > 5)) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (comment !== undefined && comment.trim() === "") {
        return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    try {
        const updated = await prisma.review.updateMany({
            where: { id, userId },
            data: { comment, rating }
        })

        if (updated.count === 0) return res.status(404).json({ message: 'Review not found or unauthorized' })
        res.status(200).json({ message: 'Review updated' })

    } catch (err) {
        res.status(500).json({ message: 'Failed to update review', error: err.message })
    }
}

export const deleteReview = async (req, res) => {
    const { id } = req.params
    const userId = req.user.id

    try {
        const review = await prisma.review.findFirst({ where: { id, userId } })
        if (!review) return res.status(404).json({ message: 'Review not found' })
        await prisma.review.delete({ where: { id } })

        res.status(200).json({ message: 'Review deleted' })

    } catch (err) {
        res.status(500).json({ message: 'Failed to delete review', error: err.message })
    }
}
