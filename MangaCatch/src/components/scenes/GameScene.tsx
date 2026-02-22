import React, { useEffect } from 'react';
import { useGameLoop } from '../../hooks/useGameLoop';
import type { SceneType } from '../../game/scenes';
import { CharacterImage } from '../CharacterImage';

interface GameSceneProps {
    scene: SceneType; // useGameLoopに渡すため
    playerX: number;
    speedMultiplier: number;
    playerCount: number;
    onEnd: (score: number, catchCounts: Record<string, number>) => void;

    // エフェクト用コールバック
    onCreateParticles: (x: number, y: number) => void;
}

export const GameScene: React.FC<GameSceneProps> = ({
    scene,
    playerX,
    speedMultiplier,
    playerCount,
    onEnd,
    onCreateParticles,
}) => {
    const { items, score, timer, isHit, catchCount } = useGameLoop(
        scene,
        playerX,
        speedMultiplier,
        onCreateParticles
    );

    // タイマー終了監視
    useEffect(() => {
        if (scene === 'GAME' && timer <= 0) {
            onEnd(score, catchCount.current as Record<string, number>);
        }
    }, [scene, timer, onEnd, score, catchCount]);

    // 画面下のカゴ（画像が無くても動くようにdivで表現）
    const basketW = 220;
    const basketH = 90;
    const basketY = window.innerHeight - 80;

    return (
        <div style={{ position: 'absolute', inset: 0 }}>
            {/* 落下キャラ */}
            {items.map((item) => (
                <CharacterImage
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

            {/* プレイヤー（カゴ） */}
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
            >
                {/* ヒット時フラッシュ */}
                {isHit && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: -8,
                            borderRadius: 22,
                            border: '2px solid rgba(255,255,255,0.8)',
                        }}
                    />
                )}
            </div>

            {/* UI */}
            <div
                style={{
                    position: 'absolute',
                    left: 20,
                    top: 16,
                    fontFamily: 'monospace',
                    fontSize: 20,
                    color: '#00eebb',
                    textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                    zIndex: 100,
                }}
            >
                <div>SCORE: {score}</div>
                <div>TIME: {Math.max(0, timer).toFixed(1)}</div>
                <div>PLAYERS: {playerCount} / SPEED x{speedMultiplier.toFixed(2)}</div>
            </div>
        </div>
    );
};