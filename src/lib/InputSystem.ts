export class InputSystem {
    private static instance: InputSystem | undefined;
    private keys: Set<string> = new Set();

    private constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.handleKeyDown);
            window.addEventListener('keyup', this.handleKeyUp);
        }
    }

    public static getInstance(): InputSystem {
        if (!InputSystem.instance) {
            InputSystem.instance = new InputSystem();
        }
        return InputSystem.instance;
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        this.keys.add(e.code);
    }

    private handleKeyUp = (e: KeyboardEvent) => {
        this.keys.delete(e.code);
    }

    public isPressed(code: string): boolean {
        return this.keys.has(code);
    }

    public getAxis(negative: string, positive: string): number {
        return (this.keys.has(positive) ? 1 : 0) - (this.keys.has(negative) ? 1 : 0);
    }

    public cleanup() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.handleKeyDown);
            window.removeEventListener('keyup', this.handleKeyUp);
        }
        InputSystem.instance = undefined;
    }
}
