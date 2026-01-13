
import { Sequelize } from 'sequelize';

// Utilisation des identifiants exacts fournis pour la base AlwaysData
export const sequelize = new Sequelize('gestionapp_stockgestion_13_janv_2026', 'gestionapp', 'Dianka16', {
  host: 'postgresql-gestionapp.alwaysdata.net',
  port: 5432,
  dialect: 'postgres',
  logging: false,
  define: {
    underscored: true,
    timestamps: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected: AlwaysData Infrastructure (gestionapp_stockgestion_13_janv_2026)');
    
    // Synchronisation automatique des tables au démarrage pour AlwaysData
    await sequelize.sync({ alter: true });
    console.log('✅ Kernel Database Models Synchronized');
  } catch (error) {
    console.error('❌ AlwaysData Connection Error:', error);
  }
};
