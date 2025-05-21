import express from "express";
import { getDashboardStats } from "../controllers/statsController.js";
import { getProductSalesReport } from '../controllers/statsController.js';
import { authenticateUser, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateUser)
router.get("/", adminOnly, getDashboardStats);
router.get('/sales-report', adminOnly, getProductSalesReport);

export default router;