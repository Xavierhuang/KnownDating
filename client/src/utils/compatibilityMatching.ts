import { CompatibilityAnswer } from '../types/compatibility';
import { COMPATIBILITY_QUESTIONS } from '../types/compatibility';

export interface CompatibilityScore {
  consistency: number; // 0-100: Do their answers align?
  selfAwareness: number; // 0-100: Do they take responsibility?
  futureOrientation: number; // 0-100: Are they intentional?
  overall: number; // 0-100: Overall compatibility score
}

// Keywords and patterns that indicate self-awareness
const SELF_AWARENESS_INDICATORS = [
  'i learned', 'i realized', 'i understand', 'i recognize', 'i acknowledge',
  'i take responsibility', 'i own', 'my fault', 'i was wrong', 'i made mistakes',
  'i need to work on', 'i am working on', 'i am improving', 'i am growing',
  'i reflect', 'i consider', 'i think about', 'i evaluate', 'i assess',
  'i am aware', 'i know that', 'i see that', 'i notice', 'i observe'
];

// Keywords and patterns that indicate future orientation
const FUTURE_ORIENTATION_INDICATORS = [
  'in 5 years', 'in 10 years', 'in the future', 'i plan to', 'i want to',
  'i hope to', 'i aim to', 'i intend to', 'i will', 'i am going to',
  'my goal', 'my vision', 'my plan', 'my strategy', 'my roadmap',
  'building', 'creating', 'developing', 'growing', 'expanding',
  'long-term', 'long term', 'eventually', 'ultimately', 'someday',
  'i envision', 'i see myself', 'i imagine', 'i picture', 'i dream'
];

// Keywords that indicate consistency (alignment between answers)
const CONSISTENCY_INDICATORS = [
  'values', 'principles', 'beliefs', 'core', 'fundamental', 'important to me',
  'matters to me', 'i care about', 'i prioritize', 'i value', 'i believe in'
];

/**
 * Analyze text for self-awareness indicators
 */
function analyzeSelfAwareness(text: string): number {
  const lowerText = text.toLowerCase();
  let score = 0;
  let matches = 0;

  SELF_AWARENESS_INDICATORS.forEach(indicator => {
    if (lowerText.includes(indicator)) {
      matches++;
      score += 10;
    }
  });

  // Bonus for personal reflection language
  const reflectionPatterns = [
    /\bi\s+(learned|realized|understand|recognize|acknowledge)/gi,
    /\bi\s+(take|took)\s+responsibility/gi,
    /\bi\s+(am|was)\s+wrong/gi,
    /\bi\s+(need|needed)\s+to\s+work\s+on/gi,
  ];

  reflectionPatterns.forEach(pattern => {
    const found = text.match(pattern);
    if (found) {
      matches += found.length;
      score += found.length * 5;
    }
  });

  // Cap at 100
  return Math.min(100, score + (matches * 2));
}

/**
 * Analyze text for future orientation indicators
 */
function analyzeFutureOrientation(text: string): number {
  const lowerText = text.toLowerCase();
  let score = 0;
  let matches = 0;

  FUTURE_ORIENTATION_INDICATORS.forEach(indicator => {
    if (lowerText.includes(indicator)) {
      matches++;
      score += 8;
    }
  });

  // Bonus for specific time references
  const timePatterns = [
    /\bin\s+\d+\s+years/gi,
    /\b\d+\s+years\s+from\s+now/gi,
    /\b(long|short)\s*[-]?term/gi,
  ];

  timePatterns.forEach(pattern => {
    const found = text.match(pattern);
    if (found) {
      matches += found.length;
      score += found.length * 10;
    }
  });

  // Bonus for goal-oriented language
  const goalPatterns = [
    /\bmy\s+(goal|vision|plan|strategy|roadmap)/gi,
    /\bi\s+(plan|hope|aim|intend|will|am\s+going)\s+to/gi,
  ];

  goalPatterns.forEach(pattern => {
    const found = text.match(pattern);
    if (found) {
      matches += found.length;
      score += found.length * 7;
    }
  });

  // Cap at 100
  return Math.min(100, score + (matches * 2));
}

/**
 * Analyze consistency between answers by looking for shared values/principles
 */
