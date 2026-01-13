
import { Tenant } from './Tenant.js';
import { User } from './User.js';
import { StockItem } from './StockItem.js';
import { ProductMovement } from './ProductMovement.js';
import { Customer } from './Customer.js';
import { Invoice } from './Invoice.js';
import { InvoiceItem } from './InvoiceItem.js';
import { Subscription } from './Subscription.js';
import { Plan } from './Plan.js';
import { AuditLog } from './AuditLog.js';
import { Backup } from './Backup.js';

// Relations fondamentales
Tenant.hasMany(User, { foreignKey: 'tenant_id' });
Tenant.hasMany(StockItem, { foreignKey: 'tenant_id' });
Tenant.hasMany(Customer, { foreignKey: 'tenant_id' });
Tenant.hasMany(Invoice, { foreignKey: 'tenant_id' });
Tenant.hasOne(Subscription, { foreignKey: 'tenant_id' });
Tenant.hasMany(AuditLog, { foreignKey: 'tenant_id' });

User.belongsTo(Tenant, { foreignKey: 'tenant_id' });
StockItem.belongsTo(Tenant, { foreignKey: 'tenant_id' });
Customer.belongsTo(Tenant, { foreignKey: 'tenant_id' });
Invoice.belongsTo(Tenant, { foreignKey: 'tenant_id' });
Subscription.belongsTo(Tenant, { foreignKey: 'tenant_id' });
AuditLog.belongsTo(Tenant, { foreignKey: 'tenant_id' });

// Abonnements
Plan.hasMany(Subscription, { foreignKey: 'plan_id' });
Subscription.belongsTo(Plan, { foreignKey: 'plan_id' });

// Stocks
StockItem.hasMany(ProductMovement, { foreignKey: 'stock_item_id' });
ProductMovement.belongsTo(StockItem, { foreignKey: 'stock_item_id' });

// Ventes
Customer.hasMany(Invoice, { foreignKey: 'customer_id' });
Invoice.belongsTo(Customer, { foreignKey: 'customer_id' });
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoice_id' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoice_id' });

export { 
  Tenant, User, StockItem, ProductMovement, 
  Customer, Invoice, InvoiceItem, Subscription, 
  Plan, AuditLog, Backup 
};
