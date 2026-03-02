const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';

const DISTINCT_ID_KEY = 'dcq.analytics.distinct_id';

function generateDistinctId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `anon_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function getDistinctId(): string {
  try {
    const existing = localStorage.getItem(DISTINCT_ID_KEY);
    if (existing) return existing;
    const created = generateDistinctId();
    localStorage.setItem(DISTINCT_ID_KEY, created);
    return created;
  } catch {
    return generateDistinctId();
  }
}

export function analyticsEnabled(): boolean {
  return Boolean(POSTHOG_KEY);
}

export function trackEvent(
  event: string,
  properties: Record<string, unknown> = {},
  userId?: string | null
): void {
  if (!analyticsEnabled()) return;

  const distinctId = userId || getDistinctId();
  const payload = {
    api_key: POSTHOG_KEY,
    event,
    distinct_id: distinctId,
    properties: {
      ...properties,
      distinct_id: distinctId,
      app: 'daily-code-quest',
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const body = JSON.stringify(payload);
    const endpoint = `${POSTHOG_HOST.replace(/\/+$/, '')}/capture/`;
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }));
      return;
    }
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      // Best-effort analytics.
    });
  } catch {
    // Best-effort analytics.
  }
}
