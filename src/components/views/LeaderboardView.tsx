import { useMemo } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { RIVAL_DATA, LeaderboardEntry } from '@/data/leaderboard';
import clsx from 'clsx';

interface LeaderboardViewProps {
    onBack: () => void;
}

export const LeaderboardView = ({ onBack }: LeaderboardViewProps) => {
    const gameStore = useGameStore();
    const career = gameStore.career;
    const combat = gameStore.combatRecord;
    const playTime = gameStore.playTime; // ms
    const getNetWorth = gameStore.getNetWorth;

    // Convert playTime ms to minutes for comparison
    const playerTimeMins = Math.floor(playTime / 60000);

    const sortedData = useMemo(() => {
        const netWorth = getNetWorth();
        const playerEntry: LeaderboardEntry = {
            id: 'player_local',
            name: 'PLAYER (YOU)',
            worth: netWorth,
            combatWins: combat.wins,
            xp: career.xp,
            timePlayed: playerTimeMins,
            isPlayer: true,
            title: combat.rankTitle || 'Novice'
        };

        return [...RIVAL_DATA, playerEntry].sort((a, b) => b.worth - a.worth);
    }, [getNetWorth, combat.wins, career.xp, playerTimeMins, combat.rankTitle]);

    const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-white p-6 overflow-hidden">
            <header className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-4">
                    <div className="text-4xl animate-pulse">🏆</div>
                    <div>
                        <h1 className="text-3xl font-bold font-mono text-neon-gold tracking-tighter">CITY_RANKINGS</h1>
                        <p className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase">Paper City Elite Statistics</p>
                    </div>
                </div>
                <button onClick={onBack} className="border border-zinc-700 px-6 py-2 rounded-full hover:bg-zinc-800 text-xs font-bold transition-all hover:scale-105 active:scale-95">
                    RETURN_TO_STREETS
                </button>
            </header>

            <div className="flex-1 overflow-auto rounded-lg border border-zinc-900 bg-zinc-900/20 backdrop-blur-xl">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-zinc-900 z-10">
                        <tr className="text-[10px] text-zinc-500 uppercase font-mono border-b border-zinc-800">
                            <th className="p-4 w-16">Rank</th>
                            <th className="p-4">Entity</th>
                            <th className="p-4">Title</th>
                            <th className="p-4 text-right">Net Worth</th>
                            <th className="p-4 text-center">Wins</th>
                            <th className="p-4 text-center">XP</th>
                            <th className="p-4 text-right">Active Time</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-sm leading-none">
                        {sortedData.map((entry, index) => {
                            const rank = index + 1;

                            return (
                                <tr
                                    key={entry.id}
                                    className={clsx(
                                        "border-b border-zinc-900/50 hover:bg-zinc-800/30 transition-colors group",
                                        entry.isPlayer && "bg-neon-blue/10 border-neon-blue/30 relative z-0"
                                    )}
                                >
                                    <td className="p-4">
                                        <div className={clsx(
                                            "w-8 h-8 rounded-full flex items-center justify-center font-bold italic",
                                            rank === 1 ? "bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]" :
                                                rank === 2 ? "bg-zinc-300 text-black" :
                                                    rank === 3 ? "bg-orange-500 text-black" :
                                                        "text-zinc-600"
                                        )}>
                                            {rank}
                                        </div>
                                        {entry.isPlayer && (
                                            <div className="absolute inset-0 border border-neon-blue/20 pointer-events-none -z-10 bg-gradient-to-r from-neon-blue/5 to-transparent"></div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className={clsx(
                                            "font-bold tracking-tight",
                                            entry.isPlayer ? "text-neon-blue underline decoration-neon-blue/50 offset-2" : "group-hover:text-white text-zinc-300"
                                        )}>
                                            {entry.name}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-zinc-500 uppercase">
                                            {entry.title}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-green-500">
                                        ${entry.worth.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                    </td>
                                    <td className="p-4 text-center text-zinc-400">
                                        {entry.combatWins}
                                    </td>
                                    <td className="p-4 text-center text-neon-blue">
                                        {entry.xp.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right text-zinc-500 text-xs">
                                        {formatTime(entry.timePlayed)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <footer className="mt-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                    Live global leaderboards arriving soon to the <span className="text-neon-gold italic">Coalition Network</span>. Stay active. Stay dangerous.
                </p>
            </footer>
        </div>
    );
};
