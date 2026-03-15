"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantSetting = exports.Review = exports.Notification = exports.WalletTransaction = exports.Order = exports.InventoryItem = exports.MenuItem = exports.Booking = exports.Table = exports.User = exports.sequelize = void 0;
const db_1 = __importDefault(require("../config/db"));
exports.sequelize = db_1.default;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Table_1 = __importDefault(require("./Table"));
exports.Table = Table_1.default;
const Booking_1 = __importDefault(require("./Booking"));
exports.Booking = Booking_1.default;
const MenuItem_1 = __importDefault(require("./MenuItem"));
exports.MenuItem = MenuItem_1.default;
const InventoryItem_1 = __importDefault(require("./InventoryItem"));
exports.InventoryItem = InventoryItem_1.default;
const Order_1 = __importDefault(require("./Order"));
exports.Order = Order_1.default;
const WalletTransaction_1 = __importDefault(require("./WalletTransaction"));
exports.WalletTransaction = WalletTransaction_1.default;
const Notification_1 = __importDefault(require("./Notification"));
exports.Notification = Notification_1.default;
const Review_1 = __importDefault(require("./Review"));
exports.Review = Review_1.default;
const RestaurantSetting_1 = __importDefault(require("./RestaurantSetting"));
exports.RestaurantSetting = RestaurantSetting_1.default;
// import OrderItem from './OrderItem';
// Define Associations
// Booking -> User (Customer) (Many-to-One)
Booking_1.default.belongsTo(User_1.default, { foreignKey: 'userId', as: 'user' });
User_1.default.hasMany(Booking_1.default, { foreignKey: 'userId' });
// Booking -> Table (Many-to-One)
Booking_1.default.belongsTo(Table_1.default, { foreignKey: 'tableId', as: 'table' });
Table_1.default.hasMany(Booking_1.default, { foreignKey: 'tableId' });
// Order -> User (Customer) (Many-to-One)
Order_1.default.belongsTo(User_1.default, { foreignKey: 'userId', as: 'customer' });
User_1.default.hasMany(Order_1.default, { foreignKey: 'userId' });
// WalletTransaction -> User
WalletTransaction_1.default.belongsTo(User_1.default, { foreignKey: 'userId', as: 'user' });
User_1.default.hasMany(WalletTransaction_1.default, { foreignKey: 'userId', as: 'walletTransactions' });
// Notification -> User
Notification_1.default.belongsTo(User_1.default, { foreignKey: 'userId', as: 'user' });
User_1.default.hasMany(Notification_1.default, { foreignKey: 'userId', as: 'notifications' });
// Review -> User
Review_1.default.belongsTo(User_1.default, { foreignKey: 'userId', as: 'user' });
User_1.default.hasMany(Review_1.default, { foreignKey: 'userId', as: 'reviews' });
// Review -> Order
Review_1.default.belongsTo(Order_1.default, { foreignKey: 'orderId', as: 'order' });
Order_1.default.hasOne(Review_1.default, { foreignKey: 'orderId', as: 'review' });
