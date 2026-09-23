import { } from './education';

export interface QuizQuestion {
    id: string;
    courseId: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    difficulty: 'easy' | 'medium' | 'hard';
}

export const QUIZ_DATA: QuizQuestion[] = [
    // GED Preparation
    {
        id: 'ged_1',
        courseId: 'ged',
        question: 'Solve for x: 2x + 5 = 15',
        options: ['x = 10', 'x = 5', 'x = 2', 'x = 7.5'],
        correctAnswerIndex: 1,
        difficulty: 'easy'
    },
    {
        id: 'ged_2',
        courseId: 'ged',
        question: 'Which of the following is a noun?',
        options: ['Run', 'Quickly', 'Paper', 'Blue'],
        correctAnswerIndex: 2,
        difficulty: 'easy'
    },
    {
        id: 'ged_3',
        courseId: 'ged',
        question: 'What is the capital of the United States?',
        options: ['New York City', 'Los Angeles', 'Washington D.C.', 'Chicago'],
        correctAnswerIndex: 2,
        difficulty: 'easy'
    },

    // Public Speaking 101
    {
        id: 'comm_1',
        courseId: 'comm_101',
        question: 'What is the most effective way to start a speech?',
        options: ['Apologize for being nervous', 'Read from your notes immediately', 'A hook (story, quote, or statistic)', 'Wait for silence for 60 seconds'],
        correctAnswerIndex: 2,
        difficulty: 'easy'
    },
    {
        id: 'comm_2',
        courseId: 'comm_101',
        question: 'In public speaking, what does "body language" refer to?',
        options: ['The language of the body', 'Non-verbal cues like gestures and posture', 'The fitness of the speaker', 'How loud you speak'],
        correctAnswerIndex: 1,
        difficulty: 'medium'
    },

    // Intro to Economics
    {
        id: 'econ_1',
        courseId: 'econ_101',
        question: 'What is the "Law of Supply and Demand"?',
        options: [
            'Prices adhere to government regulation only',
            'Price is determined by the interaction of potential supply and potential demand',
            'Supply always exceeds demand',
            'Demand is irrelevant to price'
        ],
        correctAnswerIndex: 1,
        difficulty: 'medium'
    },
    {
        id: 'econ_2',
        courseId: 'econ_101',
        question: 'What is "Inflation"?',
        options: [
            'A decrease in the general price level',
            'An increase in the general price level of goods and services',
            'When stock prices go up',
            'Printing less money'
        ],
        correctAnswerIndex: 1,
        difficulty: 'medium'
    },

    // Mini-MBA
    {
        id: 'mba_1',
        courseId: 'mba',
        question: 'What does ROI stand for?',
        options: ['Return On Investment', 'Rate Of Inflation', 'Risk Of Income', 'Real Outline Indicator'],
        correctAnswerIndex: 0,
        difficulty: 'easy'
    },
    {
        id: 'mba_2',
        courseId: 'mba',
        question: 'Which of these is a liability on a balance sheet?',
        options: ['Cash', 'Inventory', 'Accounts Payable', 'Accounts Receivable'],
        correctAnswerIndex: 2,
        difficulty: 'hard'
    },
    {
        id: 'mba_3',
        courseId: 'mba',
        question: 'What is a "USP"?',
        options: ['Universal Sales Price', 'Unique Selling Proposition', 'Under Sold Product', 'User Service Protocol'],
        correctAnswerIndex: 1,
        difficulty: 'medium'
    }
];

// Helper to get random question for a course
export const getRandomQuestion = (courseId: string): QuizQuestion | null => {
    const questions = QUIZ_DATA.filter(q => q.courseId === courseId);
    if (questions.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
};
