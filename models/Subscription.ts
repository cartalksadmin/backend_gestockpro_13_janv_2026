
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Subscription extends Model {
  public id!: string;
  public tenantId!: string;
  public planId!: string;
  public status!: 'ACTIVE' | 'CANCELED' | 'PAST_DUE';
  public nextBillingDate!: Date;
  public autoRenew!: boolean;
}

(Subscription as any).init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tenantId: { type: DataTypes.UUID, allowNull: false },
  planId: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('ACTIVE', 'CANCELED', 'PAST_DUE'), defaultValue: 'ACTIVE' },
  nextBillingDate: { type: DataTypes.DATE },
  autoRenew: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { sequelize, modelName: 'subscription' });
