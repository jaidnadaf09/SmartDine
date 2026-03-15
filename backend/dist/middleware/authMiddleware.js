"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffOnly = exports.chefOnly = exports.adminOnly = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log("Processing token:", token ? "Token present" : "Token missing");
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            console.log("Decoded user ID:", decoded.id);
            const user = await User_1.default.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });
            if (!user) {
                console.warn(`User with ID ${decoded.id} not found in database`);
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            req.user = user.get();
            next();
        }
        catch (error) {
            console.error("Auth error:", error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    else {
        console.warn("No Authorization header found or doesn't start with Bearer");
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
exports.protect = protect;
const adminOnly = (req, res, next) => {
    if (req.user) {
        console.log(`Checking admin role for user: ${req.user.email}, Role: ${req.user.role}`);
        if (req.user.role === 'admin') {
            next();
        }
        else {
            console.warn(`Access denied for role: ${req.user.role}. Admin only.`);
            res.status(403).json({ message: 'Not authorized as an admin' });
        }
    }
    else {
        console.warn("req.user is undefined in adminOnly check");
        res.status(401).json({ message: 'Not authorized, user missing' });
    }
};
exports.adminOnly = adminOnly;
const chefOnly = (req, res, next) => {
    if (req.user) {
        if (req.user.role === 'chef' || req.user.role === 'CHEF' || req.user.role === 'admin') {
            next();
        }
        else {
            res.status(403).json({ message: 'Not authorized as a chef' });
        }
    }
    else {
        res.status(401).json({ message: 'Not authorized, user missing' });
    }
};
exports.chefOnly = chefOnly;
const staffOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'chef' || req.user.role === 'CHEF' || req.user.role === 'WAITER')) {
        next();
    }
    else {
        res.status(403).json({ message: 'Not authorized as staff' });
    }
};
exports.staffOnly = staffOnly;
