"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantSetting = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class RestaurantSetting extends sequelize_1.Model {
}
exports.RestaurantSetting = RestaurantSetting;
RestaurantSetting.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('OPEN', 'CLOSED', 'PAUSED'),
        defaultValue: 'OPEN',
        allowNull: false,
    },
    pauseUntil: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    tableName: 'restaurant_settings',
});
exports.default = RestaurantSetting;
