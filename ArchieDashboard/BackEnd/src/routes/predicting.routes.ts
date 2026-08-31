import 'reflect-metadata';
import { Request, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';
import { predictingController } from '../shared/container';
import checkMethods from '../middlewares/checkForMethods';
import mapRequest from '../helpers/mappers/requestmapper';
import sendApiResult from '../helpers/sendApiResult';

const router = Router();

router.all(
  '/',
  checkMethods,
  asyncHandler(async (req: Request, res: Response) => {
    sendApiResult(res, await predictingController.predict(mapRequest(req)));
  })
);

export default router;
