import React, { useState, useEffect, useCallback } from 'react';
import { StarBackground } from './components/StarBackground';
import { ScreentoneWipe } from './components/ScreentoneWipe';

// フック
import { useParticles } from './hooks/useParticles';
import { useSensor } from './hooks/useSensor';

// シーンコンポーネント
import { TitleScene } from './components/scenes/TitleScene';
import { TutorialScene } from './components/scenes/TutorialScene';
import { GameScene } from './components/scenes/GameScene';
import { ResultScene } from './components/scenes/ResultScene';
import { RecommendScene } from './components/scenes/RecommendScene';
import { PhotoScene } from './components/scenes/PhotoScene';
import { RankingScene } from './components/scenes/RankingScene';

// マネージャー・型
import { SceneManager, type SceneType } from './game/scenes';
import type { RankingEntry } from './types/game';
import { CHARACTER_MAP } from './constants/master';
import { validateAllAssets } from './game/assetValidator';

// 起動時にアセット検証（欠損があればconsole.warnで報告）
if (import.meta.env.DEV) {
  validateAllAssets();
}

const App: React.FC = () => {
  const [scene, setScene] = useState<SceneType>('TITLE');
  const [wipeTrigger, setWipeTrigger] = useState(false);
  const [pendingScene, setPendingScene] = useState<SceneType | null>(null);

  // センサー＆フォールバック入力
  const { playerCount, speedMultiplier, playerX } = useSensor();

  // パーティクル（全シーン共通で手前に表示するためAppで持つ）
  const { particles, createParticles } = useParticles();

  // マネージャーインスタンス
  const [sceneMgr] = useState(() => new SceneManager());

  // ランキングデータ（表示用）
  const [rankingData, setRankingData] = useState<RankingEntry[]>([]);

  // シーン遷移ハンドラ
  const handleSceneChange = useCallback((nextScene: SceneType) => {
    if (nextScene === 'RANKING') {
      const today = new Date().toLocaleDateString();
      const key = `mangacatch_ranking_${today}`;
      const raw = localStorage.getItem(key);

      if (raw) {
        try {
          const parsed: unknown = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const normalized: RankingEntry[] = parsed.map((entry: any) => {
              // 旧形式（number[]）
              if (typeof entry === 'number') {
                return {
                  total_score: entry,
                  rarity_sum: 0,
                  achieved_at: 0,
                  bestCharId: null,
                };
              }

              // 新形式（{score, bestCharId, achieved_at} 等）
              const score = typeof entry.total_score === 'number'
                ? entry.total_score
                : (typeof entry.score === 'number' ? entry.score : 0);

              return {
                total_score: score,
                rarity_sum: 0,
                achieved_at: typeof entry.achieved_at === 'number' ? entry.achieved_at : 0,
                bestCharId: typeof entry.bestCharId === 'string' ? entry.bestCharId : null,
              };
            });

            setRankingData(normalized);
          } else {
            setRankingData([]);
          }
        } catch {
          setRankingData([]);
        }
      } else {
        setRankingData([]);
      }
    }

    setPendingScene(nextScene);
    setWipeTrigger(true);
  }, []);

  // SceneManager購読
  useEffect(() => {
    const interval = setInterval(() => {
      sceneMgr.update(0.016);

      if (sceneMgr.currentScene !== scene) {
        if (!wipeTrigger && !pendingScene) {
          handleSceneChange(sceneMgr.currentScene);
        }
      }
    }, 16);

    return () => clearInterval(interval);
  }, [scene, sceneMgr, wipeTrigger, pendingScene, handleSceneChange]);

  // ワイプ完了時
  const onWipeMiddle = () => {
    if (pendingScene) {
      setScene(pendingScene);
      sceneMgr.currentScene = pendingScene;
      setPendingScene(null);
    }
  };

  // ゲーム終了時
  const onGameEnd = (endScore: number, counts: Record<string, number>) => {
    sceneMgr.score = endScore;
    sceneMgr.catchCounts = counts;
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', color: 'white', position: 'relative', overflow: 'hidden', cursor: 'none' }}>
      <StarBackground />

      <ScreentoneWipe
        trigger={wipeTrigger}
        onMiddle={onWipeMiddle}
        onComplete={() => setWipeTrigger(false)}
      />

      {/* パーティクル描画 */}
      {particles.map(p => (
        <div key={p.id} style={{ position: 'absolute', left: p.x, top: p.y, width: p.size, height: p.size, backgroundColor: p.color, borderRadius: '50%', opacity: p.life, transform: 'translate(-50%, -50%)', zIndex: 20 }} />
      ))}

      {/* シーンレンダリング */}
      {scene === 'TITLE' && <TitleScene onStart={() => sceneMgr.triggerStart()} />}
      {scene === 'TUTORIAL' && <TutorialScene onSkip={() => sceneMgr.currentScene = 'GAME'} />}
      {scene === 'GAME' && (
        <GameScene
          scene={scene}
          playerX={playerX}
          speedMultiplier={speedMultiplier}
          playerCount={playerCount}
          onEnd={onGameEnd}
          onCreateParticles={createParticles}
        />
      )}
      {scene === 'RESULT' && <ResultScene />}
      {scene === 'RECOMMEND' && <RecommendScene bestChar={sceneMgr.bestCharacter} />}
      {scene === 'PHOTO' && <PhotoScene bestChar={sceneMgr.bestCharacter} />}
      {scene === 'RANKING' && <RankingScene ranking={rankingData} />}

      {/* デバッグ表示（常時: シーン・プレイヤー情報） */}
      <div style={{ position: 'absolute', top: 5, left: 5, fontSize: '10px', color: 'lime', zIndex: 100 }}>
        Scene: {scene} <br />
        Players: {playerCount} (Speed x{speedMultiplier.toFixed(1)})
      </div>

      {/* 開発時デバッグ: マスタ確認 */}
      {import.meta.env.DEV && scene === 'TITLE' && (
        <button
          onClick={() => {
            console.table(
              Array.from(CHARACTER_MAP.values()).map(c => ({
                no: c.no, id: c.id, name: c.name, artist: c.artist,
                work: c.work, charImg: c.characterImage, cover: c.workImage, attach: c.attachmentFile,
              }))
            );
          }}
          style={{
            position: 'absolute', bottom: 10, right: 10, zIndex: 200,
            padding: '4px 8px', fontSize: '10px', background: '#333', color: '#0f0',
            border: '1px solid #0f0', cursor: 'pointer'
          }}
        >
          [DEV] マスタ確認
        </button>
      )}
    </div>
  );
};

export default App;