import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export interface UserAttributes {
    id?: number;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    profileImage?: string;
    role: 'customer' | 'admin' | 'chef' | 'WAITER' | 'CHEF';
    shift?: 'Morning' | 'Evening';
    status?: 'active' | 'inactive';
    walletBalance?: number;
}

export class User extends Model<UserAttributes> implements UserAttributes {
    public id!: number;
    public name!: string;
    public email!: string;
    public password!: string;
    public phone!: string;
    public profileImage!: string;
    public role!: 'customer' | 'admin' | 'chef' | 'WAITER' | 'CHEF';
    public shift!: 'Morning' | 'Evening';
    public status!: 'active' | 'inactive';
    public walletBalance!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true, // Optional for dummy data or staff without login
        },
        role: {
            type: DataTypes.ENUM('customer', 'admin', 'chef', 'CHEF', 'WAITER'),
            defaultValue: 'customer',
        },
        shift: {
            type: DataTypes.ENUM('Morning', 'Evening'),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active',
        },
        walletBalance: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
        },
        profileImage: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'users',
    }
);

export default User;
