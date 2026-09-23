import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';
import clsx from 'clsx';

interface UniversityViewProps {
    onBack: () => void;
}

const QUESTIONS = [
    {
        q: "What is the primary function of a Market Maker?",
        options: [
            "To manipulate prices for profit",
            "To provide liquidity and reduce spread",
            "To print money for the government",
            "To buy all the stocks"
        ],
        a: 1
    },
    {
        q: "What does 'Short Selling' mean?",
        options: [
            "Selling stock you own quickly",
            "Buying stock for a short time",
            "Borrowing stock to sell, hoping to buy back lower",
            "Selling only small amounts of stock"
        ],
        a: 2
    },
    {
        q: "Which index tracks the top 500 US companies?",
        options: [
            "Dow Jones",
            "Nasdaq",
            "S&P 500",
            "Russell 2000"
        ],
        a: 2
    },
    {
        q: "What is 'Fiat' currency?",
        options: [
            "Currency backed by gold",
            "Currency backed by government decree",
            "Italian car money",
            "Crypto currency"
        ],
        a: 1
    }
];

export const UniversityView = ({ onBack }: UniversityViewProps) => {
    const quests = useGameStore((state) => state.quests);
    const dispatchAction = useGameStore((state) => state.dispatchAction);
    const startQuest = useGameStore((state) => state.startQuest);
    const updateQuestObjective = useGameStore((state) => state.updateQuestObjective);
    const completeQuest = useGameStore((state) => state.completeQuest);
    const addNotification = useUIStore((state) => state.addNotification);

    const [view, setView] = useState<'menu' | 'exam_intro' | 'exam' | 'success'>('menu');
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);

    const hasLicense = quests['stock_license']?.status === 'completed';

    const handleStartExam = () => {
        if (!quests['stock_license']) {
            startQuest('stock_license');
        }

        updateQuestObjective('stock_license', 'visit_university', true);
        setView('exam');
        setCurrentQ(0);
        setScore(0);
    };

    const handleAnswer = (index: number) => {
        if (index === QUESTIONS[currentQ].a) {
            setScore((value) => value + 1);
        }

        if (currentQ < QUESTIONS.length - 1) {
            setCurrentQ((value) => value + 1);
            return;
        }

        const finalScore = score + (index === QUESTIONS[currentQ].a ? 1 : 0);
        if (finalScore === QUESTIONS.length) {
            completeQuest('stock_license');
            addNotification("Series 7 Exam Passed! You are now a licensed broker.");
            setView('success');
            return;
        }

        addNotification(`You scored ${finalScore}/${QUESTIONS.length}. You need 100% to pass.`);
        setView('menu');
    };

    const handleStudySession = () => {
        dispatchAction('TRAIN_INT');
        addNotification('You spent time in the study hall sharpening your edge.');
    };

    return (
        <div className="flex flex-col h-full bg-[#0f172a] text-slate-100 p-8 font-serif relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <div className="w-[600px] h-[600px] border-[20px] border-slate-700 rounded-full flex items-center justify-center">
                    <div className="text-9xl font-black text-slate-700">MU</div>
                </div>
            </div>

            <header className="relative z-10 flex justify-between items-end border-b-4 border-slate-700 pb-6 mb-8">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter text-amber-500 mb-2 drop-shadow-lg">MORGAN UNIVERSITY</h1>
                    <p className="text-slate-400 text-lg italic">&quot;Knowledge is Leverage&quot;</p>
                </div>
                <button
                    onClick={onBack}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-sans font-bold transition-colors"
                >
                    LEAVE CAMPUS
                </button>
            </header>

            <main className="relative z-10 flex-1 flex items-center justify-center">
                {view === 'menu' && (
                    <div className="grid grid-cols-2 gap-8 max-w-4xl w-full">
                        <div className="bg-slate-800/80 p-8 rounded-xl border border-slate-700 shadow-2xl backdrop-blur">
                            <h2 className="text-2xl font-bold text-amber-400 mb-4 border-b border-slate-700 pb-2">Academic Programs</h2>
                            <ul className="space-y-4">
                                <li>
                                    <button
                                        onClick={() => setView('exam_intro')}
                                        disabled={hasLicense}
                                        className={clsx(
                                            "w-full text-left p-4 rounded bg-slate-700/50 border border-slate-600 transition-all",
                                            hasLicense ? "opacity-50 cursor-default" : "hover:bg-amber-900/20 hover:border-amber-500/50 hover:translate-x-2"
                                        )}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-lg text-slate-200">Series 7 License Exam</span>
                                            {hasLicense && <span className="text-green-400 font-bold text-xs uppercase px-2 py-1 bg-green-400/10 rounded">Completed</span>}
                                        </div>
                                        <p className="text-sm text-slate-400">Prerequisite for Stock Market access.</p>
                                    </button>
                                </li>
                                <li>
                                    <button disabled className="w-full text-left p-4 rounded bg-slate-700/20 border border-dashed border-slate-700 opacity-50 cursor-not-allowed">
                                        <div className="font-bold text-lg text-slate-500">Advanced Economics</div>
                                        <p className="text-sm text-slate-600">Coming Spring Semester (Phase 4)</p>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col justify-center space-y-6">
                            <div className="bg-slate-800/70 p-8 rounded-xl border border-slate-700 shadow-2xl backdrop-blur text-center">
                                <div className="text-7xl font-black text-slate-300 mb-4 tracking-[0.2em]">MU</div>
                                <p className="text-slate-400 text-lg leading-relaxed">
                                    Welcome to the hallowed halls of Morgan University. Here we forge the titans of industry.
                                </p>
                            </div>

                            <button
                                onClick={handleStudySession}
                                className="w-full text-left p-6 rounded-xl bg-slate-800/80 border border-cyan-400/20 hover:border-cyan-400/60 hover:bg-cyan-500/5 transition-all shadow-2xl"
                            >
                                <div className="flex items-center justify-between gap-4 mb-2">
                                    <span className="font-bold text-lg text-cyan-300">Independent Study Session</span>
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/70">+INT</span>
                                </div>
                                <p className="text-sm text-slate-400">
                                    Hit the books, spend some time, and build the intelligence needed for the city&apos;s higher tiers.
                                </p>
                            </button>
                        </div>
                    </div>
                )}

                {view === 'exam_intro' && (
                    <div className="max-w-2xl w-full bg-slate-800 p-10 rounded-xl border-2 border-amber-500/30 shadow-2xl text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">Series 7 Examination</h2>
                        <div className="text-left space-y-4 bg-black/20 p-6 rounded-lg mb-8 font-sans text-slate-300">
                            <p><strong>Time Limit:</strong> Untimed</p>
                            <p><strong>Questions:</strong> {QUESTIONS.length}</p>
                            <p><strong>Passing Score:</strong> 100%</p>
                            <p><strong>Subject:</strong> Financial Markets & Regulations</p>
                        </div>
                        <div className="flex gap-4 justify-center font-sans">
                            <button
                                onClick={() => setView('menu')}
                                className="px-8 py-3 rounded-lg bg-transparent border border-slate-600 hover:bg-slate-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStartExam}
                                className="px-8 py-3 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-500 shadow-lg shadow-amber-900/50 transition transform hover:scale-105"
                            >
                                Begin Exam
                            </button>
                        </div>
                    </div>
                )}

                {view === 'exam' && (
                    <div className="max-w-3xl w-full">
                        <div className="flex justify-between text-amber-500 font-bold mb-4 uppercase tracking-widest text-sm">
                            <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
                            <span>Series 7</span>
                        </div>
                        <div className="bg-slate-800 p-10 rounded-2xl border border-slate-600 shadow-2xl">
                            <h3 className="text-2xl font-medium text-white mb-8 leading-relaxed">
                                {QUESTIONS[currentQ].q}
                            </h3>
                            <div className="grid gap-4 font-sans">
                                {QUESTIONS[currentQ].options.map((option, index) => (
                                    <button
                                        key={option}
                                        onClick={() => handleAnswer(index)}
                                        className="p-4 text-left bg-slate-700/50 hover:bg-amber-500 hover:text-white rounded-lg transition-all border border-transparent hover:border-amber-400 group"
                                    >
                                        <span className="inline-block w-8 font-bold text-slate-500 group-hover:text-amber-200">
                                            {String.fromCharCode(65 + index)}.
                                        </span>
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mt-8 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={clsx(
                                    "h-full bg-amber-500 transition-all duration-300",
                                    {
                                        'w-0': currentQ === 0,
                                        'w-1/4': currentQ === 1,
                                        'w-1/2': currentQ === 2,
                                        'w-3/4': currentQ === 3
                                    }
                                )}
                            />
                        </div>
                    </div>
                )}

                {view === 'success' && (
                    <div className="text-center animate-in zoom-in duration-500">
                        <div className="text-8xl mb-6 drop-shadow-[0_0_30px_rgba(255,191,0,0.5)]">LICENSE</div>
                        <h2 className="text-4xl font-bold text-amber-400 mb-4">Congratulations!</h2>
                        <p className="text-xl text-slate-300 mb-8 max-w-md mx-auto">
                            You have successfully passed the Series 7 Exam. You are now authorized to trade on the Stock Exchange.
                        </p>
                        <button
                            onClick={onBack}
                            className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-xl transition-all transform hover:scale-105"
                        >
                            Return to City
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};
