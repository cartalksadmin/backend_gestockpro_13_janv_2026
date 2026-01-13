
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Customer extends Model {}

Customer.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tenantId: { type: DataTypes.UUID, allowNull: false },
  companyName: { type: DataTypes.STRING, allowNull: false },
  mainContact: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  billingAddress: { type: DataTypes.TEXT },
  siret: { type: DataTypes.STRING },
  tvaIntra: { type: DataTypes.STRING },
  
  // Paramètres financiers
  outstandingBalance: { type: DataTypes.FLOAT, defaultValue: 0 },
  maxCreditLimit: { type: DataTypes.FLOAT, defaultValue: 5000 },
  paymentTerms: { type: DataTypes.INTEGER, defaultValue: 30 }, // jours
  
  // Statut de santé basé sur les paiements
  healthStatus: { 
    type: DataTypes.ENUM('GOOD', 'WARNING', 'CRITICAL'), 
    defaultValue: 'GOOD' 
  },
  
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { 
  sequelize, 
  modelName: 'customer',
  indexes: [
    { fields: ['tenantId', 'email'] }
  ]
});
