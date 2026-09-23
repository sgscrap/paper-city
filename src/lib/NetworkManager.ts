
type NetworkEventCallback = (data: unknown) => void;

class NetworkManager {
    private static instance: NetworkManager;
    private socket: WebSocket | null = null;
    private listeners: Record<string, NetworkEventCallback[]> = {};
    public playerId: string | null = null;
    public isConnected = false;

    private constructor() { }

    static getInstance(): NetworkManager {
        if (!NetworkManager.instance) {
            NetworkManager.instance = new NetworkManager();
        }
        return NetworkManager.instance;
    }

    connect(url: string = 'ws://localhost:8080') {
        if (this.socket?.readyState === WebSocket.OPEN) return;

        console.log('Connecting to Signal Tower...');
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log('Connected to Signal Tower');
            this.isConnected = true;
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.emit(data.type, data);

                if (data.type === 'WELCOME') {
                    this.playerId = data.id;
                }
            } catch (e) {
                console.error('Failed to parse network message', e);
            }
        };

        this.socket.onclose = () => {
            console.log('Disconnected from Signal Tower');
            this.isConnected = false;
            this.socket = null;
            // Retry logic could go here
        };
    }

    sendMove(x: number, y: number, mapId: string) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'MOVE', x, y, mapId }));
        }
    }

    on(event: string, callback: NetworkEventCallback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    off(event: string, callback: NetworkEventCallback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    private emit(event: string, data: unknown) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }
}

export const networkManager = NetworkManager.getInstance();
