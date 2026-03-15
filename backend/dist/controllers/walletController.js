"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWalletTransactions = void 0;
const models_1 = require("../models");
// @desc    Get user's wallet transactions
// @route   GET /api/wallet/transactions
// @access  Private
const getWalletTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await models_1.WalletTransaction.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        res.json(transactions);
    }
    catch (error) {
        console.error("Error fetching wallet transactions:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getWalletTransactions = getWalletTransactions;
