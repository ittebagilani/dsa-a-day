import posthog from 'posthog-js';

const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';

export function analyticsEnabled(): boolean {
  return Boolean(POSTHOG_KEY);
}

if (analyticsEnabled()) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
  });
}

export const posthogClient = analyticsEnabled() ? posthog : null;

export function identifyAnalyticsUser(userId: string, properties: Record<string, unknown> = {}): void {
  if (!posthogClient || !userId) return;
  posthogClient.identify(userId, properties);
}

export function resetAnalyticsUser(): void {
  if (!posthogClient) return;
  posthogClient.reset();
}

export function trackEvent(
  event: string,
  properties: Record<string, unknown> = {},
  userId?: string | null
): void {
  if (!posthogClient || !event) return;
  if (userId) {
    posthogClient.identify(userId);
  }
  posthogClient.capture(event, {
    ...properties,
    app: 'daily-code-quest',
  });
}
