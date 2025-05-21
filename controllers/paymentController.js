import prisma from "../config/prisma.js";

export const createPayment = async (req, res) => {
    const { products, totalAmount } = req.body;

    try {
        for (const prod of products) {
            const productExists = await prisma.product.findUnique({ where: { id: prod.productId } });
            if (!productExists) {
                return res.status(400).json({ message: `Product ID ${prod.productId} not found` });
            }
        }

        const payment = await prisma.payment.create({
            data: {
                userId: req.user.id,
                totalAmount,
                products: {
                    create: products.map(product => ({
                        productId: product.productId,
                        quantity: product.quantity
                    }))
                }
            },
            include: {
                products: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                price: true
                            }
                        }
                    }
                }
            }
        });

        res.status(201).json({ message: "Payment created successfully", payment });

    } catch (error) {
        console.error("Create Payment Error:", error);
        res.status(500).json({ message: "Failed to create payment", error: error.message });
    }
};

export const getAllPayments = async (req, res) => {
    try {
        const payments = await prisma.payment.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                products: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true
                            }
                        }
                    }
                }
            }
        });

        res.status(200).json(payments);

    } catch (error) {
        console.error("Get All Payments Error:", error);
        res.status(500).json({ message: "Failed to get payments", error: error.message });
    }
};

export const getMyPayments = async (req, res) => {
    try {
        const payments = await prisma.payment.findMany({
            where: { userId: req.user.id },
            include: {
                products: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                price: true
                            }
                        }
                    }
                }
            }
        });

        res.status(200).json(payments);

    } catch (error) {
        console.error("Get My Payments Error:", error);
        res.status(500).json({ message: "Failed to get your payments", error: error.message });
    }
};

export const updatePaymentStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["PENDING", "PAID", "CANCELLED"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    try {
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: { products: true }
        });

        if (!payment) return res.status(404).json({ message: "Payment not found" });

        const updatedPayment = await prisma.payment.update({
            where: { id },
            data: { status }
        });

        if (status === "PAID") {
            for (const item of payment.products) {
                const product = await prisma.product.findUnique({ where: { id: item.productId } });

                if (!product || product.stock < item.quantity) {
                    return res.status(400).json({ message: `Not enough stock for ${product?.name || "unknown"}` });
                }

                await prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }
        }

        if (status === "CANCELLED") {
            for (const item of payment.products) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } }
                });
            }
        }

        res.status(200).json({ message: "Payment status updated", payment: updatedPayment });

    } catch (error) {
        console.error("Update Payment Error:", error);
        res.status(500).json({ message: "Failed to update payment", error: error.message });
    }
};

export const deletePayment = async (req, res) => {
    const { id } = req.params;

    try {
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: { products: true }
        });

        if (!payment) return res.status(404).json({ message: "Payment not found" });

        for (const item of payment.products) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } }
            });
        }

        await prisma.payment.delete({ where: { id } });

        res.status(200).json({ message: "Payment deleted successfully" });

    } catch (error) {
        console.error("Delete Payment Error:", error);
        res.status(500).json({ message: "Failed to delete payment", error: error.message });
    }
};