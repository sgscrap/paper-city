export interface CharacterState {
    x: number;
    y: number;
    direction: number; // 0=down, 1=up, 2=left, 3=right
    isMoving: boolean;
    frame: number;
    color?: string; // Neon accent color (eyes/outline)
    flicker?: number;
}

export class CharacterRenderer {
    static draw(ctx: CanvasRenderingContext2D, state: CharacterState) {
        const { x, y, direction, isMoving, frame, color = '#6ddcff', flicker = 1 } = state;

        ctx.save();
        // The user requested: draw at (x - w/2, y - h/2) 
        // Our CharacterState x/y is already the center of the 20x20 player box in VisualMap.
        ctx.translate(x, y);

        // Constants for stick figure proportions
        const headRadius = 4;
        const bodyHeight = 10;
        const limbLength = 8;

        // Animation logic based on frame (0-3)
        // Convert frame index back to a phase for smooth oscillation in drawLimb if needed,
        // but let's stick to 4 distinct positions if we want that "lower fps" feel.
        const animationPhase = isMoving ? (frame / 4) * Math.PI * 2 : 0;
        const walkCycle = Math.sin(animationPhase);
        const bob = isMoving ? Math.abs(Math.sin(animationPhase * 2)) * 1.5 : 0;

        // --- DRAW SHADOW ---
        ctx.beginPath();
        ctx.ellipse(0, 15, 6, 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fill();

        // --- DRAW ARMS --- 
        // Arms swing opposite to legs
        const armAngle = walkCycle * 0.6;
        this.drawLimb(ctx, 0, -bodyHeight + 2 - bob, limbLength, (direction === 2 ? -1 : 1) * (0.1 + armAngle));
        this.drawLimb(ctx, 0, -bodyHeight + 2 - bob, limbLength, (direction === 2 ? 1 : -1) * (0.1 - armAngle));

        // --- DRAW LEGS ---
        const legAngle = walkCycle * 0.8;
        this.drawLimb(ctx, 0, 0, limbLength, 0.4 + legAngle);
        this.drawLimb(ctx, 0, 0, limbLength, -0.4 - legAngle);

        // --- DRAW BODY --- (Matte Black)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -bodyHeight - bob);
        ctx.strokeStyle = '#080808';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Subtile alignment outline
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.3 * flicker;
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // --- DRAW HEAD ---
        ctx.beginPath();
        ctx.arc(0, -bodyHeight - headRadius - 2 - bob, headRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#080808';
        ctx.fill();

        // Neon eyes or glowing ring around head
        ctx.shadowColor = color;
        ctx.shadowBlur = 6 * flicker;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.8 * flicker;
        ctx.beginPath();
        ctx.arc(0, -bodyHeight - headRadius - 2 - bob, headRadius * 0.9, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    private static drawLimb(
        ctx: CanvasRenderingContext2D,
        startX: number,
        startY: number,
        length: number,
        angle: number
    ) {
        ctx.save();
        ctx.translate(startX, startY);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, length);
        ctx.strokeStyle = '#080808';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.restore();
    }
}
