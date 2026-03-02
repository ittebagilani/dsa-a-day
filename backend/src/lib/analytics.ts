interface AnalyticsPayload {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}

const POSTHOG_HOST = (process.env.POSTHOG_HOST || 'https://us.i.posthog.com').replace(/\/+$/, '');
const POSTHOG_KEY = process.env.POSTHOG_KEY || process.env.VITE_POSTHOG_KEY || '';

export function analyticsEnabled(): boolean {
  return Boolean(POSTHOG_KEY);
}

export async function captureEvent({
  distinctId,
  event,
  properties = {},
}: AnalyticsPayload): Promise<void> {
  if (!analyticsEnabled() || !distinctId || !event) return;

  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event,
        distinct_id: distinctId,
        properties: {
          ...properties,
          distinct_id: distinctId,
          app: 'daily-code-quest',
          source: 'backend',
        },
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    // Best-effort analytics; do not impact request flow.
    console.warn('Analytics capture failed:', error);
  }
}
