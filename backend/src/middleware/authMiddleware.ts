import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserAttributes } from '../models/User';

export interface AuthRequest extends Request {
    user?: UserAttributes;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log("Processing token:", token ? "Token present" : "Token missing");

            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
            console.log("Decoded user ID:", decoded.id);

            const user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (!user) {
                console.warn(`User with ID ${decoded.id} not found in database`);
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            req.user = user.get() as UserAttributes;
            next();
        } catch (error: any) {
            console.error("Auth error:", error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.warn("No Authorization header found or doesn't start with Bearer");
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user) {
        console.log(`Checking admin role for user: ${req.user.email}, Role: ${req.user.role}`);
        if (req.user.role === 'admin') {
            next();
        } else {
            console.warn(`Access denied for role: ${req.user.role}. Admin only.`);
            res.status(403).json({ message: 'Not authorized as an admin' });
        }
    } else {
        console.warn("req.user is undefined in adminOnly check");
        res.status(401).json({ message: 'Not authorized, user missing' });
    }
};

export const chefOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user) {
        if (req.user.role === 'chef' || req.user.role === 'CHEF' || req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Not authorized as a chef' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, user missing' });
    }
};

export const staffOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'chef' || req.user.role === 'CHEF' || req.user.role === 'WAITER')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as staff' });
    }
};
