import express from 'express';
import { getInventoryItems, createInventoryItem, updateInventoryItem } from '../controllers/inventoryController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, adminOnly, getInventoryItems)
    .post(protect, adminOnly, createInventoryItem);

router.route('/:id')
    .put(protect, adminOnly, updateInventoryItem);

export default router;
