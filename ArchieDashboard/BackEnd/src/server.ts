/* eslint-disable @typescript-eslint/no-unused-vars */
import 'reflect-metadata';
import { Server as HttpServer } from 'http';
import app from './routes/index.routes';
import Logger from './helpers/logger';
import { databaseContainer } from './shared/container';

const PORT = Number(process.env.PORT) || 4000;

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

      await databaseContainer.authenticate();

      this.httpServer = app.listen(PORT, () => {
        this.Logger.info(`Server is running on port ${PORT}`);
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
