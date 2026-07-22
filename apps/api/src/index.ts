import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { initCronJobs } from './services/cron';

export const app = express();

// Explicit CORS Headers Middleware for Vercel Cross-Origin Preflight (OPTIONS)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes multi-prefix mounting for Vercel serverless routing resilience
app.use('/api/v1', routes);
app.use('/v1', routes);
app.use('/api', routes);
app.use('/', routes);

// Error Handler
app.use(errorHandler);

// Start server if executed directly
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`🚀 InsureCore API Server listening on port ${config.port} [${config.nodeEnv}]`);
    initCronJobs();
  });
}

export default app;
