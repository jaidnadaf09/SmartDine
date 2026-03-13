import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export interface TableAttributes {
    id?: number;
    tableNumber: number;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved';
    orders: number;
    customerId?: number | null;
}

export class Table extends Model<TableAttributes> implements TableAttributes {
    public id!: number;
    public tableNumber!: number;
    public capacity!: number;
    public status!: 'available' | 'occupied' | 'reserved';
    public orders!: number;
    public customerId!: number | null;
}

Table.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        tableNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('available', 'occupied', 'reserved'),
            defaultValue: 'available',
        },
        orders: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'tables',
    }
);

export default Table;
