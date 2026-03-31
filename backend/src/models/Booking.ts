import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export interface BookingAttributes {
    id?: number;
    customerName: string;
    email: string;
    phone: string;
    date: Date;
    time: string;
    guests: number;
    tableNumber?: number;
    tableId?: number | null;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    specialRequests?: string;
    occasion?: string;
    preference?: string;
    userId?: number;
    amount?: number;
    paymentId?: string;
    paymentStatus?: 'pending' | 'paid' | 'failed';
    cancelReason?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Booking extends Model<BookingAttributes> implements BookingAttributes {
    public id!: number;
    public customerName!: string;
    public email!: string;
    public phone!: string;
    public date!: Date;
    public time!: string;
    public guests!: number;
    public tableNumber!: number;
    public tableId!: number | null;
    public status!: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    public specialRequests!: string;
    public occasion!: string;
    public preference!: string;
    public userId!: number;
    public amount!: number;
    public paymentId!: string;
    public paymentStatus!: 'pending' | 'paid' | 'failed';
    public cancelReason!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Booking.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        customerName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        time: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        guests: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1 },
        },
        tableNumber: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        tableId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'tables',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
            defaultValue: 'pending',
        },
        specialRequests: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        occasion: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        preference: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        paymentId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        paymentStatus: {
            type: DataTypes.ENUM('pending', 'paid', 'failed'),
            defaultValue: 'pending',
        },
        cancelReason: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'bookings',
    }
);

export default Booking;
