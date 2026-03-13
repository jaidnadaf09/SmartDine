import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import User from './User';

export interface WalletTransactionAttributes {
    id?: number;
    userId: number;
    amount: number;
    type: 'credit' | 'debit';
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class WalletTransaction extends Model<WalletTransactionAttributes> implements WalletTransactionAttributes {
    public id!: number;
    public userId!: number;
    public amount!: number;
    public type!: 'credit' | 'debit';
    public description!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

WalletTransaction.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('credit', 'debit'),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'wallet_transactions',
    }
);

export default WalletTransaction;