function analyzeConsistency(answers: CompatibilityAnswer[]): number {
  if (answers.length === 0) return 0;

  // Extract all unique value-related words/phrases from all answers
  const valueMentions = new Map<string, number>();
  
  answers.forEach(answer => {
    const text = answer.answer.toLowerCase();
    
    // Look for value statements
    CONSISTENCY_INDICATORS.forEach(indicator => {
      if (text.includes(indicator)) {
        // Extract the value mentioned
        const sentences = text.split(/[.!?]+/);
        sentences.forEach(sentence => {
          if (sentence.includes(indicator)) {
            // Try to extract the actual value/principle
            const valueMatch = sentence.match(/(?:i\s+)?(?:value|care\s+about|prioritize|believe\s+in|important\s+to\s+me)\s+([^,\.!?]+)/i);
            if (valueMatch && valueMatch[1]) {
              const value = valueMatch[1].trim();
              valueMentions.set(value, (valueMentions.get(value) || 0) + 1);
            }
          }
        });
      }
    });
  });

  // Calculate consistency based on repeated mentions
  const repeatedValues = Array.from(valueMentions.values()).filter(count => count > 1);
  const consistencyScore = Math.min(100, repeatedValues.length * 15 + (repeatedValues.reduce((a, b) => a + b, 0) * 5));

  // Also check for alignment in similar questions
  // Questions in the same category should have some alignment
  const categoryGroups = new Map<string, CompatibilityAnswer[]>();
  answers.forEach(answer => {
    const question = COMPATIBILITY_QUESTIONS.find(q => q.id === answer.questionId);
    if (question) {
      const category = question.category;
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, []);
      }
      categoryGroups.get(category)!.push(answer);
    }
  });

  // Check for thematic consistency within categories
  let thematicConsistency = 0;
  categoryGroups.forEach((categoryAnswers) => {
    if (categoryAnswers.length > 1) {
      // Simple check: do answers mention similar themes?
      const allText = categoryAnswers.map(a => a.answer.toLowerCase()).join(' ');
      const uniqueWords = new Set(allText.split(/\s+/));
      const wordCount = allText.split(/\s+/).length;
      const diversity = uniqueWords.size / wordCount;
      // Lower diversity = more consistent
      thematicConsistency += (1 - diversity) * 30;
    }
  });

  return Math.min(100, consistencyScore + thematicConsistency);
}

/**
 * Calculate compatibility score for a user based on their answers
 */
export function calculateCompatibilityScore(answers: CompatibilityAnswer[]): CompatibilityScore {
  if (answers.length === 0) {
    return {
      consistency: 0,
      selfAwareness: 0,
      futureOrientation: 0,
      overall: 0,
    };
  }

  // Calculate individual scores
  const selfAwarenessScores = answers.map(a => analyzeSelfAwareness(a.answer));
  const futureOrientationScores = answers.map(a => analyzeFutureOrientation(a.answer));

  const avgSelfAwareness = selfAwarenessScores.reduce((a, b) => a + b, 0) / selfAwarenessScores.length;
  const avgFutureOrientation = futureOrientationScores.reduce((a, b) => a + b, 0) / futureOrientationScores.length;
  const consistency = analyzeConsistency(answers);

  // Overall score is weighted average
  const overall = (consistency * 0.4 + avgSelfAwareness * 0.3 + avgFutureOrientation * 0.3);

  return {
    consistency: Math.round(consistency),
    selfAwareness: Math.round(avgSelfAwareness),
    futureOrientation: Math.round(avgFutureOrientation),
    overall: Math.round(overall),
  };
}

/**
 * Calculate compatibility between two users
 */
export function calculateMatchCompatibility(
  user1Answers: CompatibilityAnswer[],
  user2Answers: CompatibilityAnswer[]
): CompatibilityScore {
  const user1Score = calculateCompatibilityScore(user1Answers);
  const user2Score = calculateCompatibilityScore(user2Answers);

  // Calculate alignment scores
  // Consistency alignment: how similar are their consistency scores?
  const consistencyAlignment = 100 - Math.abs(user1Score.consistency - user2Score.consistency);
  
  // Self-awareness alignment: how similar are their self-awareness levels?
  const selfAwarenessAlignment = 100 - Math.abs(user1Score.selfAwareness - user2Score.selfAwareness);
  
  // Future orientation alignment: how similar are their future orientations?
  const futureOrientationAlignment = 100 - Math.abs(user1Score.futureOrientation - user2Score.futureOrientation);

  // Overall match score
  const overall = (
    consistencyAlignment * 0.4 +
    selfAwarenessAlignment * 0.3 +
    futureOrientationAlignment * 0.3
  );

  return {
    consistency: Math.round(consistencyAlignment),
    selfAwareness: Math.round(selfAwarenessAlignment),
    futureOrientation: Math.round(futureOrientationAlignment),
    overall: Math.round(overall),
  };
}

