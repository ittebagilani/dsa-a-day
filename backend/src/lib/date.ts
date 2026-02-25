const DEFAULT_CHALLENGE_TIMEZONE = 'America/Los_Angeles';

function resolveChallengeTimezone(): string {
  const candidate =
    process.env.CHALLENGE_TIMEZONE || process.env.TZ || DEFAULT_CHALLENGE_TIMEZONE;

  try {
    // Validate timezone early so date calculations stay deterministic.
    new Intl.DateTimeFormat('en-US', { timeZone: candidate }).format(new Date());
    return candidate;
  } catch {
    console.warn(
      `Invalid timezone "${candidate}" for CHALLENGE_TIMEZONE. Falling back to ${DEFAULT_CHALLENGE_TIMEZONE}.`,
    );
    return DEFAULT_CHALLENGE_TIMEZONE;
  }
}

const CHALLENGE_TIMEZONE = resolveChallengeTimezone();

export function getChallengeTimezone(): string {
  return CHALLENGE_TIMEZONE;
}

export function formatDateInChallengeTimezone(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CHALLENGE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getTodayChallengeDateString(): string {
  return formatDateInChallengeTimezone(new Date());
}

export function addDays(date: string, amount: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  utcDate.setUTCDate(utcDate.getUTCDate() + amount);
  return utcDate.toISOString().slice(0, 10);
}
