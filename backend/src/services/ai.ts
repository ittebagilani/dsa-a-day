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
  correctAnswer: string;
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

const fallbackTemplates: Array<
  Omit<Challenge, 'id' | 'date' | 'is_active'>
> = [
  {
    type: 'bug-fix',
    difficulty: 'easy',
    title: 'Merge Two Sorted Arrays',
    description:
      'Fix the merge function so it correctly merges two sorted arrays into one sorted array.',
    code: `function merge(a, b) {
  const result = [];
  let i = 0, j = 0;

  while (i < a.length && j < b.length) {
    if (a[i] < b[j]) {
      result.push(a[i]);
      i++;
    } else {
      result.push(a[i]);
      j++;
    }
  }

  return result.concat(a.slice(i), b.slice(j));
}`,
    bugLine: 11,
    correctAnswer: 'result.push(b[j]);',
    hints: [
      'Inspect the branch where a[i] is not smaller than b[j].',
      'In each branch, push from the same pointer you increment.',
      'One side of the merge is currently duplicated.',
    ],
    explanation:
      'When b[j] is smaller (or equal), the code should push b[j] and increment j. Pushing a[i] there duplicates values from a and skips values from b.',
    conceptTitle: 'Two Pointers',
    conceptContent:
      'Two pointers are commonly used to merge sorted sequences in linear time. Maintain the invariant that result is always sorted and built from consumed prefixes of both arrays.',
  },
  {
    type: 'complete-line',
    difficulty: 'medium',
    title: 'Binary Search Midpoint',
    description:
      'Complete the missing line to perform binary search correctly.',
    code: `function binarySearch(nums, target) {
  let left = 0, right = nums.length - 1;

  while (left <= right) {
    // missing line
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    correctAnswer: 'const mid = Math.floor((left + right) / 2);',
    hints: [
      'The midpoint must be recomputed each loop iteration.',
      'Use left and right bounds to derive mid.',
      'The result should be an integer index.',
    ],
    explanation:
      'Binary search repeatedly splits the search space in half. The midpoint must be recomputed from current bounds on each iteration.',
    conceptTitle: 'Binary Search',
    conceptContent:
      'Binary search works on sorted arrays by comparing target to the midpoint and shrinking the search interval. It runs in O(log n) time.',
  },
  {
    type: 'find-problem',
    difficulty: 'hard',
    title: 'Longest Substring Without Repeating Characters',
    description:
      'Find the logic issue in this sliding-window implementation and provide the corrected line.',
    code: `function lengthOfLongestSubstring(s) {
  let left = 0;
  let best = 0;
  const seen = new Map();

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (seen.has(ch)) {
      left = seen.get(ch) + 1;
    }
    seen.set(ch, right);
    best = Math.max(best, right - left + 1);
  }

  return best;
}`,
    correctAnswer: 'left = Math.max(left, seen.get(ch) + 1);',
    hints: [
      'left should never move backward.',
      'A duplicate outside the active window should not shrink correctness.',
      'Guard left update with current left value.',
    ],
    explanation:
      'If a character was seen before left, blindly setting left causes it to move backward and break the window invariant. Use Math.max to keep left monotonic.',
    conceptTitle: 'Sliding Window',
    conceptContent:
      'Sliding window tracks a contiguous region with maintained constraints. For uniqueness, store last seen indices and move the left boundary carefully.',
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

  const prompt = `Generate a Data Structures and Algorithms (DSA) coding challenge for a "Daily Code Quest" app.
  The challenge should be of one of these types:
  1. "bug-fix": A code snippet with a specific bug on one line.
  2. "complete-line": A code snippet with one or two lines missing.
  3. "find-problem": A logic error that's harder to spot.

  The difficulty should be one of: "easy", "medium", "hard".

  Return ONLY a JSON object with the following structure:
  {
    "type": "bug-fix" | "complete-line" | "find-problem",
    "difficulty": "easy" | "medium" | "hard",
    "title": "Short Descriptive Title",
    "description": "Clear explanation of the problem and what to do.",
    "code": "The code snippet (Python or JavaScript). For bug-fix, include the bug.",
    "bugLine": 1-indexed number of the line to fix (optional for find-problem),
    "correctAnswer": "The exact corrected code or missing line.",
    "hints": ["Hint 1", "Hint 2", "Hint 3"],
    "explanation": "Detailed explanation of the solution.",
    "conceptTitle": "Name of the core DSA concept involved",
    "conceptContent": "Detailed educational content about the concept (1-2 paragraphs)."
  }

  CRITICAL: For "bug-fix" type, the 'bugLine' must be THE EXACT index of the line containing the bug in the 'code' string, counting from 1. Double check this count.
  CRITICAL: Do not include marker comments like "# Bug here", "// bug here", or "# Missing line here" in the code.
  
  The date should be ${challengeDate} in YYYY-MM-DD format.
  Ensure the problem is varied (Arrays, Strings, Trees, Linked Lists, DP, etc.).`;

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
    
    // Get the highest ID to increment
    const lastChallenge = await collection.findOne({}, { sort: { id: -1 } });
    const nextId = lastChallenge ? lastChallenge.id + 1 : 1;

    const challenge: Challenge = {
      ...data,
      id: nextId,
      date: challengeDate,
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
