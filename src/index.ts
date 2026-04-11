import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { API_SERVICES } from './config/api-catalog.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { apiRouter } from './routes/index.js';

const app = express();

const corsOriginOption: true | string[] =
  env.corsOrigin === '*'
    ? true
    : env.corsOrigin.split(',').map((o) => o.trim()).filter(Boolean);

app.use(cors({ origin: corsOriginOption }));

app.use(express.json({ limit: '64kb' }));
app.use(requestLogger);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', apiLimiter, apiRouter);

app.use(errorHandler);

app.listen(env.port, () => {
  console.info(`BFF listening on port ${env.port}`);
  console.info('Servicios disponibles:');
  for (const s of API_SERVICES) {
    const q = s.query?.length ? ` [query: ${s.query.join(', ')}]` : '';
    console.info(`  ${s.method.padEnd(6)} ${s.path}${q} — ${s.description}`);
  }
});
