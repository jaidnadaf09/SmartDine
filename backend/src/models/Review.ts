import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

class Review extends Model {
  public id!: number;
  public userId!: number;
  public orderId!: number;
  public rating!: number;
  public comment!: string;
  public readonly createdAt!: Date;
}

Review.init(
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
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'reviews',
  }
);

export default Review;
