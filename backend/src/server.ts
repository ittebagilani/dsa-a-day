import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { connectToDatabase } from './lib/mongodb';
import { backfillMissingChallenges, generateDailyChallenge } from './services/ai';
import { getChallengeTimezone, getTodayChallengeDateString } from './lib/date';
import { optionalCsvEnv, requireEnv } from './lib/env';
import challengeRoutes from './routes/challenges';
import authRoutes from './routes/auth';
import progressRoutes from './routes/progress';
import subscriptionRoutes from './routes/subscriptions';
import stripeRoutes from './routes/stripe';
import webhookRoutes from './routes/webhooks';
import leaderboardRoutes from './routes/leaderboard';

const app = express();
const PORT = process.env.PORT || 3001;
const frontendUrl = requireEnv('FRONTEND_URL');
const allowedOrigins = new Set([frontendUrl, ...optionalCsvEnv('CORS_ORIGINS')]);

function resolveFrontendDistPath(): string | null {
  const envPath = process.env.FRONTEND_DIST_PATH;
  const candidates = [
    envPath ? path.resolve(envPath) : null,
    path.resolve(__dirname, '../../dist'),
    path.resolve(__dirname, '../dist'),
    path.resolve(process.cwd(), 'dist'),
    path.resolve(process.cwd(), '../dist'),
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    const indexPath = path.join(candidate, 'index.html');
    if (fs.existsSync(indexPath)) {
      return candidate;
    }
  }

  return null;
}

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
}));

// Stripe Webhooks need the raw body for signature verification
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/challenges', challengeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Serve frontend build from the same service (single URL deployment).
const frontendDistPath = resolveFrontendDistPath();
if (frontendDistPath) {
  console.log(`Serving frontend assets from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  console.warn('Frontend dist not found. Set FRONTEND_DIST_PATH or verify frontend build step.');
  app.get(/^\/(?!api).*/, (req, res) => {
    res.status(503).send('Frontend build not found on server.');
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Daily challenge generation at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily challenge generation cron job...');
  try {
    const challenge = await generateDailyChallenge(getTodayChallengeDateString());
    if (challenge) {
      console.log(`Successfully generated daily challenge: ${challenge.title}`);
    } else {
      console.log('Failed to generate daily challenge or one already exists.');
    }
  } catch (error) {
    console.error('Error in daily challenge generation cron job:', error);
  }
}, {
  timezone: getChallengeTimezone(),
});

// Connect to database and start server
async function startServer() {
  try {
    await connectToDatabase();
    console.log('Connected to MongoDB');

    await backfillMissingChallenges();
    console.log('Challenge backfill check completed');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
