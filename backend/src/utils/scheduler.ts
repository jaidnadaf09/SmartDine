import cron from 'node-cron';
import { Op } from 'sequelize';
import { Booking, Table, RestaurantSetting } from '../models';

/**
 * Scheduler to handle automatic restaurant operations
 */
export const initScheduler = () => {
    console.log('--- Initializing SmartDine Scheduler ---');

    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        console.log('--- Running Auto Table Release Job ---');
        try {
            const now = new Date();
            
            // Find bookings that are confirmed and assigned a table
            const activeBookings = await Booking.findAll({
                where: {
                    status: 'confirmed',
                    tableId: { [Op.ne]: null }
                }
            });

            console.log(`Checking ${activeBookings.length} active bookings for expiration...`);

            for (const booking of activeBookings) {
                // Parse booking time: "HH:mm"
                const [hours, minutes] = booking.time.split(':').map(Number);
                const bookingDateTime = new Date(booking.date);
                bookingDateTime.setHours(hours, minutes, 0, 0);

                // Add 1 hour duration (standard reservation time)
                const expirationTime = new Date(bookingDateTime.getTime() + 60 * 60 * 1000);

                if (now > expirationTime) {
                    console.log(`Booking ${booking.id} for ${booking.customerName} has expired. Releasing table ${booking.tableNumber}...`);
                    
                    // 1. Mark booking as completed and unassign table
                    booking.status = 'completed';
                    const tableId = booking.tableId;
                    booking.tableId = null;
                    await booking.save();

                    // 2. Set table status to available
                    if (tableId) {
                        const table = await Table.findByPk(tableId);
                        if (table) {
                            table.status = 'available';
                            await table.save();
                            console.log(`Table ${table.tableNumber} released successfully.`);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error in Auto Table Release Job:', error);
        }
    });

    console.log('Scheduler: Auto Table Release Job scheduled to run every 5 minutes.');

    // Run every minute for restaurant auto-resume
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const settings = await RestaurantSetting.findOne();
            
            if (settings && settings.status === 'PAUSED' && settings.pauseUntil && now > settings.pauseUntil) {
                console.log('--- Restaurant Pause Session Expired. Resuming to OPEN ---');
                settings.status = 'OPEN';
                settings.pauseUntil = null;
                await settings.save();
            }
        } catch (error) {
            console.error('Error in Restaurant Auto-Resume Job:', error);
        }
    });

    console.log('Scheduler: Restaurant Auto-Resume Job scheduled to run every minute.');

    // Run every 10 minutes to create booking reminders
    cron.schedule('*/10 * * * *', async () => {
        console.log('--- Running Booking Reminder Job ---');
        try {
            const now = new Date();
            const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

            // Find confirmed bookings starting in the next 2 hours
            const upcomingBookings = await Booking.findAll({
                where: {
                    status: 'confirmed',
                    date: {
                        [Op.lte]: twoHoursFromNow,
                        [Op.gte]: now
                    }
                }
            });

            const { Notification } = require('../models');

            for (const booking of upcomingBookings) {
                if (!booking.userId) continue;

                // Create reminder if not already sent for this booking
                const existingReminder = await Notification.findOne({
                    where: {
                        userId: booking.userId,
                        message: { [Op.like]: `%table booking #${booking.id}%` },
                        type: 'booking_reminder'
                    }
                });

                if (!existingReminder) {
                    await Notification.create({
                        userId: booking.userId,
                        message: `Reminder: Your table booking #${booking.id} is coming up at ${booking.time}!`,
                        type: 'booking_reminder'
                    });
                }
            }
        } catch (error) {
            console.error('Error in Booking Reminder Job:', error);
        }
    });

    console.log('Scheduler: Booking Reminder Job scheduled to run every 10 minutes.');
};
