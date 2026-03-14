import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User';

const generateToken = (id: number) => {
    const secret = process.env.JWT_SECRET || 'fallback_secret_key_12345';
    return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, role, phone } = req.body;

    try {
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone: phone || null,
            role: role || 'customer',
        });

        if (user) {
            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone || null,
                profileImage: user.profileImage || null,
                role: user.role.toLowerCase(),
                walletBalance: Number(user.walletBalance || 0),
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error: any) {
        console.error("Register error:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user: any = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const storedPassword = user.password || user.dataValues?.password;

        if (!storedPassword) {
            return res.status(500).json({ message: "Password not found for user" });
        }

        const isMatch = await bcrypt.compare(password, storedPassword);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || null,
            profileImage: user.profileImage || null,
            role: user.role.toLowerCase(),
            walletBalance: Number(user.walletBalance || user.dataValues?.walletBalance || 0),
            token: generateToken(user.id),
        });

    } catch (error: any) {
        console.error("Login error:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};
export const updateProfile = async (req: AuthRequest, res: Response) => {
    const { name, phone } = req.body;

    try {
        const user = await User.findByPk(req.user!.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validations
        if (name && name.trim().length < 3) {
            return res.status(400).json({ message: 'Name must be at least 3 characters long' });
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (phone && !phoneRegex.test(phone)) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
        }

        // Update fields
        user.name = name || user.name;
        user.phone = phone || user.phone;
        if (req.body.profileImage !== undefined) {
            user.profileImage = req.body.profileImage;
        }

        await user.save();

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            profileImage: user.profileImage,
            role: user.role.toLowerCase(),
            walletBalance: Number(user.walletBalance || 0),
            createdAt: user.createdAt,
            token: generateToken(user.id),
        });
    } catch (error: any) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findByPk(req.user!.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.password) {
            return res.status(400).json({ message: 'User password not set' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        console.error("Change password error:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user: any = await User.findByPk(req.user!.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || null,
            profileImage: user.profileImage || null,
            role: user.role.toLowerCase(),
            walletBalance: Number(user.walletBalance || user.dataValues?.walletBalance || 0),
            createdAt: user.createdAt,
        });
    } catch (error: any) {
        console.error("Get me error:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};
