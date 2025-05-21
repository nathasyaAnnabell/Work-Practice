import fs from 'fs';
import path from 'path';
import prisma from '../config/prisma.js';

export const createProduct = async (req, res) => {
    const { name, description, volume, price, stock } = req.body;
    const image = req.file?.filename;

    try {
        const newProduct = await prisma.product.create({
            data: {
                image,
                name,
                description,
                volume,
                price: parseFloat(price),
                stock: parseInt(stock),
            },
        });

        res.status(201).json({ message: 'Product created successfully', product: newProduct });

    } catch (error) {
        res.status(500).json({ message: 'Failed to create product', error: error.message });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                image: true,
                name: true,
                description: true,
                volume: true,
                price: true,
            },
        });
        res.status(200).json({ message: 'Products retrieved successfully', products });

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products', error: error.message });
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const avgRating = await prisma.review.aggregate({
            where: { productId: id },
            _avg: { rating: true },
        });

        if (avgRating._avg.rating !== null) {
            product.rating = avgRating._avg.rating;
        }

        res.status(200).json({ message: 'Product retrieved successfully', product });

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch product', error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, volume, price, stock } = req.body;

    try {
        const oldProduct = await prisma.product.findUnique({ where: { id } });
        if (!oldProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const updateData = {
            name: name ?? oldProduct.name,
            description: description ?? oldProduct.description,
            volume: volume ?? oldProduct.volume,
            price: price !== undefined ? parseFloat(price) : oldProduct.price,
            stock: stock !== undefined ? parseInt(stock) : oldProduct.stock,
        };

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: updateData,
        });

        res.json({ message: 'Product updated successfully', product: updatedProduct });

    } catch (error) {
        res.status(500).json({ message: 'Failed to update product', error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const imagePath = path.join('uploads', product.image);
        if (product.image && fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await prisma.cartItem.deleteMany({ where: { productId: id } });
        await prisma.product.delete({ where: { id } });

        res.status(200).json({ message: 'Product and related cart items deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product', error: error.message });
    }
};