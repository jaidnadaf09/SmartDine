"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class OrderItem extends sequelize_1.Model {
}
exports.OrderItem = OrderItem;
OrderItem.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orderId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    itemName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'preparing', 'ready', 'delivered'),
        defaultValue: 'pending',
    },
    assignedChef: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    estimatedTime: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 5,
    },
}, {
    sequelize: db_1.default,
    tableName: 'order_items',
});
exports.default = OrderItem;
