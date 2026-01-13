
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcrypt';

export class User extends Model {
  public id!: string;
  public tenantId!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: string;
}

(User as any).init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tenantId: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { 
    type: DataTypes.ENUM('SUPER_ADMIN', 'ADMIN', 'STOCK_MANAGER', 'ACCOUNTANT', 'SALES'),
    defaultValue: 'SALES'
  }
}, { 
  sequelize, 
  modelName: 'user',
  hooks: {
    beforeCreate: async (user: any) => {
      user.password = await bcrypt.hash(user.password, 10);
    }
  }
});
