import { injectable } from 'tsyringe';
import winston, { format, Logger as WinstonLogger } from 'winston';
import 'winston-daily-rotate-file';
import ILogger from '../interfaces/ILogger';
import config from '../config/Config';

@injectable()
export default class Logger implements ILogger {
  private logger: WinstonLogger;

  constructor() {
    const { combine, timestamp, printf } = format;

    const customFormat = printf(({ level, message, timestamp: logTime }) => `${logTime} [${level}]: ${message}`);

    this.logger = winston.createLogger({
      level: config.logging.level || 'info',
      format: combine(timestamp(), customFormat),
      transports: [
        new winston.transports.DailyRotateFile({
          dirname: 'logs',
          filename: 'API-%DATE%.log',
          datePattern: 'DD-MM-YYYY'
        }),
        new winston.transports.Console()
      ]
    });
  }

  log(level: string, message: string): void {
    this.logger.log(level, message);
  }

  info(message: string): void {
    this.logger.info(message);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  error(message: string): void {
    this.logger.error(message);
  }
}
