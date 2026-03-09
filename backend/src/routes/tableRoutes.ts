import express from 'express';
import { getTables, createTable, updateTable } from '../controllers/tableController';
import { protect, adminOnly, staffOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(getTables)
    .post(protect, adminOnly, createTable);

router.route('/:id')
    .put(protect, staffOnly, updateTable);

export default router;
