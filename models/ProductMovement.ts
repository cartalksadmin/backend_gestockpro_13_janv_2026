
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class ProductMovement extends Model {
  public id!: string;
  public tenantId!: string;
  public productId!: string;
  public date!: Date;
  public type!: 'IN' | 'OUT';
  public qty!: number;
  public reason!: string;
  public userId!: string;
}

(ProductMovement as any).init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tenantId: { type: DataTypes.UUID, allowNull: false },
  productId: { type: DataTypes.UUID, allowNull: false },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  type: { type: DataTypes.ENUM('IN', 'OUT'), allowNull: false },
  qty: { type: DataTypes.INTEGER, allowNull: false },
  reason: { type: DataTypes.STRING },
  userId: { type: DataTypes.UUID, allowNull: false }
}, { sequelize, modelName: 'product_movement' });
