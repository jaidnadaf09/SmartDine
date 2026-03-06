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
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    specialRequests?: string;
    userId?: number;
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
    public status!: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    public specialRequests!: string;
    public userId!: number;
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
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
            defaultValue: 'pending',
        },
        specialRequests: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'bookings',
    }
);

export default Booking;
