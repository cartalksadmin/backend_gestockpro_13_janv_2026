
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class InvoiceItem extends Model {}

(InvoiceItem as any).init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  invoiceId: { type: DataTypes.STRING, allowNull: false },
  productId: { type: DataTypes.UUID, allowNull: false },
  qty: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  tva: { type: DataTypes.FLOAT, defaultValue: 20 }
}, { sequelize, modelName: 'invoice_item' });
