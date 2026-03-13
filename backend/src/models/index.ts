import sequelize from '../config/db';
import User from './User';
import Table from './Table';
import Booking from './Booking';
import MenuItem from './MenuItem';
import InventoryItem from './InventoryItem';
import Order from './Order';
import WalletTransaction from './WalletTransaction';
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

export {
    sequelize,
    User,
    Table,
    Booking,
    MenuItem,
    InventoryItem,
    Order,
    WalletTransaction,
};
