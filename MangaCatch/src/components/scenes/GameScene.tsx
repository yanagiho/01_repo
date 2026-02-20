import React, { useEffect } from 'react';
import { useGameLoop } from '../../hooks/useGameLoop';
import type { SceneType } from '../../game/scenes';

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
    onEnd,
    onCreateParticles
}) => {
    // GameLoopフックを使用
    const { items, score, timer, isHit, catchCount } = useGameLoop(
        scene,
        playerX,
        speedMultiplier,
        onCreateParticles
    );

    // タイマー終了監視
    useEffect(() => {
        if (scene === 'GAME' && timer <= 0) {
            onEnd(score, catchCount.current);
        }
    }, [scene, timer, onEnd, score]);

    return (
        <>
            {/* ゲームメイン描画 */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                {items.map(item => (
                    <img
                        key={item.id}
                        src={`/assets/characters/${item.char.id}.png`}
                        style={{
                            position: 'absolute',
                            left: item.x,
                            top: item.y,
                            width: '225px', // 150 * 1.5
                            height: '225px',
                            transform: 'translateX(-50%)' // 中心基準
                        }}
                    />
                ))}

                {/* プレイヤー（カゴ） */}
                <div style={{
                    position: 'absolute',
                    left: playerX,
                    bottom: '80px',
                    width: '180px',
                    height: '90px',
                    transform: 'translateX(-50%)',
                    filter: isHit ? 'brightness(3) drop-shadow(0 0 20px white)' : 'none'
                }}>
                    <div style={{ width: '100%', height: '100%', border: '5px solid cyan', borderTop: 'none', borderRadius: '0 0 100px 100px', boxShadow: '0 5px 20px cyan' }} />
                </div>
            </div>

            {/* UIレイヤー */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '20px', right: '30px', fontSize: '2.5rem', fontWeight: 'bold' }}>SCORE: {score}</div>
                <div style={{ position: 'absolute', top: '30px', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '35px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', overflow: 'hidden' }}>
                    <div style={{ width: `${(timer / 30) * 100}%`, height: '100%', background: timer < 5 ? 'red' : '#00eebb' }} />
                </div>
            </div>
        </>
    );
};
