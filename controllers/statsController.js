import prisma from "../config/prisma.js";

export const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalProducts, totalReviews] = await Promise.all([
            prisma.user.count(),
            prisma.product.count(),
            prisma.review.count(),
        ]);

        const pendingPayments = await prisma.payment.count({
            where: { status: "PENDING" },
        });

        const soldProducts = await prisma.paymentProduct.findMany({
            where: {
                payment: { status: "PAID" },
            },
        });

        const totalSold = soldProducts.reduce((sum, p) => sum + p.quantity, 0);
        res.status(200).json({
            totalUsers,
            totalProducts,
            totalReviews,
            pendingPayments,
            totalSoldProducts: totalSold,
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch dashboard stats",
            error: error.message,
        });
    }
};

export const getProductSalesReport = async (req, res) => {
    try {
        const soldProducts = await prisma.paymentProduct.findMany({
            where: {
                payment: { status: 'PAID' }
            },
            select: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        stock: true
                    }
                },
                quantity: true
            }
        });

        const reportMap = {};

        soldProducts.forEach(({ product, quantity }) => {
            if (!reportMap[product.id]) {
                reportMap[product.id] = {
                    name: product.name,
                    price: product.price,
                    sold: 0,
                    currentStock: product.stock
                };
            }
            reportMap[product.id].sold += quantity;
        });

        const report = Object.values(reportMap);

        res.status(200).json({
            message: 'Product sales report generated successfully',
            data: report
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to generate product sales report',
            error: error.message
        });
    }
};