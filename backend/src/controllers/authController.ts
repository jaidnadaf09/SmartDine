import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User';

const generateToken = (id: number) => {
    const secret = process.env.JWT_SECRET || 'fallback_secret_key_12345';
    return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'customer',
        });

        if (user) {
            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.toLowerCase(),
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
            role: user.role.toLowerCase(),
            token: generateToken(user.id),
        });

    } catch (error: any) {
        console.error("Login error:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};
