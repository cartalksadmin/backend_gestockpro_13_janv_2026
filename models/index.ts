
import { Tenant } from './Tenant';
import { User } from './User';
import { StockItem } from './StockItem';
import { ProductMovement } from './ProductMovement';
import { Customer } from './Customer';
import { Invoice } from './Invoice';
import { InvoiceItem } from './InvoiceItem';
import { Subscription } from './Subscription';
import { AuditLog } from './AuditLog';

// Relations Tenants
// Fix: cast to any to resolve static method missing errors (hasMany, hasOne, belongsTo) in TypeScript
(Tenant as any).hasMany(User, { foreignKey: 'tenantId' });
(Tenant as any).hasMany(StockItem, { foreignKey: 'tenantId' });
(Tenant as any).hasMany(Customer, { foreignKey: 'tenantId' });
(Tenant as any).hasOne(Subscription, { foreignKey: 'tenantId' });

(User as any).belongsTo(Tenant);
(StockItem as any).belongsTo(Tenant);
(Customer as any).belongsTo(Tenant);
(Subscription as any).belongsTo(Tenant);

// Relations Stocks
(StockItem as any).hasMany(ProductMovement, { foreignKey: 'productId' });
(ProductMovement as any).belongsTo(StockItem, { foreignKey: 'productId' });
(ProductMovement as any).belongsTo(User, { foreignKey: 'userId' });

// Relations Facturation
(Customer as any).hasMany(Invoice, { foreignKey: 'customerId' });
(Invoice as any).belongsTo(Customer, { foreignKey: 'customerId' });
(Invoice as any).hasMany(InvoiceItem, { foreignKey: 'invoiceId' });
(InvoiceItem as any).belongsTo(Invoice, { foreignKey: 'invoiceId' });
(InvoiceItem as any).belongsTo(StockItem, { foreignKey: 'productId' });

export { 
  Tenant, User, StockItem, ProductMovement, 
  Customer, Invoice, InvoiceItem, Subscription, AuditLog 
};
