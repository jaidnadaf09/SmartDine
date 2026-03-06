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
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };

            const user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            req.user = user.get() as UserAttributes;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

export const staffOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'CHEF' || req.user.role === 'WAITER')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as staff' });
    }
};
