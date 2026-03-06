import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export interface OrderItemAttributes {
    id?: number;
    orderId: number;
    itemName: string;
    quantity?: number;
    status?: 'pending' | 'preparing' | 'ready' | 'delivered';
    assignedChef?: number | null;
    estimatedTime?: number;
}

export class OrderItem extends Model<OrderItemAttributes> implements OrderItemAttributes {
    public id!: number;
    public orderId!: number;
    public itemName!: string;
    public quantity!: number;
    public status!: 'pending' | 'preparing' | 'ready' | 'delivered';
    public assignedChef!: number | null;
    public estimatedTime!: number;
}

OrderItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        itemName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        status: {
            type: DataTypes.ENUM('pending', 'preparing', 'ready', 'delivered'),
            defaultValue: 'pending',
        },
        assignedChef: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        estimatedTime: {
            type: DataTypes.INTEGER,
            defaultValue: 5,
        },
    },
    {
        sequelize,
        tableName: 'order_items',
    }
);

export default OrderItem;
