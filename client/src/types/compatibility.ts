export interface CompatibilityQuestion {
  id: string;
  category: CompatibilityCategory;
  question: string;
  whyThisMatters: string;
  order: number;
}

export type CompatibilityCategory = 
  | 'life-direction'
  | 'emotional-readiness'
  | 'connection-communication'
  | 'lifestyle-alignment'
  | 'commitment-vision';

export interface CompatibilityAnswer {
  questionId: string;
  answer: string;
  answeredAt: string;
}

export interface UserCompatibilityProfile {
  userId: string;
  answers: CompatibilityAnswer[];
  completedCategories: CompatibilityCategory[];
  lastUpdated: string;
}

export const COMPATIBILITY_QUESTIONS: CompatibilityQuestion[] = [
  // Life Direction (Who You're Becoming)
  {
    id: 'life-1',
    category: 'life-direction',
    question: 'Where do you see your life in 5–10 years?',
    whyThisMatters: 'Reveals long-term alignment, ambition level, and future pacing.',
    order: 1,
  },
  {
    id: 'life-2',
    category: 'life-direction',
    question: 'What values guide your everyday decisions?',
    whyThisMatters: 'Reveals long-term alignment, ambition level, and future pacing.',
    order: 2,
  },
  {
    id: 'life-3',
    category: 'life-direction',
    question: 'What does "success" mean to you?',
    whyThisMatters: 'Reveals long-term alignment, ambition level, and future pacing.',
    order: 3,
  },
  {
    id: 'life-4',
    category: 'life-direction',
    question: 'How important are family and legacy to you?',
    whyThisMatters: 'Reveals long-term alignment, ambition level, and future pacing.',
    order: 4,
  },
  {
    id: 'life-5',
    category: 'life-direction',
    question: 'What kind of life do you want to build with a partner?',
    whyThisMatters: 'Reveals long-term alignment, ambition level, and future pacing.',
    order: 5,
  },
  
  // Emotional Readiness (Are You Prepared?)
  {
    id: 'emotional-1',
    category: 'emotional-readiness',
    question: 'What did your last relationship teach you?',
    whyThisMatters: 'Screens for maturity, accountability, and healing stage.',
    order: 6,
  },
  {
    id: 'emotional-2',
    category: 'emotional-readiness',
    question: 'Why are you ready for a committed relationship now?',
    whyThisMatters: 'Screens for maturity, accountability, and healing stage.',
    order: 7,
  },
  {
    id: 'emotional-3',
    category: 'emotional-readiness',
    question: 'How do you handle conflict when emotions are high?',
    whyThisMatters: 'Screens for maturity, accountability, and healing stage.',
    order: 8,
  },
  {
    id: 'emotional-4',
    category: 'emotional-readiness',
    question: 'What personal patterns are you actively working on?',
    whyThisMatters: 'Screens for maturity, accountability, and healing stage.',
    order: 9,
  },
  {
    id: 'emotional-5',
    category: 'emotional-readiness',
    question: 'What does emotional safety mean to you?',
    whyThisMatters: 'Screens for maturity, accountability, and healing stage.',
    order: 10,
  },
  
  // Connection & Communication (How You Love)
  {
    id: 'connection-1',
    category: 'connection-communication',
    question: 'How do you give and receive affection?',
    whyThisMatters: 'Identifies love language, communication style, and repair skills.',
    order: 11,
  },
  {
    id: 'connection-2',
    category: 'connection-communication',
    question: 'What helps you feel understood?',
    whyThisMatters: 'Identifies love language, communication style, and repair skills.',
    order: 12,
  },
  {
    id: 'connection-3',
    category: 'connection-communication',
    question: 'How do you communicate disappointment or frustration?',
    whyThisMatters: 'Identifies love language, communication style, and repair skills.',
    order: 13,
  },
  {
    id: 'connection-4',
    category: 'connection-communication',
    question: 'What makes you feel valued in a relationship?',
    whyThisMatters: 'Identifies love language, communication style, and repair skills.',
    order: 14,
  },
  {
    id: 'connection-5',
    category: 'connection-communication',
    question: 'How do you repair after conflict?',
    whyThisMatters: 'Identifies love language, communication style, and repair skills.',
    order: 15,
  },
  
  // Lifestyle & Alignment (How You Live)
  {
    id: 'lifestyle-1',
    category: 'lifestyle-alignment',
    question: 'Describe your ideal weekday and weekend.',
    whyThisMatters: 'Prevents friction around pace, habits, and priorities.',
    order: 16,
  },
  {
    id: 'lifestyle-2',
    category: 'lifestyle-alignment',
    question: 'How do you balance work, relationships, and rest?',
    whyThisMatters: 'Prevents friction around pace, habits, and priorities.',
    order: 17,
  },
  {
    id: 'lifestyle-3',
    category: 'lifestyle-alignment',
    question: 'What routines are essential to your well-being?',
    whyThisMatters: 'Prevents friction around pace, habits, and priorities.',
    order: 18,
  },
  {
    id: 'lifestyle-4',
    category: 'lifestyle-alignment',
    question: 'How do you approach money and planning?',
    whyThisMatters: 'Prevents friction around pace, habits, and priorities.',
    order: 19,
  },
  {
    id: 'lifestyle-5',
    category: 'lifestyle-alignment',
    question: 'How do you feel about travel, change, and spontaneity?',
    whyThisMatters: 'Prevents friction around pace, habits, and priorities.',
    order: 20,
  },
  
  // Commitment Vision (What You're Building)
  {
    id: 'commitment-1',
    category: 'commitment-vision',
    question: 'What does commitment mean to you?',
    whyThisMatters: 'Clarifies expectations and relationship goals.',
    order: 21,
  },
  {
    id: 'commitment-2',
    category: 'commitment-vision',
    question: 'What does a healthy partnership require from both people?',
    whyThisMatters: 'Clarifies expectations and relationship goals.',
    order: 22,
  },
  {
    id: 'commitment-3',
    category: 'commitment-vision',
    question: 'How do you envision growing together?',
    whyThisMatters: 'Clarifies expectations and relationship goals.',
    order: 23,
  },
  {
    id: 'commitment-4',
    category: 'commitment-vision',
    question: 'What would make you proud of your relationship long-term?',
    whyThisMatters: 'Clarifies expectations and relationship goals.',
    order: 24,
  },
  {
    id: 'commitment-5',
    category: 'commitment-vision',
    question: 'What are you still working on that could affect a partnership?',
    whyThisMatters: 'Clarifies expectations and relationship goals.',
    order: 25,
  },
];

export const CATEGORY_INFO: Record<CompatibilityCategory, { title: string; subtitle: string }> = {
  'life-direction': {
    title: 'Life Direction',
    subtitle: 'Who You\'re Becoming',
  },
  'emotional-readiness': {
    title: 'Emotional Readiness',
    subtitle: 'Are You Prepared?',
  },
  'connection-communication': {
    title: 'Connection & Communication',
    subtitle: 'How You Love',
  },
  'lifestyle-alignment': {
    title: 'Lifestyle & Alignment',
    subtitle: 'How You Live',
  },
  'commitment-vision': {
    title: 'Commitment Vision',
    subtitle: 'What You\'re Building',
  },
};

