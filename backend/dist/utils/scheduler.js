"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
/**
 * Scheduler to handle automatic restaurant operations
 */
const initScheduler = () => {
    console.log('--- Initializing SmartDine Scheduler ---');
    // Run every 5 minutes
    node_cron_1.default.schedule('*/5 * * * *', async () => {
        console.log('--- Running Auto Table Release Job ---');
        try {
            const now = new Date();
            // Find bookings that are confirmed and assigned a table
            const activeBookings = await models_1.Booking.findAll({
                where: {
                    status: 'confirmed',
                    tableId: { [sequelize_1.Op.ne]: null }
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
                        const table = await models_1.Table.findByPk(tableId);
                        if (table) {
                            table.status = 'available';
                            await table.save();
                            console.log(`Table ${table.tableNumber} released successfully.`);
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('Error in Auto Table Release Job:', error);
        }
    });
    console.log('Scheduler: Auto Table Release Job scheduled to run every 5 minutes.');
    // Run every minute for restaurant auto-resume
    node_cron_1.default.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const settings = await models_1.RestaurantSetting.findOne();
            if (settings && settings.status === 'PAUSED' && settings.pauseUntil && now > settings.pauseUntil) {
                console.log('--- Restaurant Pause Session Expired. Resuming to OPEN ---');
                settings.status = 'OPEN';
                settings.pauseUntil = null;
                await settings.save();
            }
        }
        catch (error) {
            console.error('Error in Restaurant Auto-Resume Job:', error);
        }
    });
    console.log('Scheduler: Restaurant Auto-Resume Job scheduled to run every minute.');
};
exports.initScheduler = initScheduler;
