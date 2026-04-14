import express from 'express';
import { getTables, createTable, updateTable, getTableAvailability, getDailyTableAvailability } from '../controllers/tableController';
import { protect, adminOnly, staffOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(getTables)
    .post(protect, adminOnly, createTable);

router.route('/availability')
    .get(getTableAvailability);

router.route('/daily-availability')
    .get(getDailyTableAvailability);

router.route('/:id')
    .put(protect, staffOnly, updateTable);

export default router;
