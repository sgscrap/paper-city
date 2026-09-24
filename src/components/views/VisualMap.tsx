'use client';

import { useEffect, useRef, useState } from 'react';
import { InputSystem } from '@/lib/InputSystem';
import { useGameStore, GameStore, RemotePlayer } from '@/stores/gameStore';
import { MAP_DEFINITIONS, Point, BuildingRect } from '@/data/maps';
import { NPCS } from '@/data/npcs';
import { NPC_FACTION_COLORS, NEUTRAL_NPC_COLOR } from '@/data/npcSchedules';
import { NpcCityAI, NpcWorldPosition } from '@/lib/NpcCityAI';
import { networkManager } from '@/lib/NetworkManager';
import { CharacterRenderer } from '@/lib/CharacterRenderer';
import { SpriteAnimator } from '@/lib/sprite/spriteAnimator';
import clsx from 'clsx';

// Network Event Types
interface NetMoveData { id: string; x: number; y: number; mapId: string; }
interface NetPlayerData { id: string; }
interface NetWelcomeData { id: string; }
interface NetPlayersList { players: RemotePlayer[]; }

const PLAYER_SIZE = 20;
const NPC_INTERACT_RADIUS = 55;
const SPEED = 300; // Pixels per second

interface VisualMapProps {
    onAction: (action: string, target?: string) => void;
}

