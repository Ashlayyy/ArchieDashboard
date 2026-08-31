import { Request, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';
import mapRequest from '../helpers/mappers/requestmapper';
import { settingsController } from '../shared/container';
import sendApiResult from '../helpers/sendApiResult';

const router = Router();

const handleSettings = asyncHandler(async (req: Request, res: Response) => {
  sendApiResult(res, await settingsController.settingsById(mapRequest(req)));
});

router.all('/:id', handleSettings);

export default router;
