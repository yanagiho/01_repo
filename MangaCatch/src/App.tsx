import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StarBackground } from './components/StarBackground';
import { ScreentoneWipe } from './components/ScreentoneWipe';

import { useParticles } from './hooks/useParticles';
import { useSensor } from './hooks/useSensor';

import { TitleScene } from './components/scenes/TitleScene';
import { TutorialVideoScene } from './components/scenes/TutorialVideoScene';
import { GameScene } from './components/scenes/GameScene';
import { ResultScene } from './components/scenes/ResultScene';
import { RecommendScene } from './components/scenes/RecommendScene';
import { PhotoScene } from './components/scenes/PhotoScene';
import { RankingScene } from './components/scenes/RankingScene';

import type { RankingEntry } from './types/game';
import { SceneManager, type SceneType } from './game/scenes';
import { getCharacterById } from './constants/master';

function loadRankingToday(): RankingEntry[] {
  const key = `mangacatch_ranking_${new Date().toLocaleDateString()}`;
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RankingEntry[]) : [];
  } catch {
    return [];
  }
}

const App: React.FC = () => {
  // センサーはあなたの現状版を使用
  const { playerCount, speedMultiplier, playerX } = useSensor();
  const { particles, createParticles } = useParticles();

  const [sceneMgr] = useState(() => new SceneManager());

  const [scene, setScene] = useState<SceneType>('TITLE');
  const [wipeTrigger, setWipeTrigger] = useState(false);
  const [pendingScene, setPendingScene] = useState<SceneType | null>(null);
  const pendingRef = useRef<SceneType | null>(null);
  useEffect(() => { pendingRef.current = pendingScene; }, [pendingScene]);

  const [rankingData, setRankingData] = useState<RankingEntry[]>([]);

  // 遷移ロック（二重発火防止）
  const transitioningRef = useRef(false);

  const bestChar = (() => {
    const id = (sceneMgr as any).bestCharId as string | null;
    return id ? getCharacterById(id) ?? null : null;
  })();

  const goto = useCallback((next: SceneType) => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    setPendingScene(next);
    setWipeTrigger(true);
  }, []);

  // SceneManagerの時間遷移に追従
  useEffect(() => {
    const interval = window.setInterval(() => {
      sceneMgr.update(0.016);

      if (sceneMgr.currentScene !== scene) {
        if (!transitioningRef.current && !wipeTrigger && !pendingRef.current) {
          goto(sceneMgr.currentScene);
        }
      }
    }, 16);

    return () => window.clearInterval(interval);
  }, [sceneMgr, scene, wipeTrigger, goto]);

  // ★安定コールバック（ScreentoneWipeがrefで呼ぶ）
  const onWipeMiddle = useCallback(() => {
    const next = pendingRef.current;
    if (!next) return;

    setScene(next);
    sceneMgr.currentScene = next;

    if (next === 'RANKING') {
      setRankingData(loadRankingToday());
    }

    setPendingScene(null);
    pendingRef.current = null;
  }, [sceneMgr]);

  const onWipeComplete = useCallback(() => {
    setWipeTrigger(false);
    transitioningRef.current = false;
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', color: 'white', position: 'relative', overflow: 'hidden', cursor: 'none' }}>
      <StarBackground />

      <ScreentoneWipe trigger={wipeTrigger} onMiddle={onWipeMiddle} onComplete={onWipeComplete} />

      {/* particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: '#00eebb',
            opacity: p.life,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 30,
          }}
        />
      ))}

      {/* TITLE：クリック（将来センサー入力）必須 */}
      {scene === 'TITLE' && (
        <TitleScene
          onStart={() => {
            console.log('[App] Title start');
            sceneMgr.triggerStart();     // TITLE -> TUTORIAL_VIDEO
            goto('TUTORIAL_VIDEO');      // UIも確実に追従
          }}
        />
      )}

      {scene === 'TUTORIAL_VIDEO' && (
        <TutorialVideoScene
          onEnded={() => {
            console.log('[App] Tutorial ended');
            sceneMgr.finishTutorialVideo(); // -> GAME
            goto('GAME');
          }}
        />
      )}

      {scene === 'GAME' && (
        <GameScene
          scene={scene}
          playerX={playerX}
          speedMultiplier={speedMultiplier}
          playerCount={playerCount}
          onCreateParticles={createParticles}
          onEnd={(score, counts) => {
            console.log('[App] Game end');
            sceneMgr.finishGame(score, counts);
            goto('RESULT');
          }}
        />
      )}

      {scene === 'RESULT' && <ResultScene score={sceneMgr.score} />}
      {scene === 'RECOMMEND' && <RecommendScene bestChar={bestChar} />}
      {scene === 'PHOTO' && <PhotoScene bestChar={bestChar} score={sceneMgr.score} />}
      {scene === 'RANKING' && <RankingScene ranking={rankingData} />}

      {/* デバッグ（必ず表示） */}
      <div
        style={{
          position: 'fixed',
          top: 8,
          left: 8,
          zIndex: 20000,
          padding: '6px 8px',
          borderRadius: 8,
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid rgba(0,255,170,0.35)',
          fontFamily: 'monospace',
          fontSize: 12,
          color: '#00ffaa',
          pointerEvents: 'none',
        }}
      >
        UI:{scene} / MGR:{sceneMgr.currentScene} / wipe:{String(wipeTrigger)} / pending:{String(pendingScene)}
      </div>
    </div>
  );
};

export default App;