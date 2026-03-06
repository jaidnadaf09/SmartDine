import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export interface MenuItemAttributes {
    id?: number;
    name: string;
    category: string;
    price: number;
    status: 'available' | 'unavailable';
    description?: string;
    image?: string;
}

export class MenuItem extends Model<MenuItemAttributes> implements MenuItemAttributes {
    public id!: number;
    public name!: string;
    public category!: string;
    public price!: number;
    public status!: 'available' | 'unavailable';
    public description!: string;
    public image!: string;
}

MenuItem.init(
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
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('available', 'unavailable'),
            defaultValue: 'available',
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'menu_items',
    }
);

export default MenuItem;
