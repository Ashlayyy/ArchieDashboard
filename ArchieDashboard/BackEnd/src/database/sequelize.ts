import { Dialect, Sequelize } from 'sequelize';
import { injectable, inject } from 'tsyringe';
import ILogger from '../interfaces/ILogger';

require('dotenv').config();

const database = process.env.SQLDB_PROD_DATABASE || process.env.SQLDB_DATABASE || '';
const username = process.env.SQLDB_PROD_USER || process.env.SQLDB_USER || '';
const password = process.env.SQLDB_PROD_PASS || process.env.SQLDB_PASS || '';
const host = process.env.SQLDB_PROD_HOST || process.env.SQLDB_HOST || '';
const dialect = (process.env.SQLDB_PROD_DIALECT || process.env.SQLDB_DIALECT || 'mssql') as Dialect;

@injectable()
class Database {
  sequelize: Sequelize;

  constructor(@inject('Logger') private readonly Logger: ILogger) {
    if (!database || !username || !host) {
      throw new Error('SQLDB_PROD_DATABASE, SQLDB_PROD_USER, and SQLDB_PROD_HOST must be set');
    }

    this.sequelize = new Sequelize(database, username, password, {
      host,
      dialect,
      pool: {
        max: 5,
        min: 2,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: {
        options: {
          encrypt: process.env.SQLDB_ENCRYPT !== 'false',
          trustServerCertificate: process.env.SQLDB_TRUST_CERT === 'true'
        }
      },
      logging: process.env.NODE_ENV === 'production' ? false : (message: string) => this.Logger.info(message)
    });
  }

  async authenticate(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      this.Logger.info('Connection has been established successfully.');
    } catch (err) {
      this.Logger.error(`Unable to connect to the database: ${String(err)}`);
      throw err;
    }
  }
}

export default Database;
