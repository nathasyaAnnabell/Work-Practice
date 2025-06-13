import express from "express";
import { getAllUsers, getUserById, updateProfile, updateUser, deleteUser, } from "../controllers/userController.js";
import { authenticateUser, adminOnly } from "../middleware/authMiddleware.js";
import upload from '../middleware/multer.js'

const router = express.Router();
router.use(authenticateUser)

router.get("/", adminOnly, getAllUsers);
router.get("/:id", getUserById);
router.post('/profile', upload.single('image'), updateProfile);
router.patch("/:id", upload.single('image'), updateUser);
router.delete("/:id", deleteUser);

export default router;