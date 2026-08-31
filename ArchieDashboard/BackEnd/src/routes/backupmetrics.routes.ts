import 'reflect-metadata';

import { Request, Response, Router } from 'express';
import apicache from 'apicache';
import asyncHandler from 'express-async-handler';
import { backupMetricsController } from '../shared/container';
import checkMethods from '../middlewares/checkForMethods';
import mapRequest from '../helpers/mappers/requestmapper';
import sendApiResult from '../helpers/sendApiResult';

apicache.options({
  headerBlacklist: ['x-ratelimit-remaining'],
  respectCacheControl: true
});
const cache = apicache.middleware;
const getMethodsCache = cache('30 minutes', (req: Request, res: Response) => {
  if (res.statusCode === 200 && req.method === 'GET') {
    return true;
  }
  return false;
});

const router = Router();

router.all(
  '/',
  checkMethods,
  getMethodsCache,
  asyncHandler(async (req: Request, res: Response) => {
    sendApiResult(res, await backupMetricsController.metrics(mapRequest(req)));
  })
);

router.all(
  '/statistics',
  checkMethods,
  getMethodsCache,
  asyncHandler(async (req: Request, res: Response) => {
    sendApiResult(res, await backupMetricsController.statistics(mapRequest(req)));
  })
);

router.all(
  '/week',
  checkMethods,
  getMethodsCache,
  asyncHandler(async (req: Request, res: Response) => {
    sendApiResult(res, await backupMetricsController.weekMetrics(mapRequest(req)));
  })
);

router.get(
  '/grid',
  getMethodsCache,
  asyncHandler(async (req: Request, res: Response) => {
    sendApiResult(res, await backupMetricsController.gridMetrics());
  })
);

router.get(
  '/list',
  getMethodsCache,
  asyncHandler(async (req: Request, res: Response) => {
    sendApiResult(res, await backupMetricsController.list());
  })
);

export default router;
