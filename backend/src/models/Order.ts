import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export interface OrderAttributes {
    id?: number;
    userId?: number | null;
    bookingId?: number | null;
    items?: any; // JSON column
    totalAmount: number;
    status?: 'pending' | 'preparing' | 'ready' | 'completed';
    paymentId?: string | null;
    paymentStatus?: 'pending' | 'paid' | 'failed';
    tableNumber?: number | null;
    orderType?: 'DINE_IN' | 'TAKEAWAY';
    createdAt?: Date;
    updatedAt?: Date;
}

export class Order extends Model<OrderAttributes> implements OrderAttributes {
    public id!: number;
    public userId!: number | null;
    public bookingId!: number | null;
    public items!: any;
    public totalAmount!: number;
    public status!: 'pending' | 'preparing' | 'completed';
    public paymentId!: string | null;
    public paymentStatus!: 'pending' | 'paid' | 'failed';
    public tableNumber!: number | null;
    public orderType!: 'DINE_IN' | 'TAKEAWAY';

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Order.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        bookingId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        items: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        totalAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.ENUM('pending', 'preparing', 'ready', 'completed'),
            defaultValue: 'pending',
        },
        paymentId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        paymentStatus: {
            type: DataTypes.ENUM('pending', 'paid', 'failed'),
            defaultValue: 'pending',
        },
        tableNumber: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        orderType: {
            type: DataTypes.ENUM('DINE_IN', 'TAKEAWAY'),
            allowNull: false,
            defaultValue: 'TAKEAWAY',
        },
    },
    {
        sequelize,
        tableName: 'orders',
    }
);

export default Order;
