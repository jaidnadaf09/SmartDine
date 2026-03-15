"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Order extends sequelize_1.Model {
}
exports.Order = Order;
Order.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    bookingId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    items: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    totalAmount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled'),
        defaultValue: 'pending',
    },
    paymentId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    paymentStatus: {
        type: sequelize_1.DataTypes.ENUM('pending', 'paid', 'failed'),
        defaultValue: 'pending',
    },
    tableNumber: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    orderType: {
        type: sequelize_1.DataTypes.ENUM('DINE_IN', 'TAKEAWAY'),
        allowNull: false,
        defaultValue: 'TAKEAWAY',
    },
}, {
    sequelize: db_1.default,
    tableName: 'orders',
});
exports.default = Order;
