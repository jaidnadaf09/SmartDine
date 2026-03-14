import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export interface RestaurantSettingAttributes {
    id?: number;
    status: 'OPEN' | 'CLOSED' | 'PAUSED';
    pauseUntil?: Date | null;
}

export class RestaurantSetting extends Model<RestaurantSettingAttributes> implements RestaurantSettingAttributes {
    public id!: number;
    public status!: 'OPEN' | 'CLOSED' | 'PAUSED';
    public pauseUntil!: Date | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

RestaurantSetting.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        status: {
            type: DataTypes.ENUM('OPEN', 'CLOSED', 'PAUSED'),
            defaultValue: 'OPEN',
            allowNull: false,
        },
        pauseUntil: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'restaurant_settings',
    }
);

export default RestaurantSetting;
