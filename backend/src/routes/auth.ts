import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getCollection } from '../lib/mongodb';
import { requireEnv } from '../lib/env';
import { rateLimit } from '../middleware/rate-limit';

const router = Router();
const JWT_SECRET = requireEnv('JWT_SECRET');
const FRONTEND_URL = requireEnv('FRONTEND_URL');
const BACKEND_URL = requireEnv('BACKEND_URL');
const GOOGLE_CLIENT_ID = requireEnv('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = requireEnv('GOOGLE_CLIENT_SECRET');

const OAUTH_STATE_COOKIE = 'oauth_state';
const oauthCodes = new Map<string, { token: string; expiresAt: number }>();
const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, keyPrefix: 'auth' });
const oauthRateLimit = rateLimit({ windowMs: 5 * 60 * 1000, max: 20, keyPrefix: 'oauth' });

function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, pair) => {
    const [rawKey, ...rest] = pair.trim().split('=');
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join('=') || '');
    return acc;
  }, {});
}

// Register
router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const users = await getCollection('users');
    
    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const user = {
      id: crypto.randomUUID(),
      email,
      password_hash,
      xp: 0,
      streak: 0,
      created_at: new Date(),
    };
    
    await users.insertOne(user);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const { password_hash: _, ...userWithoutPassword } = user;
    res.status(201).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const users = await getCollection('users');
    const user = await users.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Please sign in with your social provider' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const { password_hash: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth
router.get('/google', oauthRateLimit, (req, res) => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const state = crypto.randomUUID();
  res.setHeader(
    'Set-Cookie',
    `${OAUTH_STATE_COOKIE}=${encodeURIComponent(state)}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  );

  const options = {
    redirect_uri: `${BACKEND_URL}/api/auth/google/callback`,
    client_id: GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    state,
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);
  res.redirect(`${rootUrl}?${qs.toString()}`);
});

router.get('/google/callback', oauthRateLimit, async (req, res) => {
  const code = req.query.code as string;
  const state = req.query.state as string;
  const cookies = parseCookies(req.headers.cookie);
  const expectedState = cookies[OAUTH_STATE_COOKIE];

  if (!code || !state || !expectedState || state !== expectedState) {
    return res.redirect(`${FRONTEND_URL}/?error=auth_failed`);
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${BACKEND_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json() as any;
    const { access_token } = tokenData;

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const googleUser = await userResponse.json() as any;

    const users = await getCollection('users');
    let user = await users.findOne({ email: googleUser.email });

    if (!user) {
      user = {
        id: crypto.randomUUID(),
        email: googleUser.email,
        name: googleUser.name,
        provider: 'google',
        provider_id: googleUser.id,
        xp: 0,
        streak: 0,
        created_at: new Date(),
      };
      await users.insertOne(user);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const authCode = crypto.randomUUID();
    oauthCodes.set(authCode, {
      token,
      expiresAt: Date.now() + 60_000,
    });

    res.setHeader(
      'Set-Cookie',
      `${OAUTH_STATE_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    );

    res.redirect(`${FRONTEND_URL}/auth-callback?code=${authCode}`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${FRONTEND_URL}/?error=auth_failed`);
  }
});

router.post('/exchange-code', oauthRateLimit, async (req, res) => {
  const { code } = req.body as { code?: string };

  if (!code) {
    return res.status(400).json({ error: 'Missing code' });
  }

  const entry = oauthCodes.get(code);
  if (!entry) {
    return res.status(400).json({ error: 'Invalid code' });
  }

  oauthCodes.delete(code);
  if (Date.now() > entry.expiresAt) {
    return res.status(400).json({ error: 'Code expired' });
  }

  return res.json({ token: entry.token });
});

export default router;
