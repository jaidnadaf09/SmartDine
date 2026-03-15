"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRestaurantStatus = exports.getRestaurantStatus = void 0;
const models_1 = require("../models");
/**
 * Get current restaurant operational settings
 */
const getRestaurantStatus = async (req, res) => {
    try {
        let settings = await models_1.RestaurantSetting.findOne();
        if (!settings) {
            settings = await models_1.RestaurantSetting.create({
                status: 'OPEN',
                pauseUntil: null
            });
        }
        res.status(200).json(settings);
    }
    catch (error) {
        console.error('Error fetching restaurant status:', error);
        res.status(500).json({ message: 'Error fetching restaurant status', error: error.message });
    }
};
exports.getRestaurantStatus = getRestaurantStatus;
/**
 * Update restaurant status (Admin only)
 */
const updateRestaurantStatus = async (req, res) => {
    try {
        const { status, pauseMinutes } = req.body;
        if (!['OPEN', 'CLOSED', 'PAUSED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        let settings = await models_1.RestaurantSetting.findOne();
        if (!settings) {
            settings = await models_1.RestaurantSetting.create({ status: 'OPEN' });
        }
        settings.status = status;
        if (status === 'PAUSED' && pauseMinutes) {
            settings.pauseUntil = new Date(Date.now() + pauseMinutes * 60000);
        }
        else {
            settings.pauseUntil = null;
        }
        await settings.save();
        res.status(200).json({ message: `Restaurant status updated to ${status}`, settings });
    }
    catch (error) {
        console.error('Error updating restaurant status:', error);
        res.status(500).json({ message: 'Error updating restaurant status', error: error.message });
    }
};
exports.updateRestaurantStatus = updateRestaurantStatus;
