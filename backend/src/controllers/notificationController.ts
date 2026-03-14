import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Notification } from '../models';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user!.id },
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id, userId: req.user!.id }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.isRead = true;
        await notification.save();

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
