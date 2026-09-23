'use client';

import { useState, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/layout/Sidebar';
import { VisualMap } from '@/components/views/VisualMap';
import { InventoryView } from '@/components/views/InventoryView';
import { ShopView } from '@/components/views/ShopView';
import { NPCList } from '@/components/views/NPCList';
import { CasinoView } from '@/components/views/CasinoView';
import { ClubView } from '@/components/views/ClubView';
import { UniversityView } from '@/components/views/UniversityView';
import { GymView } from '@/components/views/GymView';
import { TradingView } from '@/components/views/TradingView';
import { SafehouseView } from '@/components/views/SafehouseView';
import { LeaderboardView } from '@/components/views/LeaderboardView';
import { AchievementPanel } from '@/components/views/AchievementPanel';
import { JobBoardView } from '@/components/views/JobBoardView';
import { EconomyView } from '@/components/views/EconomyView';
import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';
import { ModeSelector } from '@/components/views/ModeSelector';
import { MainMenu } from '@/components/views/MainMenu';
import { GameShell } from '@/components/layout/GameShell';
import { LiveBootToast } from '@/components/layout/LiveBootToast';
import { CombatView } from '@/components/views/CombatView';
import { CombatHubView } from '@/components/views/CombatHubView';
import { CharacterCreator } from '@/components/views/CharacterCreator';
import { ScreenEffects } from '@/components/layout/ScreenEffects';
import { IntroOverlay } from '@/components/overlays/IntroOverlay';
import { WorldTutorialOverlay } from '@/components/overlays/WorldTutorialOverlay';
import { QuestChoiceOverlay } from '@/components/overlays/QuestChoiceOverlay';
import { ReactiveEventOverlay } from '@/components/overlays/ReactiveEventOverlay';
import { StreetEncounterOverlay } from '@/components/overlays/StreetEncounterOverlay';

// Dynamic import for GameLoop to avoid hydration issues with interval
const GameLoop = dynamic(() => import('@/components/layout/GameLoop').then((mod) => mod.GameLoop), {
  ssr: false,
});

const emptySubscribe = () => () => { };
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function GamePage() {
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  // Core state selectors
  const version = useGameStore((state) => state.version);
  const gameMode = useGameStore((state) => state.gameMode);
  const locationId = useGameStore((state) => state.world.locationId);
  const flags = useGameStore((state) => state.flags);
  const latestToast = useUIStore((state) => state.toasts[0]);
  const latestNotification = latestToast ? `${latestToast.title}: ${latestToast.description || ''}` : null;
  // const shake = useUIStore((state) => state.shake); // Unused in new layout

  // UI Store State
  const activeTab = useUIStore((state) => state.activeTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const uiMode = useUIStore((state) => state.uiMode);
  // const setUiMode = useUIStore((state) => state.setUiMode); // Unused in page.tsx now

  const [shopCategory, setShopCategory] = useState<'all' | 'consumable' | 'weapon' | 'electronics' | 'luxury' | 'gym'>('all');
  const [showMobileStats, setShowMobileStats] = useState(false);

  const openService = (service: string, tab: Parameters<typeof setActiveTab>[0]) => {
    const store = useGameStore.getState();
    const accessId = `service:${service}`;
    if (!store.canAccess(accessId)) {
      useUIStore.getState().toast({
        title: 'SERVICE LOCKED',
        description: store.getAccessReason(accessId) || 'This service is not available to your current identity.',
        variant: 'warning'
      });
      return;
    }
    setActiveTab(tab);
  };

  // Greeting Toast on Live
  // MOVED TO LiveBootToast.tsx
  // useEffect(() => {
  //   if (mounted && uiMode === 'live') {
  //     useUIStore.getState().toast({
  //       title: 'WELCOME BACK',
  //       description: 'PAPER CITY IS OPEN.',
  //       variant: 'success'
  //     });
  //   }
  // }, [mounted, uiMode]);


  if (!mounted) return null;

  return (
    <div className="h-screen w-screen bg-bg-dark overflow-hidden font-sans text-text-main relative">
      <ScreenEffects />

      {/* BOOT LAYER (Menu) */}
      <MainMenu />

      {/* TOAST SYSTEM (Boot) */}
      <LiveBootToast />

      {/* LIVE LAYER (HUD + MAP) */}
      <GameShell>
        <QuestChoiceOverlay />
        <ReactiveEventOverlay />
        <StreetEncounterOverlay />
        <CombatView />
        <GameLoop />

        {/* Left Sidebar */}
        <div
          className={`hidden md:block transition-all duration-[420ms] ease-out ${uiMode === 'live' ? "translate-x-0 blur-0" : "-translate-x-2 blur-[2px]"
            }`}
        >
          <Sidebar />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden p-3 bg-bg-main border-b border-border-main flex justify-between items-center text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileStats(true)}
              className="p-1 border border-coalition-blue/30 text-coalition-blue active:scale-95 transition-transform"
            >
              [ MENU ]
            </button>
            <span className="font-bold tracking-tighter text-text-muted">PAPER CITY OS</span>
          </div>
          <span className="text-coalition-blue font-mono">v{version.toFixed(1)}</span>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full bg-bg-dark relative overflow-hidden backdrop-blur-sm">

          {/* Top Bar (Desktop) */}
          <div className="hidden md:flex h-10 border-b border-border-main items-center px-4 justify-between bg-bg-main/50">
            <span className="text-xs text-text-muted uppercase tracking-widest">
              Paper City <span className="text-coalition-blue">v{version.toFixed(1)}</span>
            </span>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-zinc-400">NET_ON</span>
            </div>
          </div>

          {/* Main View Container */}
          <div className="flex-1 relative overflow-auto pb-32 md:pb-0">
            {/* Map Background always visible in game shell, but dimmed/handled by uiMode if needed, 
                but here GameShell handles overall opacity. 
                VisualMap renders if activeTab is location OR we want it as bg. 
                In this new arch, GameShell is 0 opacity during boot, so we don't need 'boot' check for VisualMap visibility 
                UNLESS VisualMap is also the background of MainMenu?
                User said "Optional: faint map silhouette behind" in MainMenu. 
                But VisualMap is stateful. 
                Let's render VisualMap if activeTab is location, OR 'boot'/'transition' if we want it pre-rendered?
                Actually GameShell handles opacity, so we can just render normal gameplay state.
            */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>

            {(!flags.character_created) ? (
              gameMode === null ? <ModeSelector /> : <CharacterCreator />
            ) : (
              <>
                {activeTab === 'location' && (
                  <VisualMap
                    key={locationId}
                    onAction={(action, target) => {
                      const store = useGameStore.getState();
                      switch (action) {
                        case 'open_shop': setShopCategory('all'); setActiveTab('shop'); break;
                        case 'open_shop_clothing': setShopCategory('luxury'); setActiveTab('shop'); break;
                        case 'open_shop_electronics': setShopCategory('electronics'); setActiveTab('shop'); break;
                        case 'open_shop_gym': setShopCategory('gym'); setActiveTab('shop'); break;
                        case 'open_shop_food': setShopCategory('consumable'); setActiveTab('shop'); break;
                        case 'open_shop_illegal': openService('black_market', 'shop'); setShopCategory('weapon'); break;
                        case 'open_arcade': alert('Arcade - Out of Tokens! (Coming Soon)'); break;
                        case 'open_university': openService('university', 'university'); break;
                        case 'open_gym': openService('gym', 'gym'); break;
                        case 'open_trading': openService('trading_floor', 'trading'); break;
                        case 'open_safehouse': openService('safehouse', 'safehouse'); break;
                        case 'open_home': setActiveTab('safehouse'); break;
                        case 'open_casino': openService('casino', 'casino'); break;
                        case 'open_club': setActiveTab('club'); break;
                        case 'open_leaderboard': setActiveTab('leaderboard'); break;
                        case 'open_economy': setActiveTab('economy'); break;
                        case 'open_jobs': openService('jobs', 'jobs'); break;
                        case 'open_deeds_office': useUIStore.getState().toast({ title: 'RESTRICTED_ACCESS', description: 'Land ownership protocols open later.', variant: 'warning' }); break;
                        case 'travel': if (target && store.setLocation(target)) { store.advanceTime(15, 'travel', target); useUIStore.getState().toast({ title: 'Travel', description: `Traveled to ${target}`, variant: 'neutral' }); useUIStore.getState().triggerShake(); } break;
                        case 'fight': if (target) { store.startCombat(target); useUIStore.getState().triggerShake(); } break;
                        case 'talk_npc': if (target) { store.interactNPC(target, 'chat'); } break;
                        default: console.warn('Unknown action:', action);
                      }
                    }}
                  />
                )}
                {activeTab === 'inventory' && <InventoryView />}
                {activeTab === 'shop' && <ShopView onBack={() => setActiveTab('location')} initialCategory={shopCategory} />}
                {activeTab === 'university' && <UniversityView onBack={() => setActiveTab('location')} />}
                {activeTab === 'casino' && <CasinoView onBack={() => setActiveTab('location')} />}
                {activeTab === 'club' && <ClubView onBack={() => setActiveTab('location')} />}
                {activeTab === 'combat' && <CombatHubView onBack={() => setActiveTab('location')} />}
                {activeTab === 'economy' && <EconomyView onBack={() => setActiveTab('location')} />}
                {activeTab === 'gym' && <GymView onBack={() => setActiveTab('location')} />}
                {activeTab === 'jobs' && <JobBoardView onBack={() => setActiveTab('location')} />}
                {activeTab === 'trading' && <TradingView onBack={() => setActiveTab('location')} />}
                {activeTab === 'safehouse' && <SafehouseView onBack={() => setActiveTab('location')} isHome={locationId === 'the_block'} />}
                {activeTab === 'leaderboard' && <LeaderboardView onBack={() => setActiveTab('location')} />}
                {activeTab === 'achievements' && <AchievementPanel onBack={() => setActiveTab('location')} />}
              </>
            )}


            {!flags.intro_seen && flags.character_created && (
              <IntroOverlay />
            )}
            <WorldTutorialOverlay />
          </div>

          {/* Bottom Tabs/Nav */}
          <div className="h-10 border-t border-border-main bg-bg-main flex text-[10px] font-bold uppercase tracking-widest">
            <button onClick={() => setActiveTab('location')} className={`flex-1 hover:bg-bg-dark transition-colors ${activeTab === 'location' ? 'bg-bg-dark text-coalition-blue border-b-2 border-coalition-blue' : 'text-text-muted'}`}>Location</button>
            <button onClick={() => setActiveTab('shop')} className={`flex-1 hover:bg-bg-dark transition-colors ${activeTab === 'shop' ? 'bg-bg-dark text-coalition-blue border-b-2 border-coalition-blue' : 'text-text-muted'}`}>Shop</button>
            <button onClick={() => setActiveTab('inventory')} className={`flex-1 hover:bg-bg-dark transition-colors ${activeTab === 'inventory' ? 'bg-bg-dark text-coalition-blue border-b-2 border-coalition-blue' : 'text-text-muted'}`}>Inventory</button>
            <button onClick={() => setActiveTab('combat')} className={`flex-1 hover:bg-bg-dark transition-colors ${activeTab === 'combat' ? 'bg-bg-dark text-demon-500 border-b-2 border-demon-500' : 'text-text-muted'}`}>Fight</button>
            <button onClick={() => setActiveTab('leaderboard')} className={`flex-1 hover:bg-bg-dark transition-colors ${activeTab === 'leaderboard' ? 'bg-bg-dark text-demon-500 border-b-2 border-demon-500' : 'text-text-muted'}`}>Rank</button>
          </div>

          {/* Bottom Log */}
          <div className="h-12 border-t border-border-main bg-bg-main/80 items-center flex px-4 text-[10px] text-text-muted font-mono">
            <span className="mr-2 text-coalition-blue">&gt;</span>
            {latestNotification || "System awaiting user input..."}
          </div>
        </main>

        {/* Mobile Stats Drawer */}
        {showMobileStats && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md md:hidden flex flex-col animate-in fade-in duration-300">
            <div className="p-4 border-b border-border-main flex justify-between items-center bg-bg-main">
              <h2 className="text-sm font-bold tracking-tighter">CHARACTER DATA</h2>
              <button
                onClick={() => setShowMobileStats(false)}
                className="text-xs font-mono text-demon-500"
              >
                [ CLOSE ]
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex flex-col gap-6">
              <Sidebar />
              <div className="mt-4">
                <h3 className="text-[10px] font-bold text-text-muted mb-2 uppercase tracking-widest">Local Contacts</h3>
                <NPCList />
              </div>
            </div>
          </div>
        )}

        {/* Right Sidebar (NPCs) */}
        <div
          className={`hidden md:block transition-all duration-[420ms] ease-out ${uiMode === 'live' ? "translate-x-0 blur-0" : "translate-x-2 blur-[2px]"
            }`}
        >
          <NPCList />
        </div>
      </GameShell>
    </div>
  );
}
