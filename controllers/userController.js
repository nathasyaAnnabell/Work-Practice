import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import prisma from "../config/prisma.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        res.status(200).json(users);

    } catch (error) {
        res.status(500).json({ message: "Failed to get users", error });
    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                image: true,
                name: true,
                email: true,
                gender: true,
                birthDate: true,
                phone: true,
                role: true,
            },
        });

        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({ message: "Failed to get user", error });
    }
};

export const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { gender, birthDate, phone } = req.body;
    const image = req.file?.filename;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(image && { image }),
                ...(gender && { gender }),
                ...(phone && { phone }),
                ...(birthDate && !isNaN(new Date(birthDate).getTime()) && { birthDate: new Date(birthDate) }),
            },
        });

        console.log('📝 User profile updated');
        res.status(200).json({
            message: 'Profile updated',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                image: updatedUser.image,
                gender: updatedUser.gender,
                birthDate: updatedUser.birthDate,
                phone: updatedUser.phone,
            },
        });
    } catch (err) {
        console.error('❌ Update profile error:', err);
        res.status(500).json({ message: err.message });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, gender, birthDate, phone, currentEmail, newPassword } = req.body;
    const image = req.file?.filename;

    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ message: "User not found" });

        const updateData = {};

        if (image) updateData.image = image;
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (gender) updateData.gender = gender;
        if (birthDate) updateData.birthDate = new Date(birthDate);
        if (phone) updateData.phone = Number(phone);

        if (newPassword) {
            if (!currentEmail) {
                return res.status(400).json({ message: "Current email is required to update password" });
            }

            if (currentEmail !== user.email) {
                return res.status(401).json({ message: "Email verification failed" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateData.password = hashedPassword;
        }

        if (image) {
            if (user.image) {
                const oldImagePath = path.join(__dirname, '../uploads', user.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateData.image = image;
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
            }
        });

        res.status(200).json({ message: "User updated", user: updatedUser });

    } catch (error) {
        res.status(500).json({ message: "Failed to update user", error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.image) {
            const imagePath = path.join(__dirname, '../uploads', user.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        await prisma.cartItem.deleteMany({
            where: { userId: id }
        });

        await prisma.user.delete({ where: { id } });

        res.status(200).json({ message: 'User deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
};