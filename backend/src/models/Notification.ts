import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

class Notification extends Model {
  public id!: number;
  public userId!: number;
  public message!: string;
  public type!: string;
  public isRead!: boolean;
  public readonly createdAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'info',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
  }
);

export default Notification;
