import { Router } from 'express';
import { databaseContainer } from '../shared/container';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    database: databaseContainer.connected ? 'connected' : 'unavailable'
  });
});

export default router;
