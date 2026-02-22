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

  // マネージャーインスタンス（シングルトンではなく単一インスタンスとして保持する）
  const [sceneMgr] = useState(() => new SceneManager());

  // ランキングデータ（表示用）
  const [rankingData, setRankingData] = useState<RankingEntry[]>([]);

  // シーン遷移ハンドラ
  const handleSceneChange = useCallback((nextScene: SceneType) => {
    if (nextScene === 'RANKING') {
      // ランキングデータのロード (LocalStorageから)
      const today = new Date().toLocaleDateString();
      const key = `mangacatch_ranking_${today}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed: unknown[] = JSON.parse(raw);
          // 旧形式（number[]）の場合は id を保持できないため unknownキャラに
          setRankingData(
            parsed.map((entry: unknown) => {
              if (typeof entry === 'number') {
                // 旧形式: スコアのみ保存されていた
                return { total_score: entry, rarity_sum: 0, achieved_at: 0, bestCharId: null } as RankingEntry & { bestCharId: null };
              }
              // 新形式: { score, bestCharId, achieved_at } オブジェクト
              const e = entry as { score?: number; total_score?: number; bestCharId?: string; achieved_at?: number };
              return {
                total_score: e.total_score ?? e.score ?? 0,
                rarity_sum: 0,
                achieved_at: e.achieved_at ?? 0,
                bestCharId: e.bestCharId ?? null,
              } as RankingEntry & { bestCharId: string | null };
            })
          );
        } catch {
          setRankingData([]);
        }
      }
    }
    setPendingScene(nextScene);
    setWipeTrigger(true);
  }, []);

  // 初期化 & SceneManager購読
  useEffect(() => {
    const interval = setInterval(() => {
      sceneMgr.update(0.016);

      // SceneManagerのシーンとReactのシーンが食い違っていたら同期
      if (sceneMgr.currentScene !== scene) {
        if (!wipeTrigger && !pendingScene) {
          handleSceneChange(sceneMgr.currentScene);
        }
      }
    }, 16);

    return () => clearInterval(interval);
  }, [scene, sceneMgr, wipeTrigger, pendingScene, handleSceneChange]);

  // ワイプ完了時の処理
  const onWipeMiddle = () => {
    if (pendingScene) {
      setScene(pendingScene);
      sceneMgr.currentScene = pendingScene;
      setPendingScene(null);
    }
  };

  // ゲーム終了時のコールバック
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

      {/* 開発時デバッグ: CHARACTER_MAP の確認ボタン */}
      {import.meta.env.DEV && scene === 'TITLE' && (
        <button
          onClick={() => {
            console.table(
              Array.from(CHARACTER_MAP.values()).map(c => ({
                no: c.no, id: c.id, name: c.name, artist: c.artist,
                work: c.work, charImg: c.characterImage, cover: c.workImage,
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