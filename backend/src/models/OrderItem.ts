import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export interface OrderItemAttributes {
    id?: number;
    orderId: number;
    dishName: string;
    quantity: number;
    price: number;
    specialInstructions?: string | null;
}

export class OrderItem extends Model<OrderItemAttributes> implements OrderItemAttributes {
    public id!: number;
    public orderId!: number;
    public dishName!: string;
    public quantity!: number;
    public price!: number;
    public specialInstructions!: string | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
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
        dishName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        specialInstructions: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'order_items',
    }
);

export default OrderItem;
