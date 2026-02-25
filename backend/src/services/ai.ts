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
    return null;
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
