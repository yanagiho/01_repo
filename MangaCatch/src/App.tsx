import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

import type { SceneType, RankingEntry } from './types/game';
import { SceneManager } from './game/scenes';
import { getCharacterById } from './constants/master';

function loadRankingToday(): RankingEntry[] {
  const key = `mangacatch_ranking_${new Date().toLocaleDateString()}`;
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as RankingEntry[];
  } catch {
    return [];
  }
}

const App: React.FC = () => {
  const { playerCount, speedMultiplier, playerX } = useSensor(); // ←センサーは現状のまま
  const { particles, createParticles } = useParticles();

  const [sceneMgr] = useState(() => new SceneManager());

  const [scene, setScene] = useState<SceneType>('TITLE');
  const [wipeTrigger, setWipeTrigger] = useState(false);
  const [pendingScene, setPendingScene] = useState<SceneType | null>(null);

  const [rankingData, setRankingData] = useState<RankingEntry[]>([]);

  const bestChar = useMemo(() => {
    if (!sceneMgr.bestCharId) return null;
    return getCharacterById(sceneMgr.bestCharId) ?? null;
  }, [sceneMgr.bestCharId, scene]);

  const startWipeTo = useCallback((next: SceneType) => {
    setPendingScene(next);
    setWipeTrigger(true);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      sceneMgr.update(0.016);

      if (sceneMgr.currentScene !== scene && !wipeTrigger && !pendingScene) {
        startWipeTo(sceneMgr.currentScene);
      }
    }, 16);

    return () => window.clearInterval(interval);
  }, [sceneMgr, scene, wipeTrigger, pendingScene, startWipeTo]);

  const onWipeMiddle = () => {
    if (!pendingScene) return;

    setScene(pendingScene);

    // RANKINGに入る瞬間にロード
    if (pendingScene === 'RANKING') {
      setRankingData(loadRankingToday());
    }

    setPendingScene(null);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', color: 'white', position: 'relative', overflow: 'hidden', cursor: 'none' }}>
      <StarBackground />

      <ScreentoneWipe
        trigger={wipeTrigger}
        onMiddle={onWipeMiddle}
        onComplete={() => setWipeTrigger(false)}
      />

      {/* パーティクル */}
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

      {/* シーン */}
      {scene === 'TITLE' && (
        <TitleScene onStart={() => sceneMgr.finishTutorial()} />
      )}

      {scene === 'TUTORIAL_VIDEO' && (
        <TutorialVideoScene
          onEnded={() => {
            sceneMgr.finishTutorial();
            if (!wipeTrigger && !pendingScene) startWipeTo('GAME');
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
            sceneMgr.finishGame(score, counts);
            if (!wipeTrigger && !pendingScene) startWipeTo('RESULT');
          }}
        />
      )}

      {scene === 'RESULT' && <ResultScene score={sceneMgr.score} />}

      {scene === 'RECOMMEND' && <RecommendScene bestChar={bestChar} />}

      {scene === 'PHOTO' && <PhotoScene bestChar={bestChar} score={sceneMgr.score} />}

      {scene === 'RANKING' && <RankingScene ranking={rankingData} />}

      {/* デバッグ */}
      <div style={{ position: 'absolute', top: 6, left: 6, fontSize: 10, color: 'lime', zIndex: 200, fontFamily: 'monospace' }}>
        Scene: {scene} / Players: {playerCount} / Speed: x{speedMultiplier.toFixed(2)}
      </div>
    </div>
  );
};

export default App;