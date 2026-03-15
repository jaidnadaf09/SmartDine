"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAvailableTable = void 0;
const Booking_1 = __importDefault(require("../models/Booking"));
/**
 * Finds the first available table number (1-10) for a given date and time slot.
 * @param date The booking date
 * @param time The booking time string
 * @returns table number (1-10) or null if none are available
 */
const findAvailableTable = async (date, time) => {
    try {
        // Fetch all bookings for the given date and time that are not cancelled
        const existingBookings = await Booking_1.default.findAll({
            where: {
                date: new Date(date),
                time: time,
                status: ['pending', 'confirmed']
            }
        });
        const bookedTables = existingBookings.map(b => b.tableNumber).filter(t => t !== null);
        // Check tables 1 through 10
        for (let i = 1; i <= 10; i++) {
            if (!bookedTables.includes(i)) {
                return i;
            }
        }
        return null; // All 10 tables are full for this slot
    }
    catch (error) {
        console.error('Error finding available table:', error);
        return null;
    }
};
exports.findAvailableTable = findAvailableTable;
