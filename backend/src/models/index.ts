import sequelize from '../config/db';
import User from './User';
import Table from './Table';
import Booking from './Booking';
import MenuItem from './MenuItem';
import InventoryItem from './InventoryItem';
import Order from './Order';
// Define Associations

// Booking -> User (Customer) (Many-to-One)
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Booking, { foreignKey: 'userId' });

// Booking -> Table
Booking.belongsTo(Table, { targetKey: 'tableNumber', foreignKey: 'tableNumber', as: 'table' });
Table.hasMany(Booking, { sourceKey: 'tableNumber', foreignKey: 'tableNumber' });

// Order -> User (Customer) (Many-to-One)
Order.belongsTo(User, { foreignKey: 'userId', as: 'customer' });
User.hasMany(Order, { foreignKey: 'userId' });

// Order -> Table
Order.belongsTo(Table, { targetKey: 'tableNumber', foreignKey: 'tableNumber', as: 'table' });
Table.hasMany(Order, { sourceKey: 'tableNumber', foreignKey: 'tableNumber' });

export {
    sequelize,
    User,
    Table,
    Booking,
    MenuItem,
    InventoryItem,
    Order,
};
