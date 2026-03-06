import express from 'express';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(getMenuItems)
    .post(protect, adminOnly, createMenuItem);

router.route('/:id')
    .put(protect, adminOnly, updateMenuItem)
    .delete(protect, adminOnly, deleteMenuItem);

export default router;
