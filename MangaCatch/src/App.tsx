import React, { useEffect, useState, useRef } from 'react';
import { SceneType, PlayerState } from './types/game';
import { SCREEN_WIDTH, SCREEN_HEIGHT, DEFAULT_RING_RADIUS } from './constants/game';
import { AssetManager } from './game/assets';
import { InputManager } from './game/input';
import { SceneManager } from './game/scenes';
import { PlayerManager } from './game/players';

// 仮シーンコンポーネント
const SceneContainer: React.FC<{ scene: SceneType }> = ({ scene }) => {
    return (
        <div style={{ padding: 60, height: '100%', boxSizing: 'border-box' }}>
            <h1 style={{ fontSize: 120, margin: 0, opacity: 0.2 }}>{scene}</h1>
            <div style={{ marginTop: 40 }}>
                {scene === 'TITLE' && <h2>Touch to Start</h2>}
                {scene === 'TUTORIAL_VIDEO' && <h2>Watching Tutorial...</h2>}
                {scene === 'COUNTDOWN' && <h1 style={{ fontSize: 200, textAlign: 'center' }}>3... 2... 1...</h1>}
                {scene === 'PLAY' && <h2>GAME START! Catch the characters!</h2>}
                {scene === 'RESULT' && <h2>Final Score: 1250</h2>}
                {scene === 'RECOMMEND' && <h2>You caught these!</h2>}
                {scene === 'PHOTO_TIME' && <h2>Smile! PHOTO TIME</h2>}
                {scene === 'DAILY_RANKING' && <h2>Top 30 Today</h2>}
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [currentScene, setCurrentScene] = useState<SceneType>(SceneManager.getInstance().getCurrentScene());
    const [isReady, setIsReady] = useState(false);
    const [players, setPlayers] = useState<PlayerState[]>([]);
    const requestRef = useRef<number>();

    useEffect(() => {
        const init = async () => {
            await AssetManager.getInstance().loadManifest();
            setIsReady(true);

            SceneManager.getInstance().setCallback((scene) => {
                setCurrentScene(scene);
            });
        };
        init();

        const loop = () => {
            InputManager.getInstance().update();
            SceneManager.getInstance().update();
            setPlayers([...PlayerManager.getInstance().getPlayers()]);
            requestRef.current = requestAnimationFrame(loop);
        };
        requestRef.current = requestAnimationFrame(loop);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const handleInteraction = () => {
        if (currentScene === 'TITLE') {
            SceneManager.getInstance().triggerStart();
        }
    };

    if (!isReady) {
        return <div style={{ color: 'white', backgroundColor: '#000', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading MangaCatch...</div>;
    }

    return (
        <div
            onClick={handleInteraction}
            style={{
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT,
                backgroundColor: '#000',
                color: '#fff',
                overflow: 'hidden',
                position: 'relative',
                cursor: currentScene === 'TITLE' ? 'pointer' : 'none',
                fontFamily: 'sans-serif',
            }}
        >
            {/* シーン内容 */}
            <SceneContainer scene={currentScene} />

            {/* プレイヤ（リング）- TITLE以外のシーンで表示 */}
            {currentScene !== 'TITLE' && currentScene !== 'TUTORIAL_VIDEO' && players.map(p => p.active && (
                <div
                    key={p.id}
                    style={{
                        position: 'absolute',
                        left: p.x,
                        top: p.y,
                        width: DEFAULT_RING_RADIUS * 2,
                        height: DEFAULT_RING_RADIUS * 2,
                        border: `6px solid ${p.id === 1 ? '#0ff' : p.id === 2 ? '#f0f' : '#ff0'}`,
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        transition: 'none',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 0 30px rgba(255,255,255,0.4)',
                        zIndex: 1000,
                    }}
                >
                    <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: '20%',
                        height: '20%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: 24,
                        fontWeight: 'bold'
                    }}>
                        {p.id}
                    </div>
                </div>
            ))}

            {/* デバッグ情報 */}
            <div style={{ position: 'absolute', bottom: 20, right: 20, color: '#444', fontSize: 12 }}>
                MangaCatch Re-implementation Phase 1 | Sensor Status: {players.filter(p => p.active).length > 0 ? 'Active' : 'Waiting'}
            </div>
        </div>
    );
};

export default App;
