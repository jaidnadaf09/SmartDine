import express from 'express';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuController';
import { protect, adminOnly, chefOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(getMenuItems)
    .post(protect, adminOnly, createMenuItem);

router.route('/:id')
    .put(protect, chefOnly, updateMenuItem)
    .delete(protect, adminOnly, deleteMenuItem);

export default router;
