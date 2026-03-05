import OpenAI from 'openai';
import { getCollection } from '../lib/mongodb';
import { addDays, getTodayChallengeDateString } from '../lib/date';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing OpenAI API key. Please set it in your environment variables.');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai!;
}

export interface Challenge {
  id: number;
  date: string;
  type: 'bug-fix' | 'complete-line' | 'find-problem';
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  description: string;
  code: string;
  bugLine?: number;
  bugLines?: number[];
  correctAnswer: string;
  correctAnswers?: string[];
  hints: string[];
  explanation: string;
  conceptTitle?: string;
  conceptContent?: string;
  is_active: boolean;
}

const fallbackHints = [
  'Trace the code with a small example input to spot where it diverges.',
  'Check the algorithm invariant at each loop or recursion step.',
  'Compare each line with what the intended logic requires.',
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

const conceptTopicCatalog = [
  'Arrays',
  'Strings',
  'Hash Maps',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Queue',
  'Linked Lists',
  'Binary Search',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Greedy',
  'Recursion',
];

const normalizeConceptTopic = (raw?: string): string | null => {
  if (!raw) return null;
  const value = raw.toLowerCase();
  const match = conceptTopicCatalog.find((topic) =>
    value.includes(topic.toLowerCase().replace(/\s+/g, ' '))
  );
  return match || null;
};

const getRecentConceptTopics = async (
  collection: Awaited<ReturnType<typeof getCollection>>,
  challengeDate: string,
  limit = 4
): Promise<string[]> => {
  type RecentChallengeTopic = {
    conceptTitle?: string;
    title?: string;
    description?: string;
  };

  const recent = await collection
    .find(
      {
        is_active: true,
        date: { $lt: challengeDate },
      },
      {
        projection: {
          _id: 0,
          conceptTitle: 1,
          title: 1,
          description: 1,
        },
      }
    )
    .sort({ date: -1 })
    .limit(limit)
    .toArray() as RecentChallengeTopic[];

  return recent
    .map((challenge) =>
      normalizeConceptTopic(challenge.conceptTitle) ||
      normalizeConceptTopic(challenge.title) ||
      normalizeConceptTopic(challenge.description)
    )
    .filter((topic): topic is string => Boolean(topic));
};

const pickRequiredTopic = (challengeDate: string, recentTopics: string[]): string => {
  const blocked = new Set(recentTopics);
  const available = conceptTopicCatalog.filter((topic) => !blocked.has(topic));
  const pool = available.length > 0 ? available : conceptTopicCatalog;
  const index = dateToSeed(challengeDate) % pool.length;
  return pool[index];
};

const fallbackTemplates: Array<
  Omit<Challenge, 'id' | 'date' | 'is_active'>
> = [
  {
    type: 'bug-fix',
    difficulty: 'medium',
    title: 'Longest Subarray With Sum K',
    description:
      'You are given an integer array `nums` and an integer `k`. Return the length of the longest subarray whose sum equals `k`. The logic is close, but one non-trivial bug causes incorrect lengths.',
    code: `def longest_subarray_sum_k(nums, k):
    prefix = 0
    first_seen = {0: -1}
    best = 0

    for i, value in enumerate(nums):
        prefix += value
        if (prefix - k) in first_seen:
            best = max(best, i - first_seen[prefix])
        if prefix not in first_seen:
            first_seen[prefix] = i

    return best
}`,
    bugLine: 8,
    bugLines: [8],
    correctAnswer: 'best = max(best, i - first_seen[prefix - k])',
    correctAnswers: ['best = max(best, i - first_seen[prefix - k])'],
    hints: [
      'Use prefix sum identities carefully when looking up previous indices.',
      'The map key used in the length calculation should match the condition check.',
      'Compare the lookup expression to the algebraic form of prefix[i] - prefix[j] = k.',
    ],
    explanation:
      'If prefix[i] - prefix[j] = k, then prefix[j] must be prefix[i] - k. The code checks the right condition but uses the wrong key when computing length. Using first_seen[prefix - k] fixes the logic.',
    conceptTitle: 'Hash Maps',
    conceptContent:
      'Prefix sums with a hash map let you answer subarray-sum queries in linear time. Store the first index of each prefix sum to maximize subarray length.',
  },
];

const dateToSeed = (date: string): number => {
  let seed = 0;
  for (let i = 0; i < date.length; i += 1) {
    seed = (seed * 31 + date.charCodeAt(i)) >>> 0;
  }
  return seed;
};

const buildFallbackChallenge = (challengeDate: string): Omit<Challenge, 'id'> => {
  const index = dateToSeed(challengeDate) % fallbackTemplates.length;
  const template = fallbackTemplates[index];
  return {
    ...template,
    hints: normalizeHints(template.hints),
    date: challengeDate,
    is_active: true,
  };
};

export async function generateDailyChallenge(targetDate?: string): Promise<Challenge | null> {
  const collection = await getCollection('challenges');
  const challengeDate = targetDate || getTodayChallengeDateString();
  const recentTopics = await getRecentConceptTopics(collection, challengeDate, 4);
  const requiredTopic = pickRequiredTopic(challengeDate, recentTopics);

  const existingChallenge = await collection.findOne({
    date: challengeDate,
    is_active: true,
  });

  if (existingChallenge) {
    return existingChallenge as Challenge;
  }

  const createAndStoreFallbackChallenge = async (): Promise<Challenge | null> => {
    const lastChallenge = await collection.findOne({}, { sort: { id: -1 } });
    const nextId = lastChallenge ? lastChallenge.id + 1 : 1;
    const challenge: Challenge = {
      ...buildFallbackChallenge(challengeDate),
      id: nextId,
    };
    await collection.insertOne(challenge);
    return challenge;
  };

  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      `OPENAI_API_KEY is missing. Using fallback challenge template for ${challengeDate}.`,
    );
    return createAndStoreFallbackChallenge();
  }

  const prompt = `Generate a Data Structures and Algorithms (DSA) coding challenge for a "DSA a Day" app.
  The challenge type should be "bug-fix".

  The difficulty should be one of: "easy", "medium". Prefer "medium".

  Return ONLY a JSON object with the following structure:
  {
    "type": "bug-fix",
    "difficulty": "easy" | "medium",
    "title": "Short Descriptive Title",
    "description": "2-4 sentences including an intro/context, expected behavior, and what to fix.",
    "code": "A Python code snippet containing exactly 1 real logic bug.",
    "bugLine": 1-indexed line number of the bug,
    "correctAnswer": "exact corrected line for that bug",
    "hints": ["Hint 1", "Hint 2", "Hint 3"],
    "explanation": "Detailed explanation of the solution.",
    "conceptTitle": "Name of the core DSA concept involved",
    "conceptContent": "Detailed educational content about the concept (1-2 paragraphs)."
  }

  CRITICAL: Generate EXACTLY 1 bug. No more, no less.
  CRITICAL: The bug should be a meaningful logic bug (state update, condition, index/pointer, map lookup), not trivial punctuation.
  CRITICAL: Do not rely on obscure edge-case-only failures; the bug should affect normal test cases.
  CRITICAL: Code must be Python only. Do not return JavaScript.
  CRITICAL: The description must begin with a short contextual intro sentence before fix instructions.
  CRITICAL: Do not include marker comments like "# Bug here", "// bug here", or "# Missing line here" in the code.
  CRITICAL: Today's required primary topic is "${requiredTopic}". Build the challenge around this topic.
  CRITICAL: Avoid repeating these recent topics: ${recentTopics.length > 0 ? recentTopics.join(', ') : 'none'}.
  CRITICAL: Set "conceptTitle" to one exact value from this list: ${conceptTopicCatalog.join(', ')}.
  
  The date should be ${challengeDate} in YYYY-MM-DD format.
  Ensure the problem is varied and not semantically equivalent to recent days (e.g., avoid repeating array sum traversal variants).`;

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: "system",
          content: "You are a DSA expert who generates high-quality coding challenges. You only output valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) return null;

    const data = JSON.parse(content);
    const normalizedBugLines = Array.isArray(data.bugLines)
      ? data.bugLines.map((value: unknown) => Number(value)).filter((value: number) => Number.isInteger(value) && value > 0)
      : (Number.isInteger(Number(data.bugLine)) && Number(data.bugLine) > 0 ? [Number(data.bugLine)] : []);
    const normalizedCorrectAnswers = Array.isArray(data.correctAnswers)
      ? data.correctAnswers.filter((answer: unknown): answer is string => typeof answer === 'string' && answer.trim().length > 0)
      : (typeof data.correctAnswer === 'string' && data.correctAnswer.trim().length > 0 ? [data.correctAnswer] : []);
    const generatedCode = typeof data.code === 'string' ? data.code : '';
    const looksLikePython = /\bdef\s+\w+\s*\(/.test(generatedCode) || /\bclass\s+\w+/.test(generatedCode);
    const normalizedBugLine = normalizedBugLines[0];
    const normalizedCorrectAnswer = normalizedCorrectAnswers[0];

    if (!normalizedBugLine || !normalizedCorrectAnswer || !looksLikePython) {
      console.warn('AI response did not match 1-bug Python requirements. Falling back to template.');
      return createAndStoreFallbackChallenge();
    }
    
    // Get the highest ID to increment
    const lastChallenge = await collection.findOne({}, { sort: { id: -1 } });
    const nextId = lastChallenge ? lastChallenge.id + 1 : 1;

    const challenge: Challenge = {
      ...data,
      type: 'bug-fix',
      difficulty: data.difficulty === 'easy' ? 'easy' : 'medium',
      id: nextId,
      date: challengeDate,
      bugLines: [normalizedBugLine],
      correctAnswers: [normalizedCorrectAnswer],
      bugLine: normalizedBugLine,
      correctAnswer: normalizedCorrectAnswer,
      conceptTitle: normalizeConceptTopic(data.conceptTitle) || requiredTopic,
      hints: normalizeHints(data.hints),
      is_active: true
    };

    // Save to database
    await collection.insertOne(challenge);

    return challenge;
  } catch (error) {
    console.error('Error generating AI challenge:', error);
    try {
      console.warn(
        `Falling back to local challenge template for ${challengeDate} after AI failure.`,
      );
      return await createAndStoreFallbackChallenge();
    } catch (fallbackError) {
      console.error('Error generating fallback challenge:', fallbackError);
      return null;
    }
  }
}

export async function backfillMissingChallenges(): Promise<void> {
  const collection = await getCollection('challenges');
  const today = getTodayChallengeDateString();

  const latestChallenge = await collection.findOne(
    { is_active: true },
    { sort: { date: -1 } }
  );

  if (!latestChallenge) {
    await generateDailyChallenge(today);
    return;
  }

  if (latestChallenge.date >= today) {
    await generateDailyChallenge(today);
    return;
  }

  let cursor = addDays(latestChallenge.date, 1);
  while (cursor <= today) {
    await generateDailyChallenge(cursor);
    cursor = addDays(cursor, 1);
  }
}
