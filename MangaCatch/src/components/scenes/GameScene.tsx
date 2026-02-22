import React, { useEffect } from 'react';
import { useGameLoop } from '../../hooks/useGameLoop';
import type { SceneType } from '../../types/game';
import { CoverImage } from '../CoverImage';

export const GameScene: React.FC<{
    scene: SceneType;
    playerX: number;
    speedMultiplier: number;
    playerCount: number;
    onEnd: (score: number, catchCounts: Record<string, number>) => void;
    onCreateParticles: (x: number, y: number) => void;
}> = ({ scene, playerX, speedMultiplier, playerCount, onEnd, onCreateParticles }) => {
    const { items, score, timer, isHit, catchCount } = useGameLoop(scene, playerX, speedMultiplier, onCreateParticles);

    useEffect(() => {
        if (scene === 'GAME' && timer <= 0) onEnd(score, catchCount.current);
    }, [scene, timer, score, onEnd, catchCount]);

    const total = 30;
    const ratio = Math.max(0, Math.min(1, timer / total));

    const basketW = 220;
    const basketH = 90;
    const basketY = window.innerHeight - 80;

    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
            {/* HUD */}
            <div style={{ position: 'absolute', left: 20, top: 16, zIndex: 20, fontFamily: 'monospace', color: '#00eebb' }}>
                <div style={{ fontSize: 18 }}>SCORE: {score}</div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>PLAYERS: {playerCount} / SPEED x{speedMultiplier.toFixed(2)}</div>
            </div>

            {/* バータイマー */}
            <div style={{ position: 'absolute', left: 20, right: 20, top: 62, height: 14, borderRadius: 10, border: '1px solid rgba(0,238,187,0.8)', background: 'rgba(0,0,0,0.35)', zIndex: 20 }}>
                <div style={{ width: `${ratio * 100}%`, height: '100%', borderRadius: 10, background: 'rgba(0,238,187,0.85)', transition: 'width 120ms linear' }} />
            </div>
            <div style={{ position: 'absolute', right: 22, top: 82, fontFamily: 'monospace', fontSize: 14, color: '#00eebb', opacity: 0.9, zIndex: 20 }}>
                TIME: {timer.toFixed(1)}
            </div>

            {/* 落下キャラ */}
            {items.map((item) => (
                <CoverImage
                    key={item.id}
                    char={item.char}
                    style={{
                        position: 'absolute',
                        left: item.x,
                        top: item.y,
                        width: 170,
                        height: 170,
                        transform: 'translate(-50%, -50%)',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.6))',
                        pointerEvents: 'none',
                    }}
                />
            ))}

            {/* カゴ */}
            <div
                style={{
                    position: 'absolute',
                    left: playerX,
                    top: basketY,
                    width: basketW,
                    height: basketH,
                    transform: 'translate(-50%, -50%)',
                    borderRadius: 18,
                    border: '3px solid rgba(0,238,187,0.9)',
                    background: 'rgba(0,0,0,0.25)',
                    boxShadow: isHit ? '0 0 35px rgba(0,238,187,0.9)' : '0 0 10px rgba(0,0,0,0.4)',
                    transition: 'box-shadow 120ms linear',
                }}
            />
        </div>
    );
};