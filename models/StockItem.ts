
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { addAuditHook } from './AuditLog';

export class StockItem extends Model {
  public id!: string;
  public tenantId!: string;
  public sku!: string;
  public name!: string;
  public currentLevel!: number;
  public minThreshold!: number;
  public unitPrice!: number;
}

(StockItem as any).init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tenantId: { type: DataTypes.UUID, allowNull: false },
  sku: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  currentLevel: { type: DataTypes.INTEGER, defaultValue: 0 },
  minThreshold: { type: DataTypes.INTEGER, defaultValue: 5 },
  unitPrice: { type: DataTypes.FLOAT, allowNull: false }
}, { sequelize, modelName: 'stock_item' });

addAuditHook(StockItem);
