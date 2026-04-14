import { Op, Transaction } from 'sequelize';
import { Table, Booking } from '../models';

interface FindBestAvailableTableParams {
    guestCount: number;
    date: Date | string;
    timeSlot: string;
    transaction?: Transaction;
}

export const findBestAvailableTable = async ({
    guestCount,
    date,
    timeSlot,
    transaction
}: FindBestAvailableTableParams) => {
    // Find all tables that have capacity >= guestCount, ordered by capacity ascending
    const candidateTables = await Table.findAll({
        where: {
            capacity: {
                [Op.gte]: guestCount
            }
        },
        order: [['capacity', 'ASC']],
        transaction
    });

    for (const table of candidateTables) {
        // Check if there is an existing non-cancelled booking for this table at this date and time
        const existingBooking = await Booking.findOne({
            where: {
                tableId: table.id,
                date: new Date(date as string),
                time: timeSlot,
                status: {
                    [Op.notIn]: ['cancelled']
                }
            },
            transaction
        });

        // If no booking exists, this table is free and suitable
        if (!existingBooking) {
            return table;
        }
    }

    return null; // Return null if no suitable table is free
};
