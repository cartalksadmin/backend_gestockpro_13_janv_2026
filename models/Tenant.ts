import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Tenant extends Model {
  public id!: string;
  public name!: string;
  public domain!: string;
  public isActive!: boolean;
  public plan!: string;
}

// Fix: cast Tenant to any to resolve 'init' method missing error in TypeScript
(Tenant as any).init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  domain: { type: DataTypes.STRING, unique: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  plan: { type: DataTypes.ENUM('BASIC', 'PRO', 'ENTERPRISE'), defaultValue: 'BASIC' }
}, { sequelize, modelName: 'tenant' });