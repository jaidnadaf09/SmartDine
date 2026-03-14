import { Request, Response } from 'express';
import { RestaurantSetting } from '../models';

/**
 * Get current restaurant operational settings
 */
export const getRestaurantStatus = async (req: Request, res: Response) => {
    try {
        let settings = await RestaurantSetting.findOne();
        if (!settings) {
            settings = await RestaurantSetting.create({
                status: 'OPEN',
                pauseUntil: null
            });
        }
        res.status(200).json(settings);
    } catch (error: any) {
        console.error('Error fetching restaurant status:', error);
        res.status(500).json({ message: 'Error fetching restaurant status', error: error.message });
    }
};

/**
 * Update restaurant status (Admin only)
 */
export const updateRestaurantStatus = async (req: Request, res: Response) => {
    try {
        const { status, pauseMinutes } = req.body;

        if (!['OPEN', 'CLOSED', 'PAUSED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        let settings = await RestaurantSetting.findOne();
        if (!settings) {
            settings = await RestaurantSetting.create({ status: 'OPEN' });
        }

        settings.status = status;
        
        if (status === 'PAUSED' && pauseMinutes) {
            settings.pauseUntil = new Date(Date.now() + pauseMinutes * 60000);
        } else {
            settings.pauseUntil = null;
        }

        await settings.save();
        res.status(200).json({ message: `Restaurant status updated to ${status}`, settings });
    } catch (error: any) {
        console.error('Error updating restaurant status:', error);
        res.status(500).json({ message: 'Error updating restaurant status', error: error.message });
    }
};
