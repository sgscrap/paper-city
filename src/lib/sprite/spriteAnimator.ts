/**
 * spriteAnimator.ts
 * Handled the logic for selecting the current animation frame based on 
 * direction, velocity, and time.
 */

export type CharacterDirection = 0 | 1 | 2 | 3; // 0=down, 1=up, 2=left, 3=right

export interface AnimationConfig {
    fps: number;
    frameCount: number;
}

const WALK_CONFIG: AnimationConfig = {
    fps: 8, // Locked to 8 FPS as per MVP spec
    frameCount: 4
};

export class SpriteAnimator {
    /**
     * Calculates the current frame index for a walk cycle.
     * @param isMoving Whether the character is currently in motion.
     * @param elapsed Total elapsed time in milliseconds.
     * @returns Frame index [0 - (frameCount-1)]
     */
    static getWalkFrame(isMoving: boolean, elapsed: number): number {
        if (!isMoving) return 0; // Snap to idle (Frame 0) when stopping

        const frameDuration = 1000 / WALK_CONFIG.fps;
        return Math.floor(elapsed / frameDuration) % WALK_CONFIG.frameCount;
    }

    /**
     * Returns a normalized flicker value for lighting/glow effects.
     */
    static getPulse(time: number, speed: number = 2000): number {
        return 0.8 + Math.sin(time / (speed / (Math.PI * 2))) * 0.2;
    }
}
