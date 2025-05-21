import express from "express";
import { createPayment, getAllPayments, getMyPayments, updatePaymentStatus, deletePayment } from "../controllers/paymentController.js";
import { authenticateUser, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authenticateUser);

router.post("/", createPayment);            
router.get("/my", getMyPayments);           
router.get("/", adminOnly, getAllPayments);
router.patch("/:id", adminOnly, updatePaymentStatus); 
router.delete("/:id", adminOnly, deletePayment);     

export default router;