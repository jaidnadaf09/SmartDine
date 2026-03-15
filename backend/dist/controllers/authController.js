"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.changePassword = exports.updateProfile = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'fallback_secret_key_12345';
    return jsonwebtoken_1.default.sign({ id }, secret, { expiresIn: '2h' });
};
const registerUser = async (req, res) => {
    const { name, email, password, role, phone } = req.body;
    try {
        const userExists = await User_1.default.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const user = await User_1.default.create({
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
        }
        else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const storedPassword = user.password || user.dataValues?.password;
        if (!storedPassword) {
            return res.status(500).json({ message: "Password not found for user" });
        }
        const isMatch = await bcrypt_1.default.compare(password, storedPassword);
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
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};
exports.loginUser = loginUser;
const updateProfile = async (req, res) => {
    const { name, phone } = req.body;
    try {
        const user = await User_1.default.findByPk(req.user.id);
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
    }
    catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User_1.default.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.password) {
            return res.status(400).json({ message: 'User password not set' });
        }
        const isMatch = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        user.password = await bcrypt_1.default.hash(newPassword, salt);
        await user.save();
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};
exports.changePassword = changePassword;
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findByPk(req.user.id);
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
    }
    catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};
exports.getMe = getMe;
