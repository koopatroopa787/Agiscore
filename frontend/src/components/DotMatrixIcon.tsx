import React, { useEffect, useRef } from 'react';

interface DotMatrixIconProps {
    type: 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'loading' | 'active';
    size?: number;
}

const DotMatrixIcon: React.FC<DotMatrixIconProps> = ({ type, size = 64 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const gridSize = 16;
        const dotGap = size / gridSize;
        const dotRadius = dotGap * 0.3;

        const draw = (time: number) => {
            ctx.clearRect(0, 0, size, size);
            ctx.fillStyle = '#FFFFFF';

            for (let x = 0; x < gridSize; x++) {
                for (let y = 0; y < gridSize; y++) {
                    let opacity = 0.1;

                    // Logic based on type
                    if (type === 'active') {
                        const dist = Math.sqrt(Math.pow(x - 7.5, 2) + Math.pow(y - 7.5, 2));
                        const pulse = Math.sin(time / 500 - dist / 2) * 0.5 + 0.5;
                        if (dist < 6) opacity = 0.2 + pulse * 0.8;
                    } else if (type === 'loading') {
                        const angle = Math.atan2(y - 7.5, x - 7.5);
                        const rotation = (time / 1000) % (Math.PI * 2);
                        const diff = (angle - rotation + Math.PI * 2) % (Math.PI * 2);
                        if (diff < 1) opacity = 0.8;
                        else opacity = 0.1;
                    } else {
                         // Default status dots
                         opacity = 0.15 + Math.sin(time/1000 + x*0.5 + y*0.5) * 0.05;
                    }

                    ctx.globalAlpha = opacity;
                    ctx.beginPath();
                    ctx.arc(
                        x * dotGap + dotGap / 2,
                        y * dotGap + dotGap / 2,
                        dotRadius,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        animationFrameId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animationFrameId);
    }, [type, size]);

    return (
        <div className="dot-matrix-container">
            <div className="glow" />
            <canvas 
                ref={canvasRef} 
                width={size} 
                height={size} 
                style={{ width: size, height: size }}
            />
        </div>
    );
};

export default DotMatrixIcon;
