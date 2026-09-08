import '../polyfills/node26';
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

  connected = false;

  private reconnectTimer?: ReturnType<typeof setInterval>;

  constructor(@inject('Logger') private readonly Logger: ILogger) {
    this.sequelize = new Sequelize(database || 'unavailable', username || 'unavailable', password, {
      host: host || 'localhost',
      dialect,
      pool: {
        max: 5,
        min: 0,
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

    if (!database || !username || !host) {
      this.Logger.error('SQLDB_PROD_DATABASE, SQLDB_PROD_USER, and SQLDB_PROD_HOST must be set');
    }
  }

  async authenticate(): Promise<boolean> {
    try {
      await this.sequelize.authenticate();
      this.connected = true;
      this.Logger.info('Connection has been established successfully.');
      this.stopReconnectLoop();
      return true;
    } catch (err) {
      this.connected = false;
      this.Logger.error(`Unable to connect to the database: ${String(err)}`);
      return false;
    }
  }

  startReconnectLoop(intervalMs = 15000): void {
    if (this.reconnectTimer) {
      return;
    }

    this.Logger.info(`Retrying database connection every ${intervalMs / 1000}s`);
    this.reconnectTimer = setInterval(() => {
      void this.authenticate();
    }, intervalMs);
    this.reconnectTimer.unref();
  }

  private stopReconnectLoop(): void {
    if (!this.reconnectTimer) {
      return;
    }
    clearInterval(this.reconnectTimer);
    this.reconnectTimer = undefined;
  }
}

export default Database;
