import sequelize from '../config/db';
import User from './User';
import Table from './Table';
import Booking from './Booking';
import MenuItem from './MenuItem';
import InventoryItem from './InventoryItem';
import Order from './Order';
import WalletTransaction from './WalletTransaction';
import Notification from './Notification';
import Review from './Review';
import RestaurantSetting from './RestaurantSetting';
// import OrderItem from './OrderItem';

// Define Associations

// Booking -> User (Customer) (Many-to-One)
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Booking, { foreignKey: 'userId' });

// Booking -> Table (Many-to-One)
Booking.belongsTo(Table, { foreignKey: 'tableId', as: 'table' });
Table.hasMany(Booking, { foreignKey: 'tableId' });

// Order -> User (Customer) (Many-to-One)
Order.belongsTo(User, { foreignKey: 'userId', as: 'customer' });
User.hasMany(Order, { foreignKey: 'userId' });

// WalletTransaction -> User
WalletTransaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(WalletTransaction, { foreignKey: 'userId', as: 'walletTransactions' });

// Notification -> User
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

// Review -> User
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });

// Review -> Order
Review.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasOne(Review, { foreignKey: 'orderId', as: 'review' });

export {
    sequelize,
    User,
    Table,
    Booking,
    MenuItem,
    InventoryItem,
    Order,
    WalletTransaction,
    Notification,
    Review,
    RestaurantSetting,
};
