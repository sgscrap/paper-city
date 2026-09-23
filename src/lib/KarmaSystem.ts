export class KarmaSystem {
    private static readonly MAX_KARMA = 100;
    private static readonly MIN_KARMA = -100;

    /**
     * Updates karma value, keeping it within bounds (-100 to +100).
     */
    static update(currentKarma: number, change: number): number {
        let newKarma = currentKarma + change;
        if (newKarma > this.MAX_KARMA) newKarma = this.MAX_KARMA;
        if (newKarma < this.MIN_KARMA) newKarma = this.MIN_KARMA;
        return newKarma;
    }

    /**
     * Determines alignment based on karma value.
     * Angel: +51 to +100
     * Ghost: -50 to +50
     * Demon: -100 to -51
     */
    static getAlignment(karma: number): 'angel' | 'ghost' | 'demon' {
        if (karma > 50) return 'angel';
        if (karma < -50) return 'demon';
        return 'ghost';
    }

    /**
     * Returns a color code hex for the karma alignment (for UI).
     */
    static getColor(karma: number): string {
        const alignment = this.getAlignment(karma);
        switch (alignment) {
            case 'angel': return '#00f0ff'; // Neon Blue/Cyan
            case 'demon': return '#ff0055'; // Neon Red/Pink
            default: return '#e0e0e0';      // White/Grey
        }
    }
    /**
     * Updates relationship value, keeping it within bounds (-100 to +100).
     */
    static updateRelationship(current: number, action: 'chat' | 'gift' | 'insult'): number {
        let change = 0;
        if (action === 'chat') change = 2;
        if (action === 'gift') change = 10;
        if (action === 'insult') change = -15;

        let res = current + change;
        if (res > 100) res = 100;
        if (res < -100) res = -100;
        return res;
    }
}
