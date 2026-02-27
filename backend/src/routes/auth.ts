import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { getCollection } from '../lib/mongodb';
import { requireEnv } from '../lib/env';
import { rateLimit } from '../middleware/rate-limit';
import { sendVerificationEmail } from '../lib/email';

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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashVerificationToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

async function sendVerificationForUser(email: string, userId: string, users: any): Promise<void> {
  const verificationToken = randomBytes(32).toString('hex');
  const verificationTokenHash = hashVerificationToken(verificationToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await users.updateOne(
    { id: userId },
    {
      $set: {
        email_verification_token_hash: verificationTokenHash,
        email_verification_expires_at: expiresAt,
      },
    }
  );

  const verificationUrl = `${BACKEND_URL}/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}`;
  await sendVerificationEmail(email, verificationUrl);
}

// Register
router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? normalizeEmail(email) : '';
    
    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const users = await getCollection('users');
    
    // Check if user already exists
    const existingUser = await users.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (existingUser.password_hash && existingUser.email_verified !== true) {
        try {
          await sendVerificationForUser(normalizedEmail, existingUser.id, users);
          return res.status(200).json({
            message: 'Verification email re-sent. Please check your inbox.',
          });
        } catch (error) {
          console.error('Resend verification on existing user failed:', error);
          return res.status(500).json({ error: 'Failed to send verification email' });
        }
      }
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const user = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      password_hash,
      email_verified: false,
      email_verification_token_hash: null,
      email_verification_expires_at: null,
      xp: 0,
      streak: 0,
      created_at: new Date(),
    };
    
    await users.insertOne(user);

    try {
      await sendVerificationForUser(user.email, user.id, users);
    } catch (error) {
      await users.deleteOne({ id: user.id });
      console.error('Failed to send verification email:', error);
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    res.status(201).json({
      message: 'Account created. Please verify your email before signing in.',
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
    const normalizedEmail = typeof email === 'string' ? normalizeEmail(email) : '';
    
    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const users = await getCollection('users');
    const user = await users.findOne({ email: normalizedEmail });
    
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

    if (user.email_verified === false) {
      return res.status(403).json({ error: 'Please verify your email before signing in' });
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

router.post('/resend-verification', authRateLimit, async (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    const normalizedEmail = typeof email === 'string' ? normalizeEmail(email) : '';

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const users = await getCollection('users');
    const user = await users.findOne({ email: normalizedEmail });

    if (!user || !user.password_hash || user.email_verified === true) {
      return res.json({ message: 'If the account exists, a verification email has been sent.' });
    }

    await sendVerificationForUser(normalizedEmail, user.id, users);
    return res.json({ message: 'Verification email sent.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ error: 'Failed to send verification email' });
  }
});

router.get('/verify-email', async (req, res) => {
  try {
    const token = req.query.token as string | undefined;
    if (!token) {
      return res.redirect(`${FRONTEND_URL}/verify-email?status=error&reason=missing_token`);
    }

    const tokenHash = hashVerificationToken(token);
    const users = await getCollection('users');

    const user = await users.findOne({
      email_verification_token_hash: tokenHash,
      email_verification_expires_at: { $gt: new Date() },
      email_verified: false,
    });

    if (!user) {
      return res.redirect(`${FRONTEND_URL}/verify-email?status=error&reason=invalid_or_expired`);
    }

    await users.updateOne(
      { id: user.id },
      {
        $set: { email_verified: true },
        $unset: {
          email_verification_token_hash: '',
          email_verification_expires_at: '',
        },
      }
    );

    return res.redirect(`${FRONTEND_URL}/verify-email?status=success`);
  } catch (error) {
    console.error('Verify email error:', error);
    return res.redirect(`${FRONTEND_URL}/verify-email?status=error&reason=server_error`);
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
