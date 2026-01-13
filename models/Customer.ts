
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Customer extends Model {
  public id!: string;
  public tenantId!: string;
  public companyName!: string;
  public mainContact!: string;
  public email!: string;
  public phone!: string;
  public billingAddress!: string;
  public siret!: string;
  public tvaIntra!: string;
  public outstandingBalance!: number;
  public paymentTerms!: number;
  public healthStatus!: 'GOOD' | 'WARNING' | 'CRITICAL';
}

(Customer as any).init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tenantId: { type: DataTypes.UUID, allowNull: false },
  companyName: { type: DataTypes.STRING, allowNull: false },
  mainContact: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  billingAddress: { type: DataTypes.TEXT },
  siret: { type: DataTypes.STRING },
  tvaIntra: { type: DataTypes.STRING },
  outstandingBalance: { type: DataTypes.FLOAT, defaultValue: 0 },
  paymentTerms: { type: DataTypes.INTEGER, defaultValue: 30 },
  healthStatus: { 
    type: DataTypes.ENUM('GOOD', 'WARNING', 'CRITICAL'), 
    defaultValue: 'GOOD' 
  }
}, { sequelize, modelName: 'customer' });
