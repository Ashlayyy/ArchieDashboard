/* eslint-disable @typescript-eslint/no-unused-vars */
import './polyfills/node26';
import 'reflect-metadata';
import { Server as HttpServer } from 'http';
import app from './routes/index.routes';
import Logger from './helpers/logger';
import { databaseContainer } from './shared/container';

const PORT = Number(process.env.PORT) || 4100;

export default class Server {
  Logger: Logger;

  httpServer?: HttpServer;

  constructor() {
    this.Logger = new Logger();
    this.startServer();
  }

  startServer = async () => {
    try {
      if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
        throw new Error('CORS_ORIGIN is required when NODE_ENV=production');
      }

      const connected = await databaseContainer.authenticate();
      if (!connected) {
        this.Logger.error('Database unavailable. API will start without metrics and keep retrying.');
        databaseContainer.startReconnectLoop();
      }

      this.httpServer = app.listen(PORT, () => {
        this.Logger.info(`Server is running on port ${PORT}`);
        if (!connected) {
          this.Logger.info('Serving empty metrics until the database is reachable');
        }
        if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
          this.Logger.info('Swagger API Docs running at /docs');
        }
      });

      const shutdown = (signal: string) => {
        this.Logger.info(`Received ${signal}, shutting down`);
        this.httpServer?.close(() => {
          process.exit(0);
        });
        setTimeout(() => process.exit(1), 10000).unref();
      };

      process.on('SIGTERM', () => shutdown('SIGTERM'));
      process.on('SIGINT', () => shutdown('SIGINT'));
    } catch (error: any) {
      this.Logger.error(error);
      process.exit(1);
    }
  };
}

const server = new Server();
