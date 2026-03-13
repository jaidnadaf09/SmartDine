import express from 'express';
import { getWalletTransactions } from '../controllers/walletController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/transactions')
    .get(protect, getWalletTransactions);

export default router;
