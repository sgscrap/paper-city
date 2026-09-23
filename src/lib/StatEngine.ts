export class StatEngine {
    private static readonly MAX_STAT = 100;
    private static readonly SOFT_CAP = 80;

    /**
     * Calculates the new value for a stat, applying caps and diminishing returns.
     * @param currentVal Current value of the stat
     * @param amount Amount to add (can be negative)
     * @returns The new stat value
     */
    static calculateChange(currentVal: number, amount: number): number {
        let newValue = currentVal + amount;

        // Hard Cap
        if (newValue > this.MAX_STAT) newValue = this.MAX_STAT;
        if (newValue < 0) newValue = 0;

        // Diminishing returns logic could go here (e.g. if > 80, only gain 50%)
        // For MVP, we'll stick to simple addition with caps

        return newValue;
    }

    /**
     * Checks if a stat has reached its maximum potential.
     * @param statValue 
     */
    static isCapped(statValue: number): boolean {
        return statValue >= this.MAX_STAT;
    }

    /**
     * Returns the XP needed for the next "level" of a stat if we were using XP-based stats.
     * For this MVP, stats are direct values 0-100.
     */
    static getProgress(statValue: number): number {
        return (statValue / this.MAX_STAT) * 100;
    }
}
