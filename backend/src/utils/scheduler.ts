import cron from 'node-cron';
import { Op } from 'sequelize';
import Booking from '../models/Booking';
import Table from '../models/Table';

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
};
