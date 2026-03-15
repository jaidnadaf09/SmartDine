"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true, // Optional for dummy data or staff without login
    },
    role: {
        type: sequelize_1.DataTypes.ENUM('customer', 'admin', 'chef', 'CHEF', 'WAITER'),
        defaultValue: 'customer',
    },
    shift: {
        type: sequelize_1.DataTypes.ENUM('Morning', 'Evening'),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
    },
    walletBalance: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
    },
    profileImage: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    tableName: 'users',
});
exports.default = User;
