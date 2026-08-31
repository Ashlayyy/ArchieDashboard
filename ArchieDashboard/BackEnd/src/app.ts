import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import { limiter, slower } from './middlewares/rateLimit';
import morganFormat from './helpers/morganFormat';

function corsOrigins(): cors.CorsOptions['origin'] {
  const configured = process.env.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured && configured.length > 0) {
    return configured;
  }

  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  return ['http://localhost:5173', 'http://localhost:4173'];
}

const app = express();

if (process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '100kb' }));
app.use(compression());
app.use(helmet());
app.disable('x-powered-by');
app.use(limiter);
app.use(slower);
app.use(
  cors({
    origin: corsOrigins(),
    credentials: true
  })
);
app.use(morgan(morganFormat()));

export default app;
