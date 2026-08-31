import { Response } from 'express';
import { ApiRequestResult } from '../module/backupmetrics/types/Request/ApiRequestResult';

export default function sendApiResult(res: Response, result: ApiRequestResult): void {
  const status = result.status ?? 200;
  res.status(status).json({
    status,
    data: result.data
  });
}
