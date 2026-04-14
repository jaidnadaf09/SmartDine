import { Op } from 'sequelize';
import { Table, Booking } from '../models';
import { TIME_SLOTS } from '../config/timeSlots';

// Helper to convert 24h string "13:30" to 12h string "1:30 PM"
const formatTo12Hr = (time24: string) => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
};

export const getAvailableTableSlots = async (dateStr: string, guests: number) => {
    // Legacy support for best-match capacity filtering
    const candidateTables = await Table.findAll({
        where: {
            capacity: {
                [Op.gte]: guests
            }
        },
        order: [['capacity', 'ASC']]
    });

    const result = [];
    const dateObj = new Date(dateStr);

    for (let i = 0; i < candidateTables.length; i++) {
        const table = candidateTables[i];
        const bookingsForTable = await Booking.findAll({
            where: {
                tableId: table.id,
                date: dateObj,
                status: { [Op.notIn]: ['cancelled'] }
            }
        });
        const booked12hSlots = bookingsForTable.map(b => formatTo12Hr(b.time));
        const availableSlots = TIME_SLOTS.filter(slot => !booked12hSlots.includes(slot));

        if (availableSlots.length > 0) {
            result.push({
                tableNumber: table.tableNumber,
                capacity: table.capacity,
                availableSlots,
                isBestMatch: result.length === 0
            });
        }
    }
    return result;
};

export const getDailyTableAvailability = async (dateStr: string) => {
    // Fetch ALL tables regardless of capacity
    const tables = await Table.findAll({
        order: [['tableNumber', 'ASC']]
    });

    const result = [];
    const dateObj = new Date(dateStr);

    for (let i = 0; i < tables.length; i++) {
        const table = tables[i];

        // Fetch bookings for this table on this date
        const bookingsForTable = await Booking.findAll({
            where: {
                tableId: table.id,
                date: dateObj,
                status: {
                    [Op.notIn]: ['cancelled']
                }
            }
        });

        const booked12hSlots = bookingsForTable.map(b => formatTo12Hr(b.time));
        const availableSlots = TIME_SLOTS.filter(slot => !booked12hSlots.includes(slot));

        result.push({
            tableId: table.id,
            tableNumber: table.tableNumber,
            capacity: table.capacity,
            availableSlots
        });
    }

    return result;
};
