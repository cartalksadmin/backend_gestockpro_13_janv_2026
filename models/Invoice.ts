
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Invoice extends Model {
  public id!: string;
  public tenantId!: string;
  public customerId!: string;
  public amount!: number;
  public status!: string;
}

(Invoice as any).init({
  id: { type: DataTypes.STRING, primaryKey: true },
  tenantId: { type: DataTypes.UUID, allowNull: false },
  customerId: { type: DataTypes.UUID, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  status: { 
    type: DataTypes.ENUM('DRAFT', 'VALIDATED', 'PAID', 'OVERDUE'),
    defaultValue: 'DRAFT'
  },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { sequelize, modelName: 'invoice' });
