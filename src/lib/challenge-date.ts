export function parseChallengeDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatChallengeDate(
  date: string,
  options: Intl.DateTimeFormatOptions
): string {
  return parseChallengeDate(date).toLocaleDateString('en-US', options);
}
