"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Booking extends sequelize_1.Model {
}
exports.Booking = Booking;
Booking.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    customerName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    time: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    guests: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
    },
    tableNumber: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    tableId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'tables',
            key: 'id'
        }
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'confirmed', 'checked_in', 'cancelled', 'completed'),
        defaultValue: 'pending',
    },
    specialRequests: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    occasion: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    preference: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    amount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    paymentId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    paymentStatus: {
        type: sequelize_1.DataTypes.ENUM('pending', 'paid', 'failed'),
        defaultValue: 'pending',
    },
    cancelReason: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    tableName: 'bookings',
});
exports.default = Booking;
