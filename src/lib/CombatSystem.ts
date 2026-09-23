import { CombatState, Enemy, CombatActionType, CombatLog } from '@/types/combat';
import { Stats } from '@/types';
import { ITEMS } from '@/data/items';


export class CombatSystem {

    static initialize({ health, maxHealth }: { stats: Stats, health: number, maxHealth: number }, enemy: Enemy): CombatState {
        return {
            isActive: true,
            turn: 1,
            playerHp: health,
            playerMaxHp: maxHealth,
            enemy: { ...enemy }, // Clone to avoid mutating static data
            enemyHp: enemy.hp,
            logs: [{ id: Date.now().toString(), text: `Encountered ${enemy.name}!`, type: 'info' }],
            isOver: false
        };
    }

    static playerTurn(
        state: CombatState,
        action: CombatActionType,
        player: { stats: Stats },
        equippedWeaponId: string | null
    ): CombatState {
        if (state.isOver) return state;

        const newState = { ...state };
        const logs: CombatLog[] = [];
        const weaponItem = equippedWeaponId ? ITEMS[equippedWeaponId] : ITEMS['fists'];
        // Default Stats (Fists) if missing
        const weaponStats = weaponItem?.weaponStats || { damage: 5, accuracy: 90, critChance: 10 };

        // --- PLAYER ACTION ---
        let playerDmg = 0;
        let escaped = false;
        const enemyDefense = state.enemy?.power ? Math.floor(state.enemy.power / 4) : 0; // Temporary enemy defense logic if missing

        switch (action) {
            case 'attack':
                // 1. Calculate Hit Chance
                // Base Acc + (Luck / 4)
                const hitChance = weaponStats.accuracy + (player.stats.luck / 4);
                if (Math.random() * 100 > hitChance) {
                    logs.push({
                        id: Date.now() + '-p',
                        text: `You missed!`,
                        type: 'info'
                    });
                } else {
                    // 2. Calculate Crit
                    const critRoll = Math.random() * 100;
                    const isCrit = critRoll < (weaponStats.critChance + (player.stats.luck / 2));

                    // 3. Calculate Damage
                    // Dmg = (Weap * (1 + Power/50))
                    const powerMult = 1 + (player.stats.power / 50);
                    let rawDmg = weaponStats.damage * powerMult;

                    if (isCrit) rawDmg *= 2;

                    // Random Variance (+/- 10%)
                    rawDmg *= 0.9 + (Math.random() * 0.2);

                    // Apply Defense
                    const finalDmg = Math.max(1, rawDmg - enemyDefense);

                    playerDmg = Math.floor(finalDmg);

                    newState.enemyHp = Math.max(0, newState.enemyHp - playerDmg);
                    logs.push({
                        id: Date.now() + '-p',
                        text: isCrit ? `CRITICAL HIT! Dealt ${playerDmg} dmg!` : `You hit ${state.enemy!.name} for ${playerDmg} dmg.`,
                        type: isCrit ? 'win' : 'player'
                    });
                }
                break;

            case 'defend':
                logs.push({
                    id: Date.now() + '-p',
                    text: `You take a defensive stance.`,
                    type: 'player'
                });
                break; // Handled in enemy turn (dmg reduction)

            case 'item':
                logs.push({
                    id: Date.now() + '-p',
                    text: `You panic and fumble for an item (Not implemented yet!)`,
                    type: 'info'
                });
                break;

            case 'flee':
                const runChance = 0.4 + (player.stats.luck / 200); // 40% base + luck bonus
                if (Math.random() < runChance) {
                    escaped = true;
                    newState.isActive = false;
                    newState.isOver = true;
                    newState.result = 'flee';
                    logs.push({
                        id: Date.now() + '-p',
                        text: `You ran away!`,
                        type: 'system'
                    });
                    newState.logs = [...newState.logs, ...logs];
                    return newState;
                } else {
                    logs.push({
                        id: Date.now() + '-p',
                        text: `Failed to escape!`,
                        type: 'info'
                    });
                }
                break;
        }

        // --- CHECK WIN ---
        if (newState.enemyHp <= 0) {
            newState.isActive = false;
            newState.isOver = true;
            newState.result = 'win';
            logs.push({
                id: Date.now() + '-w',
                text: `${state.enemy!.name} collapsed!`,
                type: 'win'
            });
            newState.logs = [...newState.logs, ...logs];
            return newState;
        }

        // --- ENEMY TURN ---
        let enemyDmg = 0;
        if (!escaped && !newState.isOver) {
            // Enemy Attack
            const enemyPower = state.enemy!.power;
            const enemyRoll = Math.floor(Math.random() * 3) + 1;
            let rawDmg = enemyPower + enemyRoll;

            if (action === 'defend') {
                rawDmg = Math.floor(rawDmg / 2);
            }

            enemyDmg = rawDmg;
            newState.playerHp = Math.max(0, newState.playerHp - enemyDmg);
            logs.push({
                id: Date.now() + '-e',
                text: `${state.enemy!.name} hits you for ${enemyDmg} dmg!`,
                type: 'enemy'
            });

            // Random Taunt
            if (Math.random() > 0.8 && state.enemy!.taunts?.length > 0) {
                const taunt = state.enemy!.taunts[Math.floor(Math.random() * state.enemy!.taunts.length)];
                logs.push({ id: Date.now() + '-t', text: `"${taunt}"`, type: 'info' });
            }
        }

        // --- CHECK LOSS ---
        if (newState.playerHp <= 0) {
            newState.isActive = false;
            newState.isOver = true;
            newState.result = 'loss';
            logs.push({
                id: Date.now() + '-l',
                text: `You were knocked out...`,
                type: 'loss'
            });
        }

        newState.turn += 1;
        newState.logs = [...newState.logs, ...logs];
        return newState;
    }
}
