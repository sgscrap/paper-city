
import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

interface Player {
    id: string;
    x: number;
    y: number;
    mapId: string;
    ws: WebSocket;
}

const players: Map<string, Player> = new Map();

console.log('📡 Signal Tower Online on port 8080');

wss.on('connection', (ws) => {
    const id = Math.random().toString(36).substr(2, 9);
    console.log(`Player connected: ${id}`);

    // Send initial ID to the player
    ws.send(JSON.stringify({ type: 'WELCOME', id }));

    // Send existing players to new player
    const existingPlayers = Array.from(players.values()).map(p => ({
        id: p.id,
        x: p.x,
        y: p.y,
        mapId: p.mapId
    }));
    ws.send(JSON.stringify({ type: 'CURRENT_PLAYERS', players: existingPlayers }));

    // Init player state
    players.set(id, { id, x: 250, y: 250, mapId: 'the_block', ws });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());

            if (data.type === 'MOVE') {
                const player = players.get(id);
                if (player) {
                    player.x = Number(data.x) || 0;
                    player.y = Number(data.y) || 0;
                    player.mapId = typeof data.mapId === 'string' ? data.mapId : player.mapId;

                    // Broadcast to others
                    broadcast({
                        type: 'PLAYER_MOVED',
                        id,
                        x: player.x,
                        y: player.y,
                        mapId: player.mapId
                    }, id);
                }
            }
        } catch (e) {
            console.error('Invalid message:', e);
        }
    });

    ws.on('close', () => {
        console.log(`Player disconnected: ${id}`);
        players.delete(id);
        broadcast({ type: 'PLAYER_LEFT', id });
    });
});

function broadcast(data: unknown, excludeId?: string) {
    const message = JSON.stringify(data);
    players.forEach(player => {
        if (player.id !== excludeId && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(message);
        }
    });
}
