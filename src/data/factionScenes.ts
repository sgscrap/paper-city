export interface FactionEndingScene {
    npcId: string;
    endingFlag: string;
    text: string;
}

export const FACTION_ENDING_SCENES: FactionEndingScene[] = [
    // Angel endings
    { npcId: 'npc_ace', endingFlag: 'angel_ending_steward', text: 'Ace gives you a tired smile. "You made the Coalition answer in public. That is what protection is supposed to mean."' },
    { npcId: 'npc_mayor', endingFlag: 'angel_ending_steward', text: 'Mayor McPaper lowers his voice. "The record is clean because you made us keep it clean. Civic access is yours."' },
    { npcId: 'npc_ghost', endingFlag: 'angel_ending_steward', text: 'Ghost studies the public record. "You chose witnesses over leverage. I can respect that, even if I cannot use it."' },
    { npcId: 'npc_ace', endingFlag: 'angel_ending_authority', text: 'Ace stamps your file without looking up. "The institution stands. Do not confuse that with trust."' },
    { npcId: 'npc_mayor', endingFlag: 'angel_ending_authority', text: 'Mayor McPaper slides a sealed credential across the desk. "You understand how power survives. That makes you useful."' },
    { npcId: 'npc_ghost', endingFlag: 'angel_ending_authority', text: 'Ghost laughs once, without humor. "You buried the truth and called it stability. I will remember the difference."' },

    // Ghost endings
    { npcId: 'npc_ghost', endingFlag: 'ghost_ending_channel', text: 'Ghost deletes the last copy of the file. "No owner. No gatekeeper. The city gets to decide what happens next."' },
    { npcId: 'npc_lena', endingFlag: 'ghost_ending_channel', text: 'Lena opens the market terminal for you. "Shared information creates a different kind of wealth. Spend it carefully."' },
    { npcId: 'npc_ace', endingFlag: 'ghost_ending_channel', text: 'Ace watches the crowd read the leaked report. "You gave people a choice. That is harder to police than a riot."' },
    { npcId: 'npc_ghost', endingFlag: 'ghost_ending_broker', text: 'Ghost hands back your encrypted key. "You kept the leverage. Now every favor has a price, including mine."' },
    { npcId: 'npc_lena', endingFlag: 'ghost_ending_broker', text: 'Lena marks your account private. "The best market position is the one nobody else can see."' },
    { npcId: 'npc_ace', endingFlag: 'ghost_ending_broker', text: 'Ace does not take the offered file. "If you sell every truth, eventually nobody believes your protection."' },

    // Demon endings
    { npcId: 'npc_rook', endingFlag: 'demon_ending_enforcer', text: 'Rook clears the seat beside him. "Fear is efficient. Keep it sharp and never let it become noise."' },
    { npcId: 'npc_mara', endingFlag: 'demon_ending_enforcer', text: 'Mara nods at your scars. "You stopped asking permission. That is when the city started making room."' },
    { npcId: 'npc_ace', endingFlag: 'demon_ending_enforcer', text: 'Ace keeps one hand near the radio. "You got what you wanted. Now everyone knows what it cost."' },
    { npcId: 'npc_rook', endingFlag: 'demon_ending_monster', text: 'Rook studies you for a long moment. "Mercy is only power when everyone knows you could have chosen worse."' },
    { npcId: 'npc_mara', endingFlag: 'demon_ending_monster', text: 'Mara laughs under her breath. "Controlled violence. Finally, someone who understands the difference between strength and panic."' },
    { npcId: 'npc_ace', endingFlag: 'demon_ending_monster', text: 'Ace leaves a first-aid kit on the table. "I do not approve of your methods. I am glad you used them selectively."' }
];

export const getFactionEndingDialogue = (npcId: string, contentFlags: Record<string, boolean>): string | null => {
    const scene = FACTION_ENDING_SCENES.find((candidate) => candidate.npcId === npcId && contentFlags[candidate.endingFlag]);
    return scene?.text || null;
};
