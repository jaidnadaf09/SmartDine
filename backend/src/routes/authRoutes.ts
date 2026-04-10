import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { registerUser, loginUser, updateProfile, changePassword, getMe, removeProfilePhoto } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Specific limiter for login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login attempts per windowMs
    message: "Too many login attempts. Please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware to handle validation errors
const validate = (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('name').notEmpty().withMessage('Name is required'),
    ],
    validate,
    registerUser
);

router.post(
    '/login',
    loginLimiter,
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    loginUser
);

router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/me', protect, getMe);
router.delete('/profile/photo', protect, removeProfilePhoto);

export default router;
