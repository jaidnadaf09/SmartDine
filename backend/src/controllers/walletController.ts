import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { WalletTransaction } from '../models';

// @desc    Get user's wallet transactions
// @route   GET /api/wallet/transactions
// @access  Private
export const getWalletTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        const transactions = await WalletTransaction.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        res.json(transactions);
    } catch (error: any) {
        console.error("Error fetching wallet transactions:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
