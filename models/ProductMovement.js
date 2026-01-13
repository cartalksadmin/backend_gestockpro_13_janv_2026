
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class ProductMovement extends Model {}

ProductMovement.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  stockItemId: { type: DataTypes.UUID, allowNull: false, field: 'stock_item_id' },
  movementDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'movement_date' },
  type: { type: DataTypes.STRING(20), allowNull: false }, // 'IN', 'OUT', 'ADJUSTMENT'
  qty: { type: DataTypes.INTEGER, allowNull: false },
  previousLevel: { type: DataTypes.INTEGER, field: 'previous_level' },
  newLevel: { type: DataTypes.INTEGER, field: 'new_level' },
  reason: { type: DataTypes.TEXT },
  userRef: { type: DataTypes.STRING(255), field: 'user_ref' }
}, { 
  sequelize, 
  modelName: 'product_movement',
  tableName: 'product_movements',
  underscored: true,
  updatedAt: false
});
