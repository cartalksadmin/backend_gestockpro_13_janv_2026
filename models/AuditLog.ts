import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import crypto from 'crypto';

export class AuditLog extends Model {
  public static sign(data: any): string {
    const secret = process.env.AUDIT_SECRET || 'GESTOCK_KERNEL_SECURE_2024';
    return crypto.createHash('sha256').update(JSON.stringify(data) + secret).digest('hex');
  }
}

// Fix: cast AuditLog to any to resolve 'init' method missing error in TypeScript
(AuditLog as any).init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tenantId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  action: { type: DataTypes.STRING, allowNull: false },
  resource: { type: DataTypes.STRING },
  severity: { type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'), defaultValue: 'LOW' },
  signature: { type: DataTypes.STRING, allowNull: false }
}, { sequelize, modelName: 'audit_log' });

// Hook Global pour l'audit automatique
export const addAuditHook = (model: any) => {
  model.addHook('afterUpdate', async (instance: any, options: any) => {
    const data = { action: 'UPDATE', model: model.name, id: instance.id };
    // Fix: cast AuditLog to any to resolve 'create' method missing error in TypeScript
    await (AuditLog as any).create({
      tenantId: instance.tenantId || options.tenantId,
      userId: options.userId,
      action: `UPDATE_${model.name.toUpperCase()}`,
      resource: instance.id,
      signature: AuditLog.sign(data)
    });
  });
};