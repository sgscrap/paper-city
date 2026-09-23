import { CAREERS } from '@/data/careers';
import { Stats, CareerState } from '@/types';
import { KarmaSystem } from './KarmaSystem';

export class CareerSystem {

    /**
     * Checks if a player qualifies for a specific career.
     */
    static canApply(careerId: string, stats: Stats): { allowed: boolean; reason?: string } {
        const career = CAREERS[careerId];
        if (!career) return { allowed: false, reason: 'Job does not exist.' };

        // 1. Stat Checks
        if (career.statReqs) {
            for (const [stat, req] of Object.entries(career.statReqs)) {
                if (stats[stat as keyof Stats] < (req || 0)) {
                    const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
                    return { allowed: false, reason: `Need ${req} ${statName}` };
                }
            }
        }

        // 2. Karma Checks (Soft check, maybe just warning in UI? Or hard block?)
        // GDD says "Karma Fit", implies alignment matching.
        // For MVP, we can enforce strict alignment for Tier 3, loose for Tier 1.
        if (career.tier === 3 && career.karmaAlignment) {
            const playerAlign = KarmaSystem.getAlignment(stats.karma);
            if (playerAlign !== career.karmaAlignment) {
                return { allowed: false, reason: `Requires ${career.karmaAlignment} alignment` };
            }
        }

        return { allowed: true };
    }

    /**
     * working a shift. Returns rewards and cost.
     */
    static workShift(careerId: string, stats: Stats, traits: string[] = [], currentEnergy = stats.will): {
        success: boolean;
        rewards?: { cash: number, xp?: number, stats?: Partial<Stats> };
        cost?: { will: number, time: number };
        log: string;
    } {
        const career = CAREERS[careerId];
        if (!career) return { success: false, log: 'No job found.' };

        // Cost
        const costWill = 20; // Base cost
        const costTime = 360; // 6 hours

        if (currentEnergy < costWill) {
            return { success: false, log: 'Too tired to work.' };
        }

        // Rewards
        let bonusMultiplier = 1;
        if (traits.includes('Natural Charisma') && career.statReqs?.charisma) bonusMultiplier += 0.2;
        if (traits.includes('Hacker') && career.location === 'cyber_cafe') bonusMultiplier += 0.5;

        const finalPay = Math.floor(career.dailyPay * bonusMultiplier);

        // Stat XP based on job requirements (if job needs Power, you gain Power)
        const statRewards: Partial<Stats> = {};
        if (career.statReqs) {
            Object.keys(career.statReqs).forEach(key => {
                statRewards[key as keyof Stats] = 1; // +1 to relevant stats
            });
        }

        return {
            success: true,
            cost: { will: costWill, time: costTime },
            rewards: {
                cash: finalPay,
                xp: 10, // Global XP for working
                stats: statRewards
            },
            log: `Worked as ${career.title}. Earned $${finalPay}${bonusMultiplier > 1 ? ' (Trait Bonus!)' : ''}.`
        };
    }

    /**
     * Checks for promotion.
     */
    static checkPromotion(currentCareer: CareerState, stats: Stats): string | null {
        const job = CAREERS[currentCareer.currentId];
        if (!job || !job.nextTier) return null;

        const nextJob = CAREERS[job.nextTier];
        if (!nextJob) return null;

        const { allowed } = this.canApply(nextJob.id, stats);
        if (allowed) {
            return nextJob.id;
        }
        return null;
    }
}
