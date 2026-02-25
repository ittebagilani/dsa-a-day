type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function rateLimit(options: { windowMs: number; max: number; keyPrefix: string }) {
  return (req: any, res: any, next: any) => {
    const now = Date.now();
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const key = `${options.keyPrefix}:${ip}`;
    const current = buckets.get(key);

    if (!current || now > current.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (current.count >= options.max) {
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }

    current.count += 1;
    buckets.set(key, current);
    return next();
  };
}
