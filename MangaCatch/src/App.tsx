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
// マネージャー・型
import { SceneManager, type SceneType } from './game/scenes';
import type { RankingEntry } from './types/game';

const App: React.FC = () => {
  const [scene, setScene] = useState<SceneType>('TITLE');
  const [wipeTrigger, setWipeTrigger] = useState(false);
  const [pendingScene, setPendingScene] = useState<SceneType | null>(null);

  // センサー＆フォールバック入力
  const { playerCount, speedMultiplier, playerX } = useSensor();

  // パーティクル（全シーン共通で手前に表示するためAppで持つ）
  const { particles, createParticles } = useParticles();

  // マネージャーインスタンス
  // マネージャーインスタンス（シングルトンではなく単一インスタンスとして保持する）
  // 以前の元の実装にgetInstance()がなかったので、Reactのstateやref、あるいは外側でnewしておくのが一般的。
  // ここでは外側で1度だけ生成するか、useMemoなどで持つ
  const [sceneMgr] = useState(() => new SceneManager());

  // デバッグ用のランキングデータ（SceneManagerが管理するが、表示用に取得する必要あり）
  // SceneManagerが内部でlocalStorage保存までやってくれるようになったので、
  // RankingScene表示時にロードすれば良い。ここでは簡易的にstateで持つか、SceneManagerから取得するか。
  const [rankingData, setRankingData] = useState<RankingEntry[]>([]);

  // シーン遷移ハンドラ
  const handleSceneChange = useCallback((nextScene: SceneType) => {
    if (nextScene === 'RANKING') {
      // ランキングデータのロード (LocalStorageから)
      const today = new Date().toLocaleDateString();
      const key = `mangacatch_ranking_${today}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        // RankingEntry型に合わせるためマッピングが必要かもしれないが、
        // 一旦単純な数値配列として保存されているのであれば、RankingScene側で対応が必要
        // 今回はRankingSceneをanyで逃げているのでそのまま渡す
        setRankingData(JSON.parse(raw).map((s: number) => ({ score: s, id: 'unknown', achieved_at: 0 })));
      }
    }
    setPendingScene(nextScene);
    setWipeTrigger(true);
  }, []);

  // 初期化 & SceneManager購読
  useEffect(() => {
    // SceneManagerの更新ループを開始（必要なら）
    // 現在のSceneManagerはupdate(deltaTime)を外部から呼ばれるのを待っているか、
    // あるいは内部でタイマーを持たせるか。
    // refactoring前のApp.tsxでは `SceneManager.update` を呼んでいなかったようだが、
    // `src/game/scenes.ts` には `update` メソッドがある。
    // 簡易的に setInterval で回す。
    const interval = setInterval(() => {
      sceneMgr.update(0.016);

      // SceneManagerのシーンとReactのシーンが食い違っていたら同期
      if (sceneMgr.currentScene !== scene) {
        // ワイプ中（pendingSceneがある）なら待つ、そうでなければ即同期
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
      // SceneManager側も同期（もしずれていれば）
      sceneMgr.currentScene = pendingScene;
      setPendingScene(null);
    }
  };

  // ゲーム終了時のコールバック
  const onGameEnd = (endScore: number, counts: Record<string, number>) => {
    sceneMgr.score = endScore;
    sceneMgr.catchCounts = counts;
    // マネージャーのupdateで自動的に次へ遷移するはずだが、
    // 即座に遷移させたい場合はここでも呼べる
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

      {/* デバッグ表示 */}
      <div style={{ position: 'absolute', top: 5, left: 5, fontSize: '10px', color: 'lime', zIndex: 100 }}>
        Scene: {scene} <br />
        Players: {playerCount} (Speed x{speedMultiplier.toFixed(1)})
      </div>
    </div>
  );
};

export default App;