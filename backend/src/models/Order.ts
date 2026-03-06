import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export interface OrderAttributes {
    id?: number;
    tableNumber: number;
    status?: 'pending' | 'preparing' | 'ready' | 'delivered';
    totalAmount?: number;
    timeStarted?: Date;
    userId?: number | null;
}

export class Order extends Model<OrderAttributes> implements OrderAttributes {
    public id!: number;
    public tableNumber!: number;
    public status!: 'pending' | 'preparing' | 'ready' | 'delivered';
    public totalAmount!: number;
    public timeStarted!: Date;
    public userId!: number | null;

    // associations
    public readonly items?: any[];
}

Order.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        tableNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'preparing', 'ready', 'delivered'),
            defaultValue: 'pending',
        },
        totalAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        timeStarted: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'orders',
    }
);

export default Order;