export const VisualMap = ({ onAction }: VisualMapProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const location = useGameStore((state: GameStore) => state.world.locationId);
    const playerPower = useGameStore((state: GameStore) => state.player.stats.power);
    const combatRep = useGameStore((state: GameStore) => state.combatRecord.reputation);
    const demonRep = useGameStore((state: GameStore) => state.factionReputation.demon || 0);
    const karma = useGameStore((state: GameStore) => state.player.stats.karma);
    const remotePlayers = useGameStore((state: GameStore) => state.remotePlayers);
    const updateRemotePlayer = useGameStore((state: GameStore) => state.updateRemotePlayer);
    const removeRemotePlayer = useGameStore((state: GameStore) => state.removeRemotePlayer);
    const mapData = MAP_DEFINITIONS[location] || MAP_DEFINITIONS['the_block'];

    // --- CITY NPC AI ---
    // Quantize world time to 30-minute chunks so schedule lookups re-render
    // rarely while still tracking venue changes.
    const worldTimeChunk = useGameStore((state: GameStore) => Math.floor(state.world.time / 30));
    const presentNpcIds = NpcCityAI.getPresence(Object.keys(NPCS), location, worldTimeChunk * 30);
    const presentKey = presentNpcIds.join(',');
    const [, setNpcPositions] = useState<Record<string, NpcWorldPosition>>({});
    const [nearbyNpc, setNearbyNpc] = useState<NpcWorldPosition | null>(null);
    const npcPositionsRef = useRef<Record<string, NpcWorldPosition>>({});
    const nearbyNpcRef = useRef<NpcWorldPosition | null>(null);
    const lastNpcTickRef = useRef(0);

    useEffect(() => {
        setNpcPositions((prev) => {
            const next: Record<string, NpcWorldPosition> = {};
            for (const id of presentNpcIds) {
                next[id] = prev[id] || NpcCityAI.spawnFor(id, location);
            }
            npcPositionsRef.current = next;
            return next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [presentKey, location]);

    // Refs for Game Loop access
    const remotePlayersRef = useRef(remotePlayers);
    useEffect(() => { remotePlayersRef.current = remotePlayers; }, [remotePlayers]);

    const locationRef = useRef(location);
    useEffect(() => { locationRef.current = location; }, [location]);

    const playerPowerRef = useRef(playerPower);
    useEffect(() => { playerPowerRef.current = playerPower; }, [playerPower]);

    const combatRepRef = useRef(combatRep);
    useEffect(() => { combatRepRef.current = combatRep; }, [combatRep]);

    const demonRepRef = useRef(demonRep);
    useEffect(() => { demonRepRef.current = demonRep; }, [demonRep]);

    const karmaRef = useRef(karma);
    useEffect(() => { karmaRef.current = karma; }, [karma]);

    const posRef = useRef<Point>(mapData.spawn);
    const directionRef = useRef(0);
    const frameRef = useRef(0);
    const [interactionTarget, setInteractionTarget] = useState<BuildingRect | null>(null);
    const interactionTargetRef = useRef<BuildingRect | null>(null);

    // Mobile Controls State
    const [joystickDir, setJoystickDir] = useState<Point | null>(null);
    const joystickDirRef = useRef<Point | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [mapScale, setMapScale] = useState(1);
    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const resizeMap = () => {
            const rect = viewport.getBoundingClientRect();
            const availableWidth = Math.max(320, rect.width - 16);
            const availableHeight = Math.max(240, rect.height - 16);
            setMapScale(Math.min(1.5, Math.min(availableWidth / 800, availableHeight / 600)));
        };

        resizeMap();
        const observer = new ResizeObserver(resizeMap);
        observer.observe(viewport);
        return () => observer.disconnect();
    }, []);

    // Initialize Input System
    useEffect(() => {
        InputSystem.getInstance();
        return () => InputSystem.getInstance().cleanup();
    }, []);

    // Multiplayer Connection & Events
    useEffect(() => {
        networkManager.connect();

        const handleMove = (data: unknown) => {
            const d = data as NetMoveData;
            updateRemotePlayer(d.id, { x: d.x, y: d.y, mapId: d.mapId, id: d.id });
        };
        const handleLeave = (data: unknown) => {
            const d = data as NetPlayerData;
            removeRemotePlayer(d.id);
        };
        const handleWelcome = (data: unknown) => {
            const d = data as NetWelcomeData;
            console.log('User ID:', d.id);
        };
        const handleCurrentPlayers = (data: unknown) => {
            const d = data as NetPlayersList;
            if (d.players) {
                d.players.forEach((p: RemotePlayer) => {
                    updateRemotePlayer(p.id, p);
                });
            }
        };

        networkManager.on('PLAYER_MOVED', handleMove);
        networkManager.on('PLAYER_LEFT', handleLeave);
        networkManager.on('WELCOME', handleWelcome);
        networkManager.on('CURRENT_PLAYERS', handleCurrentPlayers);

        return () => {
            networkManager.off('PLAYER_MOVED', handleMove);
            networkManager.off('PLAYER_LEFT', handleLeave);
            networkManager.off('WELCOME', handleWelcome);
            networkManager.off('CURRENT_PLAYERS', handleCurrentPlayers);
        };
    }, [updateRemotePlayer, removeRemotePlayer]);

    const lastSentPos = useRef({ x: 0, y: 0 });
    const lastSentTime = useRef(0);
    const lastTimeRef = useRef<number>(0);

    // Game Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const loop = (timestamp: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
            lastTimeRef.current = timestamp;

            const input = InputSystem.getInstance();
            const { x, y } = posRef.current;
            let dx = 0;
            let dy = 0;

            if (input.isPressed('KeyW') || input.isPressed('ArrowUp')) dy -= SPEED * dt;
            if (input.isPressed('KeyS') || input.isPressed('ArrowDown')) dy += SPEED * dt;
            if (input.isPressed('KeyA') || input.isPressed('ArrowLeft')) dx -= SPEED * dt;
            if (input.isPressed('KeyD') || input.isPressed('ArrowRight')) dx += SPEED * dt;

            // Mobile Joystick override
            if (isMobile && joystickDirRef.current) {
                dx = joystickDirRef.current.x * SPEED * dt;
                dy = joystickDirRef.current.y * SPEED * dt;
            }

            if (dx !== 0 || dy !== 0) {
                // Update direction based on primary input axe
                if (Math.abs(dy) > Math.abs(dx)) {
                    directionRef.current = dy > 0 ? 0 : 1;
                } else if (Math.abs(dx) > 0) {
                    directionRef.current = dx < 0 ? 2 : 3;
                }
            }

            if (dx !== 0 && dy !== 0) {
                dx *= 0.707;
                dy *= 0.707;
            }

            let nx = x + dx;
            let ny = y + dy;

            nx = Math.max(0, Math.min(nx, mapData.width - PLAYER_SIZE));
            ny = Math.max(0, Math.min(ny, mapData.height - PLAYER_SIZE));

            mapData.buildings.forEach(b => {
                if (b.type === 'exit') return;
                const isOverlapping =
                    nx < b.x + b.w && nx + PLAYER_SIZE > b.x &&
                    ny < b.y + b.h && ny + PLAYER_SIZE > b.y;

                if (isOverlapping) {
                    nx -= dx;
                    ny -= dy;
                }
            });

            posRef.current = { x: nx, y: ny };
            const pcx = nx + PLAYER_SIZE / 2;
            const pcy = ny + PLAYER_SIZE / 2;

            // --- CITY NPC AI TICK (throttled to ~12fps to save CPU) ---
            if (timestamp - lastNpcTickRef.current > 80) {
                lastNpcTickRef.current = timestamp;
                if (Object.keys(npcPositionsRef.current).length > 0) {
                    // Compute player street presence fear factor (power >= 25, high combat rep, or ruthless demon rep)
                    let fearIntensity = 0;
                    const cRep = combatRepRef.current;
                    const pPow = playerPowerRef.current;
                    const dRep = demonRepRef.current;
                    const pKarma = karmaRef.current;
                    if (cRep >= 15 || pPow >= 30 || dRep >= 25 || pKarma <= -25) {
                        fearIntensity = Math.min(1, Math.max(0.3, (cRep / 30) + (pPow / 60) + (dRep > 0 ? dRep / 50 : 0)));
                    }

                    const avoidTarget = fearIntensity > 0 ? {
                        x: pcx,
                        y: pcy,
                        radius: 85,
                        intensity: fearIntensity
                    } : null;

                    const updated = NpcCityAI.update(npcPositionsRef.current, locationRef.current, 0.08, avoidTarget);
                    npcPositionsRef.current = updated;
                    setNpcPositions(updated);
                    setNearbyNpc((prev) => {
                        let closest: NpcWorldPosition | null = null;
                        let bestDist = NPC_INTERACT_RADIUS;
                        for (const npc of Object.values(updated)) {
                            const d = Math.hypot(pcx - (npc.x + PLAYER_SIZE / 2), pcy - (npc.y + PLAYER_SIZE / 2));
                        if (d < bestDist) { bestDist = d; closest = npc; }
                        }
                        if (closest?.id !== prev?.id) {
                            nearbyNpcRef.current = closest;
                            return closest;
        }
                        return prev;
                    });

                    // An NPC close enough may initiate a street encounter.
                    if (nearbyNpcRef.current) {
                        useGameStore.getState().maybeApproachPlayer(nearbyNpcRef.current.id);
                    }
                }
            }

            const now = Date.now();
            if (now - lastSentTime.current > 100 && (Math.abs(nx - lastSentPos.current.x) > 2 || Math.abs(ny - lastSentPos.current.y) > 2)) {
                networkManager.sendMove(nx, ny, locationRef.current);
                lastSentPos.current = { x: nx, y: ny };
                lastSentTime.current = now;
            }

            let newTarget: BuildingRect | null = null;
            const radius = 60;

            for (const b of mapData.buildings) {
                if (
                    pcx > b.x - radius && pcx < b.x + b.w + radius &&
                    pcy > b.y - radius && pcy < b.y + b.h + radius
                ) {
                    newTarget = b;
                    break;
                }
            }

            if (interactionTargetRef.current !== newTarget) {
                interactionTargetRef.current = newTarget;
                setInteractionTarget(newTarget);
            }

            // --- RENDER ---
            const dpr = window.devicePixelRatio || 1;
            if (canvas.width !== 800 * dpr || canvas.height !== 600 * dpr) {
                canvas.width = 800 * dpr;
                canvas.height = 600 * dpr;
                ctx.scale(dpr, dpr);
            }

            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, 800, 600);

            // Update Frame Animation using fixed FPS
            const moving = dx !== 0 || dy !== 0;
            frameRef.current = SpriteAnimator.getWalkFrame(moving, timestamp);
            const dotFlicker = SpriteAnimator.getPulse(timestamp);

            ctx.strokeStyle = 'rgba(255,255,255,0.03)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < canvas.width; i += 40) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
            for (let i = 0; i < canvas.height; i += 40) { ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); }
            ctx.stroke();

            ctx.save();

            mapData.buildings.forEach(b => {
                const isExit = b.type === 'exit';
                const isTarget = interactionTargetRef.current === b;
                const bcx = b.x + b.w / 2;
                const bcy = b.y + b.h / 2;
                const dist = Math.hypot(pcx - bcx, pcy - bcy);
                const proximity = Math.max(0, 1 - dist / 150); // Normalized proximity [0, 1]

                ctx.save();

                // Building Glow / Interaction Weight
                if (proximity > 0 || isTarget) {
                    ctx.shadowColor = isExit ? 'rgba(74, 222, 128, 0.3)' : 'rgba(109, 220, 255, 0.2)';
                    ctx.shadowBlur = 10 + proximity * 15;
                    if (isTarget) ctx.shadowBlur += 10;
                }

                // Building Base
                ctx.fillStyle = '#0b0f14';
                // Scale effect on proximity (subtle)
                const scale = 1 + (isTarget ? 0.02 : proximity * 0.01);
                ctx.translate(bcx, bcy);
                ctx.scale(scale, scale);
                ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);

                // Border
                ctx.strokeStyle = isTarget ? 'rgba(255,255,255,0.3)' : `rgba(255,255,255,${0.1 + proximity * 0.2})`;
                ctx.lineWidth = 1;
                ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);

                if (isExit) {
                    ctx.shadowColor = '#4ade80';
                    ctx.shadowBlur = 15;
                    ctx.strokeStyle = '#4ade80';
                    ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);
                }

                // Label
                if (b.label) {
                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 9px "Inter", sans-serif';
                    const tm = ctx.measureText(b.label.toUpperCase());
                    ctx.fillRect(-tm.width / 2 - 4, -8, tm.width + 8, 16);

                    ctx.fillStyle = isTarget ? '#fff' : `rgba(255, 255, 255, ${0.6 + proximity * 0.4})`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(b.label.toUpperCase(), 0, 0);

                    // In-world [E] Prompt
                    if (isTarget) {
                        ctx.fillStyle = '#6ddcff';
                        ctx.font = 'bold 10px monospace';
                        ctx.fillText('[ E ]', 0, 20);
                    }
                }

                ctx.restore();
            });

            const px = posRef.current.x;
            const py = posRef.current.y;

            ctx.save();
            // Shadow
            ctx.beginPath();
            ctx.ellipse(pcx, py + PLAYER_SIZE - 2, PLAYER_SIZE / 2, 4, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fill();

            // Pulsing Ring
            const pulseSize = 30 + Math.sin(timestamp / 300) * 10;
            const pulseAlpha = 0.2 - Math.sin(timestamp / 300) * 0.1;
            ctx.beginPath();
            ctx.arc(pcx, pcy, pulseSize, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(109, 220, 255, ${pulseAlpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Breathing Aura
            const auraScale = 1 + Math.sin(timestamp / 1000) * 0.15;
            const aura = ctx.createRadialGradient(pcx, pcy, 5, pcx, pcy, 30 * auraScale);
            aura.addColorStop(0, 'rgba(109, 220, 255, 0.2)');
            aura.addColorStop(1, 'rgba(109, 220, 255, 0)');
            ctx.fillStyle = aura;
            ctx.beginPath();
            ctx.arc(pcx, pcy, 30 * auraScale, 0, Math.PI * 2);
            ctx.fill();

            // NEW CHARACTER SPRITE
            CharacterRenderer.draw(ctx, {
                x: pcx,
                y: pcy,
                direction: directionRef.current,
                isMoving: dx !== 0 || dy !== 0,
                frame: frameRef.current,
                color: '#6ddcff',
                flicker: dotFlicker
            });

            ctx.restore();

            // CITY NPCS (AI-driven)
            Object.values(npcPositionsRef.current).forEach((npc) => {
                const ncx = npc.x + PLAYER_SIZE / 2;
                const ncy = npc.y + PLAYER_SIZE / 2;
                const color = NPC_FACTION_COLORS[npc.faction || ''] || NEUTRAL_NPC_COLOR;

                ctx.save();
                // Proximity glow
                const ndist = Math.hypot(pcx - ncx, pcy - ncy);
                const nprox = Math.max(0, 1 - ndist / 120);
                if (nprox > 0) {
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 8 + nprox * 14;
                }

                CharacterRenderer.draw(ctx, {
                    x: ncx,
                    y: ncy,
                    direction: npc.direction,
                    isMoving: npc.moving,
                    frame: SpriteAnimator.getWalkFrame(npc.moving, timestamp),
                    color,
                    flicker: 0.9
                });

                // Name tag
                ctx.shadowBlur = 0;
                ctx.font = '9px "JetBrains Mono", monospace';
                ctx.textAlign = 'center';
                ctx.fillStyle = `rgba(255,255,255,${0.55 + nprox * 0.45})`;
                ctx.fillText(npc.name.toUpperCase(), ncx, ncy - 24);
                if (nearbyNpcRef.current?.id === npc.id) {
                    ctx.fillStyle = color;
                    ctx.font = 'bold 10px monospace';
                    ctx.fillText('[ E ] TALK', ncx, ncy - 36);
                }
                ctx.restore();
            });

            // REMOTE PLAYERS
            Object.values(remotePlayersRef.current).forEach((rp: RemotePlayer) => {
                if (rp.id === networkManager.playerId || rp.mapId !== locationRef.current) return;

                // Draw remote character
                CharacterRenderer.draw(ctx, {
                    x: rp.x + PLAYER_SIZE / 2,
                    y: rp.y + PLAYER_SIZE / 2,
                    direction: 0,
                    isMoving: false,
                    frame: 0,
                    color: '#a78bfa',
                    flicker: 1
                });

                ctx.fillStyle = `rgba(167, 139, 250, ${0.4 + Math.sin(timestamp / 400) * 0.2})`;
                ctx.font = '9px "JetBrains Mono", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`NETRUNNER_${rp.id.substr(0, 4).toUpperCase()}`, rp.x + PLAYER_SIZE / 2, rp.y - 12);
            });

            if (newTarget) {
                ctx.beginPath();
                ctx.moveTo(px + PLAYER_SIZE / 2, py + PLAYER_SIZE / 2);
                ctx.lineTo(newTarget.x + newTarget.w / 2, newTarget.y + newTarget.h / 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key.toLowerCase() === 'e' || e.key === 'Enter')) {
                if (nearbyNpcRef.current) {
                    onAction('talk_npc', nearbyNpcRef.current.id);
                    return;
                }
                if (interactionTargetRef.current) {
                    onAction(interactionTargetRef.current.action || 'view', interactionTargetRef.current.target);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [mapData, onAction, isMobile]);

    return (
        <div ref={viewportRef} className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative select-none">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('/grid.svg')] bg-[length:100px_100px]" />

            {nearbyNpc && !interactionTarget && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-zinc-950/90 text-white px-6 py-3 rounded-lg border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.15)] z-20 flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-white/10 text-white font-bold rounded">E</div>
                    <div>
                        <div className="text-xs text-zinc-400 uppercase tracking-widest">TALK TO</div>
                        <div className="font-bold text-lg">{nearbyNpc.name}</div>
                    </div>
                </div>
            )}

            {interactionTarget && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-zinc-950/90 text-white px-6 py-3 rounded-lg border border-coalition-blue shadow-[0_0_20px_rgba(0,240,255,0.3)] animate-bounce z-20 flex items-center gap-3 prompt-pulse">
                    <div className="w-8 h-8 flex items-center justify-center bg-coalition-blue text-black font-bold rounded">E</div>
                    <div>
                        <div className="text-xs text-coalition-blue uppercase tracking-widest">
                            {interactionTarget.type === 'exit' ? 'TRAVEL TO' : 'ENTER'}
                        </div>
                        <div className="font-bold text-lg">{interactionTarget.label}</div>
                    </div>
                </div>
            )}

            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                style={{ width: 800 * mapScale, height: 600 * mapScale }}
                className="relative z-10 border border-border-main rounded-xl shadow-2xl bg-bg-panel/80 backdrop-blur-sm object-contain"
            />

            {isMobile && (
                <div className="absolute inset-0 z-30 pointer-events-none">
                    <div
                        className="absolute bottom-10 left-10 w-32 h-32 bg-white/5 rounded-full border border-white/10 pointer-events-auto flex items-center justify-center touch-none"
                        onTouchMove={(e) => {
                            const touch = e.touches[0];
                            const rect = e.currentTarget.getBoundingClientRect();
                            const cx = rect.left + rect.width / 2;
                            const cy = rect.top + rect.height / 2;
                            const dx = touch.clientX - cx;
                            const dy = touch.clientY - cy;
                            const maxDist = rect.width / 2;
                            const nx = dx / maxDist;
                            const ny = dy / maxDist;
                            const dir = { x: nx, y: ny };
                            setJoystickDir(dir);
                            joystickDirRef.current = dir;
                        }}
                        onTouchEnd={() => {
                            setJoystickDir(null);
                            joystickDirRef.current = null;
                        }}
                    >
                        <div className={clsx("w-12 h-12 bg-coalition-blue rounded-full shadow-glow-blue transition-transform", joystickDir ? "scale-110" : "scale-100 opacity-50")}
                            ref={(el) => {
                                if (el) {
                                    el.style.transform = joystickDir ? `translate(${joystickDir.x * 20}px, ${joystickDir.y * 20}px)` : 'none';
                                }
                            }} />
                    </div>

                    <button
                        onClick={() => {
                            if (interactionTargetRef.current) {
                                onAction(interactionTargetRef.current.action || 'view', interactionTargetRef.current.target);
                            }
                        }}
                        className={clsx("absolute bottom-12 right-12 w-20 h-20 rounded-full border-2 border-coalition-blue flex items-center justify-center font-black text-coalition-blue pointer-events-auto active:scale-90 transition-all", interactionTarget ? "bg-coalition-blue/20 scale-110" : "bg-black/40 opacity-30")}
                    >
                        ACTION
                    </button>
                </div>
            )}

            <div className="absolute inset-0 z-15 pointer-events-none flex items-center justify-center">
                <div
                    className="relative w-[800px] h-[600px] pointer-events-none"
                    style={{ transform: `scale(${mapScale})` }}
                >
                    {mapData.buildings.map((b, i) => (
                        <button
                            key={i}
                            onClick={() => onAction(b.action || 'view', b.target)}
                            ref={(el) => {
                                if (el) {
                                    el.style.position = 'absolute';
                                    el.style.left = `${b.x}px`;
                                    el.style.top = `${b.y}px`;
                                    el.style.width = `${b.w}px`;
                                    el.style.height = `${b.h}px`;
                                }
                            }}
                            className="pointer-events-auto bg-transparent border-none cursor-pointer group focus:outline-none"
                            aria-label={`Enter ${b.label || 'Building'}`}
                        >
                            <div className="w-full h-full border-2 border-transparent group-hover:border-coalition-blue/20 group-focus:border-coalition-blue/50 transition-all rounded-sm" />
                        </button>
                    ))}
                </div>
            </div>

            <div className="hidden md:block absolute top-4 left-4 z-20 bg-black/60 backdrop-blur border border-border-soft p-4 rounded-lg text-text-muted text-xs font-mono shadow-xl">
                <div className="font-bold text-white mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    SYSTEM_ONLINE
                </div>
                <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4"><span>MOVEMENT</span> <span className="text-white">WASD</span></div>
                    <div className="flex items-center justify-between gap-4"><span>INTERACT</span> <span className="text-coalition-blue">E</span></div>
                </div>
            </div>
        </div>
    );
};
