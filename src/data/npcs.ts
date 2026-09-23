import { NPC } from '@/types';

export const NPCS: Record<string, NPC> = {
    // --- THE BLOCK ---
    npc_ace: {
        id: 'npc_ace',
        name: 'Ace',
        location: 'the_block',
        faction: 'angel',
        baseDialogue: [
            "You're new. I can tell. Everyone starts broke here - what matters is what you build.",
            "Work. Train. Hustle. Study. Do something long enough and the city notices."
        ],
        daypartDialogue: {
            morning: [
                "Morning. The Block wakes up fast. Best time to get moving before the city takes its cut.",
                "Coffee's cheap, the sidewalks are quiet, and every bad decision from last night is still fixable. Use the morning."
            ],
            afternoon: [
                "Coalition business downtown ate my whole day. Say it quick if you've got something.",
                "You caught me between meetings. Make it about work, not weather."
            ],
            evening: [
                "Evening shift. The Block settles down, and I can actually hear what people are saying.",
                "Days like this remind me why the Coalition exists. Somebody has to hold the line."
            ],
            night: [
                "Late night. Watch yourself - the Block after dark is a different contract entirely.",
                "Whatever you're planning tonight, plan an exit first."
            ]
        },
        questId: 'trust_yourself_intro',
        service: 'contracts',
        serviceFaction: 'angel',
        specialService: 'Civic endorsement',
        specialServiceFlags: ['angel_ending_steward', 'angel_ending_authority']
    },
    npc_tommy: {
        id: 'npc_tommy',
        name: 'Tommy \"Two-Times\"',
        location: 'the_block',
        alignment: 'opportunistic',
        socialEffects: { chat: { karma: -1, luck: -1, relationship: 2 }, gift: { relationship: 8, trust: 2 }, insult: { karma: -2, fear: 4, relationship: -12 } },
        baseDialogue: [
            "Hey buddy, buddy! You new here? You look new here.",
            "I heard the Coalition is cracking down. Bad business, bad business.",
            "You need anything? I know a guy who knows a guy."
        ],
        daypartDialogue: {
            morning: [
                "Ah, morning! Fresh start, fresh start! Nobody's mad at me yet today!",
                "Early worm, early worm! The deals are asleep but I am NOT!"
            ],
            afternoon: [
                "Busy day, busy day! Everybody wants something and I know where it is!",
                "You look like you need two of something. I got two of everything!"
            ],
            evening: [
                "Evening plans? I know a guy downtown, a guy uptown, even a guy under-town!",
                "The night crowd pays double for dumb stuff. Don't be the dumb stuff, okay?"
            ],
            night: [
                "Shhh. Down here after dark, the guys I know don't like names.",
                "Night time Tommy knows different guys than day time Tommy. Better guys. Worse guys."
            ]
        },
    },
    npc_old_man_jenkins: {
        id: 'npc_old_man_jenkins',
        name: 'Old Man Jenkins',
        alignment: 'good',
        socialEffects: { chat: { karma: 1, luck: 1, itemId: 'donut', relationship: 2 }, gift: { karma: 1, relationship: 8 }, insult: { karma: -3, relationship: -15 } },
        location: 'the_block',
        baseDialogue: [
            "Back in my day, this was all paper fields!",
            "Get off my sidewalk!",
            "Have you seen my cat? It's 2D and very flat."
        ],
        daypartDialogue: {
            morning: [
                "Up with the sun, just like 1943! The birds don't respect paper either.",
                "Mornings are honest hours. Not like now. Not like paper money.",
            ],
            afternoon: [
                "You kids and your nap schedules! In my day we napped in DITCHES!",
                "Cat's still flat. Checked at noon. Still flat.",
            ],
            evening: [
                "Suppertime! Nobody visits an old man at suppertime. Typical!",
                "Evening's when the sidewalk gets MY name on it again.",
            ],
            night: [
                "Get off my sidewalk! It's late! The sidewalk has BEDTIMES!",
                "My cat doesn't come home after dark. Neither should you."
            ]
        },
    },
    npc_ghost: {
        id: 'npc_ghost',
        name: 'Ghost',
        alignment: 'neutral',
        location: 'the_block',
        faction: 'ghost',
        baseDialogue: [
            "The city remembers everything you do.",
            "Angel. Ghost. Demon. You'll pick one... even if you don't mean to."
        ],
        daypartDialogue: {
            morning: [
                "Morning is when the city lies best. Fresh slate, they say. There are no fresh slates.",
                "People think dawn hides them. Dawn is a witness too.",
            ],
            afternoon: [
                "Midday traffic is the best cover in this city. Everyone's too busy to watch.",
                "The markets open soon. Information gets heavier by the hour.",
            ],
            evening: [
                "Evening downtown. Every window is a ledger, every lobby a rumor.",
                "What you did today is already priced in. What you do tonight isn't.",
            ],
            night: [
                "The night city talks. You just have to stand still long enough to hear it.",
                "Some secrets only circulate after midnight. Come find me below."
            ]
        },
        service: 'intel',
        serviceFaction: 'ghost'
    },

    // --- SPECIAL LOCATIONS ---
    npc_mara: {
        id: 'npc_mara',
        name: 'Mara',
        location: 'gym',
        faction: 'demon',
        baseDialogue: [
            "You look soft. No offense - everyone does at first.",
            "Train your body, or someone else will train it for you."
        ],
        daypartDialogue: {
            morning: [
                "Morning session. The iron doesn't care what time it is, but excuses do.",
                "You're up early. Good. Soft people sleep in.",
            ],
            afternoon: [
                "Midday crowd's gone soft. Don't be the midday crowd.",
                "Train now and the evening owns itself.",
            ],
            evening: [
                "Evening lifting. Best energy in the gym and the worst excuses.",
                "Rook's boys drift through around now. Stay sharp.",
            ],
            night: [
                "Underground after dark. The fights down there don't have referees.",
                "Night training separates athletes from tourists."
            ]
        },
    },
    npc_lena: {
        id: 'npc_lena',
        name: 'Lena',
        location: 'university',
        faction: 'ghost',
        baseDialogue: [
            "Money doesn't sleep. But it does punish people who guess.",
            "If you want access to real markets, earn it."
        ],
        daypartDialogue: {
            morning: [
                "Morning lectures, morning losses. Students guess; markets don't.",
                "Campus mornings are for theory. The floor opens later.",
            ],
            afternoon: [
                "Office hours. Ask me something worth my time or don't ask.",
                "Afternoon volatility is a teacher. Most students skip class.",
            ],
            evening: [
                "Floor hours now. Watch the tape, don't worship it.",
                "Evening markets reward patience and punish stories.",
            ],
            night: [
                "Markets closed. My business isn't. What do you actually want?",
                "The floor sleeps. I don't recommend you try out-waiting it."
            ]
        },
        questId: 'stock_license',
        service: 'market',
        serviceFaction: 'ghost',
        specialService: 'Broker rates',
        specialServiceFlags: ['ghost_ending_channel', 'ghost_ending_broker']
    },
    npc_foreman_dex: {
        id: 'npc_foreman_dex',
        name: 'Foreman Dex',
        location: 'job_board',
        baseDialogue: [
            "Show up on time, lift what I point at, and you get paid.",
            "If you want steady work, prove you can finish a shift without folding."
        ],
        daypartDialogue: {
            morning: [
                "Morning crew's the reliable crew. Show up, sign in, lift.",
                "Daylight's for working. You standing here proves nothing."
            ],
            afternoon: [
                "Half the day's gone and the load's still stacked. Moving or talking?",
                "Afternoon shift's where the soft ones quit."
            ],
            evening: [
                "Quitting time for quitters. Last haul of the day needs two backs.",
                "Evening pay's the same. Evening excuses pay worse."
            ],
            night: [
                "Site's closed. Whatever you're hauling at this hour, that's on you.",
                "Night work pays double and costs sleep. Choose which you're rich in."
            ]
        },
        jobId: 'manual_laborer',
        service: 'contracts'
    },
    npc_ticker_tess: {
        id: 'npc_ticker_tess',
        name: 'Ticker Tess',
        location: 'trading_floor',
        baseDialogue: [
            "Noise is free. Edge is expensive. Learn the difference.",
            "Crypto moves fast. Stocks move slower. Both punish hesitation."
        ],
        daypartDialogue: {
            morning: [
                "Opening bell mindset: overnight moves are already priced. Trade what's real.",
                "Morning edge goes to whoever read the tape before coffee.",
            ],
            afternoon: [
                "Midday chop. Amateurs trade it, professionals wait through it.",
                "Position sizes shrink at midday. Patience doesn't.",
            ],
            evening: [
                "Floor's closed. I run my book at the tables now. The odds are worse; the info is better.",
                "Evening Tess sees more action than daytime Tess. Don't tell my broker.",
            ],
            night: [
                "The casino's my second market. House edge by day, table edge by night.",
                "Late-night chips, late-night charts. Same discipline or same ruin."
            ]
        },
        service: 'market',
        serviceFaction: 'ghost',
        specialService: 'Broker rates',
        specialServiceFlags: ['ghost_ending_channel', 'ghost_ending_broker']
    },
    npc_croupier_ivy: {
        id: 'npc_croupier_ivy',
        name: 'Croupier Ivy',
        location: 'casino',
        baseDialogue: [
            "The house does not hate you. It just outlasts you.",
            "Big winners leave early. Legends are usually just people on a heater."
        ],
        daypartDialogue: {
            morning: [
                "Tables open at noon. The floor's quiet enough to hear the money think.",
                "Morning prep: counting decks, stacking chips, judging tomorrow's losers."
            ],
            afternoon: [
                "First shift. The optimistic money shows up now.",
                "Afternoon players still believe in systems. Charming."
            ],
            evening: [
                "Prime hours. The floor hums and the house hums with it.",
                "Evening is when heaters start. Yours will end. Mine never does.",
            ],
            night: [
                "Late floor. The tired money is the easiest money.",
                "Last call for legends. Most of them leave in a cab, not a limo."
            ]
        },
    },
    npc_club_host_aria: {
        id: 'npc_club_host_aria',
        name: 'Aria Vale',
        location: 'club',
        faction: 'angel',
        alignment: 'good',
        baseDialogue: [
            "A crowded room is still a community if somebody chooses to protect it.",
            "Keep your eyes open tonight. The city is listening."
        ],
        daypartDialogue: {
            morning: [
                "Daytime is prep time. Guest lists, sound checks, and favors to call in.",
                "Morning errands downtown before the club wakes up. Busy day ahead."
            ],
            afternoon: [
                "Tonight's crowd is already forming. I can tell from the afternoon whispers.",
                "Doors open at nine. What happens before nine shapes the whole night."
            ],
            evening: [
                "The room's filling up. Watch the corners, not the stage.",
                "A good host keeps everyone safe without anyone noticing. That's the job."
            ],
            night: [
                "Peak hours. Kane's watching the door, Echo's watching the room, I'm watching everyone.",
                "Late crowd's looser and kinder. Or louder and dumber. Depends on the DJ."
            ]
        },
        socialEffects: { chat: { karma: 1, relationship: 2, trust: 1 }, insult: { karma: -2, relationship: -8 } }
    },
    npc_club_dj_echo: {
        id: 'npc_club_dj_echo',
        name: 'DJ Echo',
        location: 'club',
        faction: 'ghost',
        alignment: 'neutral',
        baseDialogue: [
            "Every beat carries a message if you know how to hear it.",
            "The best information arrives between songs."
        ],
        daypartDialogue: {
            morning: [
                "Morning. The booth's asleep, but the crate never is. Ever dig through vinyl at 7 AM?",
                "Clubs run on night math. Mornings are for caffeine and rewiring the floor plan in my head."
            ],
            afternoon: [
                "Sound check. A room tells you its secrets when it's empty.",
                "Daytime Echo is a technician. Nighttime Echo is an archive."
            ],
            evening: [
                "Doors soon. The first hour of a set sets the whole room's temperature.",
                "Requests tell you what a crowd wants to forget. That's data too."
            ],
            night: [
                "Peak set. The floor moves as one body and I'm the spine.",
                "Between-song silence is where the real requests happen. Listen."
            ]
        },
        socialEffects: { chat: { luck: 1, relationship: 2, trust: 1 }, insult: { luck: -1, relationship: -8 } }
    },
    npc_club_bouncer_kane: {
        id: 'npc_club_bouncer_kane',
        name: 'Kane',
        location: 'club',
        faction: 'demon',
        alignment: 'dangerous',
        baseDialogue: [
            "Respect the room and nobody has to learn your name the hard way.",
            "Back room work pays better when you can keep your nerve."
        ],
        daypartDialogue: {
            morning: [
                "Morning. Doors don't open till nine, but trouble clocks in early.",
                "Walked the block twice already. Mornings show you who's new in town."
            ],
            afternoon: [
                "Doors at nine. Day shift's for checking sightlines and exit routes.",
                "Afternoon is when the amateurs case the joint. I watch them do it."
            ],
            evening: [
                "Door's open. I'm the second thing everyone sees. Nobody forgets the second thing.",
                "Line's forming. Problems form with it. That's fine. Problems are my job."
            ],
            night: [
                "Peak hours. The room's loud, but nothing gets past the door.",
                "Back room's busy on nights like this. Keep your nerve and your mouth shut."
            ]
        },
        socialEffects: { chat: { fear: 1, relationship: 2, loyalty: 1 }, insult: { karma: -2, fear: 6, relationship: -10 } }
    },

    npc_keeper_nox: {
        id: 'npc_keeper_nox',
        name: 'Keeper Nox',
        location: 'safehouse',
        baseDialogue: [
            "If you stash it here, keep your mouth shut and your eyes open.",
            "Rest up. The city gets louder every day you survive it."
        ],
        daypartDialogue: {
            morning: [
                "Morning. Anything you moved last night, nobody saw. Keep it that way.",
                "Sunlight through the vents. Only honest light left in the city."
            ],
            afternoon: [
                "Quiet hours. Perfect for inventory you don't want catalogued.",
                "Nobody visits midday. Nobody reliable, anyway."
            ],
            evening: [
                "Evening rush below. The markets get greedy after dark.",
                "Doors lock at dusk. After that, knock like you belong."
            ],
            night: [
                "Night watch. The safehouse sleeps lighter than you think.",
                "Late deliveries come down around now. Don't ask what's in them."
            ]
        },
        service: 'safehouse',
        serviceFaction: 'demon',
        specialService: 'Underworld protection',
        specialServiceFlags: ['demon_ending_enforcer', 'demon_ending_monster']
    },
    npc_rook: {
        id: 'npc_rook',
        name: 'Rook',
        alignment: 'dangerous',
        socialEffects: { chat: { karma: -1, fear: 2, relationship: 2 }, gift: { karma: -1, relationship: 8, loyalty: 2 }, insult: { karma: -3, fear: 8, relationship: -15 } },
        location: 'bar',
        faction: 'demon',
        baseDialogue: [
            "You'll hear a lot of rules. None of them matter if you can't handle yourself.",
            "Fight fair. Fight dirty. Or don't fight at all. Just know the city keeps score."
        ],
        daypartDialogue: {
            morning: [
                "Morning on the Block. Debts don't collect themselves, but they wait patient.",
                "Early lessons are cheap lessons. Watch who runs this corner before you talk to them."
            ],
            afternoon: [
                "Afternoon collections. Some people only learn arithmetic when it hurts.",
                "Business hours. Mine, not theirs."
            ],
            evening: [
                "Down in the markets after dark. Better class of vulture down there.",
                "The underground pays respect on time. Surface world could learn from it."
            ],
            night: [
                "Late night, low light, long memories. Best hours for serious work.",
                "The underground at midnight is the real city. Everything else is its paperwork."
            ]
        },
        service: 'contracts',
        serviceFaction: 'demon',
        specialService: 'Enforcer contracts',
        specialServiceFlags: ['demon_ending_enforcer', 'demon_ending_monster']
    },

    // --- CORPORATE TOWERS ---
    npc_ceo_sarah: {
        id: 'npc_ceo_sarah',
        name: 'Director Sarah',
        location: 'corporate_towers',
        baseDialogue: [
            "Time is money. You are currently wasting mine.",
            "The market is bullish on misery today.",
            "Submit your proposal in triplicate."
        ],
        daypartDialogue: {
            morning: [
                "9 AM standup. You're not on the agenda. Fix that or leave.",
                "Corporate morning: coffee, quarterly projections, quiet panic."
            ],
            afternoon: [
                "Midday board meeting. Your timing remains aggressively poor.",
                "Afternoon productivity is down 3%. I'm looking at you.",
            ],
            evening: [
                "Overtime. The towers run on ambition and bad sleep.",
                "Evening paperwork. Submit it in triplicate. The night notary costs extra."
            ],
            night: [
                "The towers went dark an hour ago. Whatever business you have with me now, it's off the books.",
                "Board members don't work nights. Ask me why I do."
            ]
        },
    },

    // --- UNDERGROUND MARKETS ---
    npc_shady_dealer: {
        id: 'npc_shady_dealer',
        name: 'Shady Slim',
        alignment: 'dangerous',
        socialEffects: { chat: { karma: -1, luck: -1, relationship: 2 }, gift: { karma: -1, relationship: 8 }, insult: { karma: -3, fear: 6, relationship: -15 } },
        location: 'underground_markets',
        baseDialogue: [
            "Psst. You looking for... 'special' paper?",
            "No refunds. No receipts. No witnesses.",
            "The Coalition doesn't look down here often."
        ],
        daypartDialogue: {
            morning: [
                "You're up early. So am I. That's all you get to know about that.",
                "Daylight version of me is just a guy walking. Don't make it weird."
            ],
            afternoon: [
                "Setting up. Slow customers get the slow prices.",
                "Daylight down here means the good stock isn't here yet."
            ],
            evening: [
                "Prime hours. Fresh stock, fresh marks, fresh stories.",
                "Evening specials. Ask me no details and I'll tell you no lies."
            ],
            night: [
                "Late shift. The risky goods come out after midnight.",
                "You want the midnight inventory? Midnight prices too."
            ]
        },
        service: 'contracts',
        serviceFaction: 'demon',
        specialService: 'Enforcer contracts',
        specialServiceFlags: ['demon_ending_enforcer', 'demon_ending_monster']
    },
    npc_fighter_brock: {
        id: 'npc_fighter_brock',
        name: 'Brock the Brick',
        location: 'underground_markets',
        baseDialogue: [
            "You look breakable.",
            "I eat staples for breakfast.",
            "You want to fight? Or just bleed?"
        ],
        daypartDialogue: {
            morning: [
                "Morning roadwork. Champions run before breakfast, legends run before anyone's watching.",
                "Staples don't eat themselves, kid. Come back when my hands are taped."
            ],
            afternoon: [
                "Afternoon circuit. Rich guys pay to get hit by me. Easy money.",
                "Daylight sparing. I go easy. Mostly."
            ],
            evening: [
                "Evening fights draw the real crowds. Bring your own bandages.",
                "You want a bout? The mat's open and my fists are dishonest."
            ],
            night: [
                "Underground nights. No rules, no refs, no refunds.",
                "Midnight matches. The blood washes off by morning. Usually."
            ]
        }
    },

    // --- CIVIC CENTER ---
    npc_mayor: {
        id: 'npc_mayor',
        name: 'Mayor McPaper',
        location: 'political_offices',
        faction: 'angel',
        baseDialogue: [
            "Vote for me! Or else!",
            "Everything is under control. The fires are intentional.",
            "We are building a brighter, flatter future."
        ],
        daypartDialogue: {
            morning: [
                "Morning briefing. Everything is under control. The morning fires are intentional.",
                "Office hours begin! Democracy operates on a schedule."
            ],
            afternoon: [
                "Afternoon session. The paperwork of freedom never rests!",
                "Constituents at noon, donors by two. The city runs on both."
            ],
            evening: [
                "Evening walkabouts. Shaking hands downtown - the flat ones and the folded ones.",
                "Campaign season is every season when you're beloved. Or monitored."
            ],
            night: [
                "A mayor's day ends when the lights go out. These ones I turned off myself. Ask no questions!",
                "Late-night budget session. The city sleeps; its debts do not. Vote for me!"
            ]
        },
        service: 'discounts',
        serviceFaction: 'angel'
    },

    // --- FOUNDRY ROW ---
    npc_foundry_grip: {
        id: 'npc_foundry_grip',
        name: 'Grip',
        location: 'foundry_row',
        faction: 'angel',
        alignment: 'good',
        socialEffects: { chat: { karma: 1, luck: 1, relationship: 2 }, gift: { karma: 1, relationship: 8, trust: 1 }, insult: { karma: -2, fear: 2, relationship: -10 } },
        baseDialogue: [
            "A press doesn't care who owns it. It cares whether the operator shows up.",
            "Row rule one: machines first, politics second. Keeps the peace - mostly."
        ],
        daypartDialogue: {
            morning: [
                "Furnaces are hot by six. Best steel of the day comes off the first shift.",
                "Morning, and already three crews want the same press. Line forms behind the person who actually works."
            ],
            afternoon: [
                "Midday crowd's all brokers and muscle. The work still gets done by the quiet ones.",
                "Afternoon inventory. Everything on this Row was something else before it was this."
            ],
            evening: [
                "Evening shift is family hour on the Row. Watch who walks whom home.",
                "Angels keep a ladder out for whoever needs it. You saw nothing."
            ],
            night: [
                "Night watch. The Row's quiet, but quiet here is loaded.",
                "I lock the furnaces at midnight. Whatever you're forging, forge it before then."
            ]
        },
        service: 'contracts',
        serviceFaction: 'angel',
        specialService: 'Press maintenance waiver',
        specialServiceFlags: ['angel_ending_steward', 'angel_ending_authority']
    },
    npc_foundry_needle: {
        id: 'npc_foundry_needle',
        name: 'Needle',
        location: 'foundry_row',
        faction: 'ghost',
        alignment: 'opportunistic',
        socialEffects: { chat: { relationship: 2, trust: 1 }, gift: { relationship: 9, trust: 2 }, insult: { karma: -1, fear: 3, relationship: -12 } },
        baseDialogue: [
            "Every machine on this Row was bought twice - once with money, once with favors. I keep the second ledger.",
            "Bolt counts, shift logs, lock combinations. The Row runs on paper. I run the paper."
        ],
        daypartDialogue: {
            morning: [
                "Morning audit. You'd be amazed what people sign before coffee.",
                "Early crew list is up. Want to know who owes who? It's all in the overtime."
            ],
            afternoon: [
                "Afternoon rates are my rates. Everything's negotiable except the spread.",
                "Spare parts move faster when nobody writes down where they went."
            ],
            evening: [
                "Evening edition's out - who's bidding, who's bluffing, who's broke.",
                "Brokers pay for quiet. Muscle pays for noise. I sell both and keep the difference."
            ],
            night: [
                "The night ledger's the honest one. No committee to edit it.",
                "Sleep is a weakness I'll trade you a secret to avoid."
            ]
        },
        service: 'market',
        serviceFaction: 'ghost',
        specialService: 'Scrap futures sheet',
        specialServiceFlags: ['ghost_ending_channel', 'ghost_ending_broker']
    },
    npc_foundry_slide: {
        id: 'npc_foundry_slide',
        name: 'Slide',
        location: 'foundry_row',
        faction: 'demon',
        alignment: 'dangerous',
        socialEffects: { chat: { karma: -1, fear: 2, relationship: 1 }, gift: { relationship: 7, trust: 2 }, insult: { karma: -2, fear: 6, relationship: -14 } },
        baseDialogue: [
            "Block 8 collects rent after dark. Most people pay by not being there.",
            "The Row's neutral because we keep it neutral. You're welcome. That courtesy has a maintenance fee."
        ],
        daypartDialogue: {
            morning: [
                "Morning sweep. Block 8's clean, which means everybody behaved. For once.",
                "Sunrise inventory: nothing missing, nobody missing. Good night's work."
            ],
            afternoon: [
                "Afternoon inspections. Paper's not the only thing that gets pressed here.",
                "Carry yourself right on this Row and you'll never see the inside of Block 8."
            ],
            evening: [
                "Evening odds are posted. Block 8 opens when the council lights go amber.",
                "Big spenders, big losers, same people usually. Doors open soon."
            ],
            night: [
                "Rent's due for anyone still on the Row. The pit takes cash or teeth.",
                "Nights here are simple: the strong walk, the smart nod, the slow pay."
            ]
        },
        service: 'safehouse',
        serviceFaction: 'demon',
        specialService: 'Pit-weight certification',
        specialServiceFlags: ['demon_ending_enforcer', 'demon_ending_monster']
    },

    // --- THE WATERFRONT ---
    npc_dock_halyard: {
        id: 'npc_dock_halyard',
        name: 'Halyard',
        location: 'the_waterfront',
        faction: 'angel',
        alignment: 'good',
        socialEffects: { chat: { karma: 1, luck: 1, relationship: 2 }, gift: { karma: 1, relationship: 8, trust: 1 }, insult: { karma: -2, fear: 2, relationship: -10 } },
        baseDialogue: [
            "A seal is a promise stamped in lead. I count every one twice.",
            "The docks run on trust and chain-link. Chain-link is the cheap part."
        ],
        daypartDialogue: {
            morning: [
                "First lighterage is in. Best time to walk the piers before the crowd learns the schedule.",
                "Morning tally. Everything that arrived overnight gets a seal or a story."
            ],
            afternoon: [
                "Afternoon crane runs are the loud hours. Shout, don't whisper.",
                "Two containers short of an honest manifest. Story of the Waterfront."
            ],
            evening: [
                "Evening watch changes at the Customs House. Good time to be seen doing right.",
                "Sunset tally. What the cranes moved today, the city eats tomorrow."
            ],
            night: [
                "Night tides bring cargo nobody stamped. Walk with somebody.",
                "I re-seal the uncertain containers before midnight. Sleep is for audited men."
            ]
        },
        service: 'contracts',
        serviceFaction: 'angel',
        specialService: 'Customs bond waiver',
        specialServiceFlags: ['angel_ending_steward', 'angel_ending_authority']
    },
    npc_dock_condor: {
        id: 'npc_dock_condor',
        name: 'Condor',
        location: 'the_waterfront',
        faction: 'ghost',
        alignment: 'opportunistic',
        socialEffects: { chat: { relationship: 2, trust: 1 }, gift: { relationship: 9, trust: 2 }, insult: { karma: -1, fear: 3, relationship: -12 } },
        baseDialogue: [
            "Every container carries two cargoes: the one that's billed and the one that's true. I read both.",
            "Serial numbers, seal scars, crane schedules. The harbor files itself; I hold the key."
        ],
        daypartDialogue: {
            morning: [
                "Morning drafts are clean. Nobody's had time to lie in writing yet.",
                "Fresh manifests at dawn. Want to know what the city's really out of? Look at what's delayed."
            ],
            afternoon: [
                "Afternoon corrections. Every error is a favor someone forgot to invoice.",
                "Brokers price rumors. I sell the corrections before the rumors exist."
            ],
            evening: [
                "Evening cargo gets rerouted on paper first, cranes second. Read the paper.",
                "The ghosts of this dock aren't dead men. They're unsigned delivery orders."
            ],
            night: [
                "Night window: manifests move before the ink dries. Nothing here sleeps, it just files late.",
                "Piers go dark; the ledgers don't. Ask me what vanished tonight."
            ]
        },
        service: 'market',
        serviceFaction: 'ghost',
        specialService: 'Manifest foreword',
        specialServiceFlags: ['ghost_ending_channel', 'ghost_ending_broker']
    },
    npc_dock_harrow: {
        id: 'npc_dock_harrow',
        name: 'Harrow',
        location: 'the_waterfront',
        faction: 'demon',
        alignment: 'dangerous',
        socialEffects: { chat: { karma: -1, fear: 2, relationship: 1 }, gift: { relationship: 7, trust: 2 }, insult: { karma: -2, fear: 6, relationship: -14 } },
        baseDialogue: [
            "Pier 31 has no daylight rate. You pay what the night decides.",
            "The longshore crews don't cross my shadow. Neither should you."
        ],
        daypartDialogue: {
            morning: [
                "Morning count: three quiet nights, two quiet mouths. Good arithmetic.",
                "Sunrise sweep. Anything that washed up overnight is either cargo or a lesson."
            ],
            afternoon: [
                "Afternoon shifts move heavy loads. Heavy loads break weak hands. Stay clear.",
                "The stevedores listen when I nod. That's the whole job."
            ],
            evening: [
                "Evening collections. The harbor keeps books deeper than Customs does.",
                "Doors that open at night open because someone like me arranged it."
            ],
            night: [
                "Pier 31's lit. Bring cash or bring intent.",
                "Night water takes what night work leaves. Simple as gravity."
            ]
        },
        service: 'safehouse',
        serviceFaction: 'demon',
        specialService: 'Pier 31 certification',
        specialServiceFlags: ['demon_ending_enforcer', 'demon_ending_monster']
    }
};
