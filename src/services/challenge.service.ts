const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface Challenge {
  id: number;
  date: string;
  type: 'bug-fix' | 'complete-line' | 'find-problem';
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  description: string;
  code: string;
  bugLine?: number | null;
  correctAnswer: string;
  hints: string[];
  explanation: string;
  conceptTitle?: string;
  conceptContent?: string;
  is_active?: boolean;
}

const safeFetchJson = async <T>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return response.json() as Promise<T>;
  } catch {
    return null;
  }
};

const fallbackHints = [
  'Trace the code with a small input to see where behavior diverges.',
  'Focus on the key invariant for this algorithm.',
  'Compare your answer with what each line should do step by step.',
];

const normalizeHints = (hints: unknown): string[] => {
  const cleaned = Array.isArray(hints)
    ? hints.filter((hint): hint is string => typeof hint === 'string' && hint.trim().length > 0)
    : [];

  const result = [...cleaned];
  let fallbackIndex = 0;
  while (result.length < 3) {
    result.push(fallbackHints[fallbackIndex]);
    fallbackIndex += 1;
  }

  return result.slice(0, 3);
};

const normalizeChallenge = (challenge: Challenge): Challenge => ({
  ...challenge,
  hints: normalizeHints(challenge.hints),
});

export const challengeService = {
  async getTodaysChallenge(): Promise<Challenge | null> {
    const challenge = await safeFetchJson<Challenge>(`${API_URL}/challenges/today`);
    return challenge ? normalizeChallenge(challenge) : null;
  },

  async getChallengeById(id: number): Promise<Challenge | null> {
    const challenge = await safeFetchJson<Challenge>(`${API_URL}/challenges/${id}`);
    return challenge ? normalizeChallenge(challenge) : null;
  },

  async getPastChallenges(): Promise<Challenge[]> {
    const challenges = await safeFetchJson<Challenge[]>(`${API_URL}/challenges`);
    return (challenges ?? []).map(normalizeChallenge);
  },
};
