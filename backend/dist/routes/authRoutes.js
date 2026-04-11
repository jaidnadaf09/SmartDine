"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Specific limiter for login attempts
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login attempts per windowMs
    message: "Too many login attempts. Please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
});
// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
], validate, authController_1.registerUser);
router.post('/login', loginLimiter, [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
], validate, authController_1.loginUser);
router.put('/profile', authMiddleware_1.protect, authController_1.updateProfile);
router.put('/change-password', authMiddleware_1.protect, authController_1.changePassword);
router.get('/me', authMiddleware_1.protect, authController_1.getMe);
router.delete('/profile/photo', authMiddleware_1.protect, authController_1.removeProfilePhoto);
exports.default = router;
