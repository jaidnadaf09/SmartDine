import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export interface InventoryItemAttributes {
    id?: number;
    name: string;
    quantity: number;
    unit: string;
    status: 'sufficient' | 'low' | 'critical';
}

export class InventoryItem extends Model<InventoryItemAttributes> implements InventoryItemAttributes {
    public id!: number;
    public name!: string;
    public quantity!: number;
    public unit!: string;
    public status!: 'sufficient' | 'low' | 'critical';
}

InventoryItem.init(
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
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('sufficient', 'low', 'critical'),
            defaultValue: 'sufficient',
        },
    },
    {
        sequelize,
        tableName: 'inventory_items',
    }
);

export default InventoryItem;
