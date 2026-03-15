"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getNotifications = void 0;
const models_1 = require("../models");
// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const notifications = await models_1.Notification.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        res.json(notifications);
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getNotifications = getNotifications;
// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await models_1.Notification.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        notification.isRead = true;
        await notification.save();
        res.json({ message: 'Notification marked as read' });
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.markAsRead = markAsRead;
