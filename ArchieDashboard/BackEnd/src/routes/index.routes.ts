import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import BackupMetrics from './backupmetrics.routes';
import Predicting from './predicting.routes';
import Settings from './settings.routes';
import Health from './health.routes';
import app from '../app';
import createAuthMiddleware from '../middlewares/requireAuth';
import HandleError from '../middlewares/HandleError';

const swaggerFile = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../swagger.json'), 'utf8'));

const requireAuth = createAuthMiddleware();

app.use('/health', Health);

app.use('/api/v1/database/metrics', requireAuth, BackupMetrics);
app.use('/api/v1/predict', requireAuth, Predicting);
app.use('/api/v1/settings', requireAuth, Settings);

if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
  app.use('/docs', requireAuth, swaggerUi.serve, swaggerUi.setup(swaggerFile));
}

app.use((_req, res) => {
  res.status(404).json({ status: 404, data: 'Not found' });
});

app.use(HandleError);

export default app;
