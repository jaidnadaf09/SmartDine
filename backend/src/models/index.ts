import sequelize from '../config/db';
import User from './User';
import Table from './Table';
import Booking from './Booking';
import MenuItem from './MenuItem';
import InventoryItem from './InventoryItem';
import Order from './Order';
import OrderItem from './OrderItem';

// Define Associations

// Order -> OrderItem (One-to-Many)
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// OrderItem -> User (Chef) (Many-to-One)
OrderItem.belongsTo(User, { foreignKey: 'assignedChef', as: 'chef' });
User.hasMany(OrderItem, { foreignKey: 'assignedChef' });

// Booking -> User (Customer) (Many-to-One)
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Booking, { foreignKey: 'userId' });

export {
    sequelize,
    User,
    Table,
    Booking,
    MenuItem,
    InventoryItem,
    Order,
    OrderItem,
};
