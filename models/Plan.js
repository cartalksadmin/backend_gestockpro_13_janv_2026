
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Plan extends Model {}

Plan.init({
  id: { type: DataTypes.STRING, primaryKey: true }, // ex: 'BASIC', 'PRO'
  name: { type: DataTypes.STRING, allowNull: false },
  priceMonthly: { type: DataTypes.FLOAT, allowNull: false },
  priceYearly: { type: DataTypes.FLOAT, allowNull: false },
  trialDays: { type: DataTypes.INTEGER, defaultValue: 14 },
  maxUsers: { type: DataTypes.INTEGER, defaultValue: 1 },
  hasAiChatbot: { type: DataTypes.BOOLEAN, defaultValue: false },
  hasStockForecast: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { 
  sequelize, 
  modelName: 'plan',
  underscored: true 
});
