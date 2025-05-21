import prisma from '../config/prisma.js';

export const addToCart = async (req, res) => {
    let { productId, quantity } = req.body;
    const userId = req.user.id;

    if (quantity === undefined) {
        quantity = 1;
    } else if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }

    try {
        const product = await prisma.product.findUnique({ where: { id: productId } });

        if (!product || quantity > product.stock) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        const existing = await prisma.cartItem.findFirst({
            where: { userId, productId }
        })

        if (existing) {
            const updated = await prisma.cartItem.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + quantity }
            })

            return res.status(200).json({ message: 'Cart updated', cartItem: updated })
        }

        const cartItem = await prisma.cartItem.create({
            data: {
                userId,
                productId,
                quantity
            }
        })

        res.status(201).json({ message: 'Product added to cart', cartItem })

    } catch (err) {
        res.status(500).json({ message: 'Failed to add to cart', error: err.message })
    }
};

export const getCartItems = async (req, res) => {
    const userId = req.user.id

    try {
        const cartItems = await prisma.cartItem.findMany({
            where: { userId },
            select: {
                id: true,
                quantity: true,
                product: {
                    select: {
                        id: true,
                        image: true,
                        name: true,
                        volume: true,
                        price: true
                    }
                }
            }
        });

        res.status(200).json(cartItems);

    } catch (err) {
        res.status(500).json({ message: 'Failed to get cart', error: err.message })
    }
}

export const getCartItemById = async (req, res) => {
    const { id } = req.params
    const userId = req.user.id

    try {
        const item = await prisma.cartItem.findFirst({
            where: { id, userId },
            select: {
                id: true,
                quantity: true,
                product: {
                    select: {
                        id: true,
                        image: true,
                        name: true,
                        volume: true,
                        price: true
                    }
                }
            }
        });

        if (!item) return res.status(404).json({ message: 'Cart item not found' });

        res.status(200).json(item);

    } catch (err) {
        res.status(500).json({ message: 'Failed to get item', error: err.message })
    }
}

export const updateCartItem = async (req, res) => {
    const { id } = req.params
    const { quantity } = req.body
    const userId = req.user.id

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }

    try {
        const cartItem = await prisma.cartItem.findUnique({ where: { id } });
        if (!cartItem || cartItem.userId !== userId) {
            return res.status(404).json({ message: 'Item not found or unauthorized' });
        }

        const product = await prisma.product.findUnique({ where: { id: cartItem.productId } });
        if (quantity > product.stock) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        const updated = await prisma.cartItem.update({
            where: { id },
            data: { quantity },
        });

        res.status(200).json({ message: 'Cart updated', cartItem: updated });

    } catch (err) {
        res.status(500).json({ message: 'Failed to update cart', error: err.message });
    }
};

export const deleteCartItem = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const cartItem = await prisma.cartItem.findUnique({
            where: { id },
        });

        if (!cartItem || cartItem.userId !== userId) {
            return res.status(404).json({ message: 'Cart item not found or unauthorized' });
        }

        await prisma.cartItem.delete({
            where: { id },
        });

        res.status(200).json({ message: 'Cart item deleted' });

    } catch (err) {
        res.status(500).json({ message: 'Failed to delete cart item', error: err.message });
    }
};