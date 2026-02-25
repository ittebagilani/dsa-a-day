const CHALLENGE_TIMEZONE = process.env.CHALLENGE_TIMEZONE || 'UTC';

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
