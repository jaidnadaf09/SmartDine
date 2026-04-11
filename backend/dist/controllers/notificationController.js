"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearNotifications = exports.deleteNotification = exports.markAsRead = exports.getNotifications = void 0;
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
// @desc    Delete single notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
    try {
        const deleted = await models_1.Notification.destroy({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!deleted) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json({ message: 'Notification deleted' });
    }
    catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteNotification = deleteNotification;
// @desc    Clear all notifications for user
// @route   DELETE /api/notifications/clear
// @access  Private
const clearNotifications = async (req, res) => {
    try {
        await models_1.Notification.destroy({
            where: { userId: req.user.id }
        });
        res.json({ message: 'All notifications cleared' });
    }
    catch (error) {
        console.error('Error clearing notifications:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.clearNotifications = clearNotifications;
