import { Request, Response, NextFunction } from 'express';
import Logger from '../helpers/logger';

export default function HandleError(error: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof SyntaxError) {
    res.status(400).json({ status: 400, data: 'Syntax Error' });
    return;
  }

  const logger = new Logger();
  const err = error as { status?: number; statusCode?: number; message?: string; code?: string };
  const status = err.status || err.statusCode || 500;

  if (err.code === 'invalid_token' || status === 401) {
    res.status(401).json({ status: 401, data: 'Unauthorized' });
    return;
  }

  logger.error(String(error));
  res.status(status >= 400 && status < 600 ? status : 500).json({
    status: status >= 400 && status < 600 ? status : 500,
    data: 'An error has occurred check logs for more details'
  });
}
