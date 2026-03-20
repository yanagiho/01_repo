// MangaCatch/src/App.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StarBackground } from "./components/StarBackground";
import { ScreentoneWipe } from "./components/ScreentoneWipe";
import { ParticleCanvas } from "./components/ParticleCanvas";

import { useParticles } from "./hooks/useParticles";
import { useSensor } from "./hooks/useSensor";


import { TitleScene } from "./components/scenes/TitleScene";
import { TutorialVideoScene } from "./components/scenes/TutorialVideoScene"; // ※中身は「静止画+カウントダウン」に差し替え済み想定
import { GameScene } from "./components/scenes/GameScene";
import { ResultScene } from "./components/scenes/ResultScene";
import { RecommendScene } from "./components/scenes/RecommendScene";
import { PhotoScene } from "./components/scenes/PhotoScene";
import { RankingScene } from "./components/scenes/RankingScene";

import SensorDebugOverlay from "./components/SensorDebugOverlay";
import { AudioManager } from "./audio/AudioManager";
import { getCharacterById, getEnabledCharacters } from "./constants/master";
import type { RankingEntry, SceneType } from "./types/game";

// ★表示時間（ご要望：結果/フォト/ランキングは10秒）
const DUR_RESULT = 10000;
const DUR_RECOMMEND = 10000;
const DUR_PHOTO = 10000;
const DUR_RANKING = 10000;

function todayKey() {
  return `mangacatch_ranking_${new Date().toLocaleDateString()}`;
}

function loadRankingToday(): RankingEntry[] {
  const raw = localStorage.getItem(todayKey());
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RankingEntry[]) : [];
  } catch {
    return [];
  }
}

function saveRankingToday(entry: RankingEntry) {
  const list = loadRankingToday();
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  localStorage.setItem(todayKey(), JSON.stringify(list.slice(0, 30)));
}

function calcBestCharId(counts: Record<string, number>): string {
  let bestId = "";
  let best = -1;
  for (const [id, c] of Object.entries(counts)) {
    if (c > best) {
      best = c;
      bestId = id;
    }
  }
  if (bestId) return bestId;

  const pool = getEnabledCharacters();
  return pool[Math.floor(Math.random() * pool.length)].id;
}

export default function App() {
  const audio = AudioManager.instance;

  const { personCount, speedMultiplier, playerXs, sensorDebug } = useSensor();
  const { particlesRef, createParticles } = useParticles();

  const devScene = useMemo(() => {
    const p = new URLSearchParams(window.location.search).get("scene");
    return p ? (p.toUpperCase() as SceneType) : null;
  }, []);
  const [scene, setScene] = useState<SceneType>(devScene ?? "TITLE");

  // ワイプ
  const [wipeTrigger, setWipeTrigger] = useState(false);
  const pendingRef = useRef<SceneType | null>(null);
  const transitioningRef = useRef(false);

  // 結果
  const devCharId = useMemo(() => {
    return new URLSearchParams(window.location.search).get("charId") ?? "";
  }, []);
  const devScore = useMemo(() => {
    return parseInt(new URLSearchParams(window.location.search).get("score") ?? "90", 10);
  }, []);

  const [score, setScore] = useState(devScore);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [bestCharId, setBestCharId] = useState<string>(devCharId);

  // ランキング
  const [ranking, setRanking] = useState<RankingEntry[]>(() =>
    devScene === "RANKING" ? loadRankingToday() : []
  );
  const [highlightAchievedAt, setHighlightAchievedAt] = useState<number | undefined>(undefined);

  const bestChar = useMemo(() => (bestCharId ? getCharacterById(bestCharId) : null), [bestCharId]);

  // ★起動直後にBGMの自動再生を試す（可能なら最初から鳴る）
  useEffect(() => {
    audio.tryAutoplayUiBgm();
  }, [audio]);

  const goto = useCallback(
    (next: SceneType) => {
      if (transitioningRef.current) return;

      transitioningRef.current = true;
      pendingRef.current = next;
      setWipeTrigger(true);

      // 保険：ワイプが死んでも進む
      window.setTimeout(() => {
        if (pendingRef.current === next) {
          setScene(next);
          pendingRef.current = null;
          setWipeTrigger(false);
          transitioningRef.current = false;

          if (next === "GAME") audio.playBgm("game");
          else audio.playBgm("ui");

          if (next === "RANKING") setRanking(loadRankingToday());
        }
      }, 1700);
    },
    [audio]
  );

  const onWipeMiddle = useCallback(() => {
    const next = pendingRef.current;
    if (!next) return;

    setScene(next);
    pendingRef.current = null;

    if (next === "GAME") audio.playBgm("game");
    else audio.playBgm("ui");

    if (next === "RANKING") setRanking(loadRankingToday());
  }, [audio]);

  const onWipeComplete = useCallback(() => {
    setWipeTrigger(false);
    transitioningRef.current = false;
  }, []);

  // 自動遷移（TITLEは手動）
  useEffect(() => {
    if (scene === "RESULT") {
      const t = window.setTimeout(() => goto("RECOMMEND"), DUR_RESULT);
      return () => window.clearTimeout(t);
    }
    if (scene === "RECOMMEND") {
      const t = window.setTimeout(() => goto("PHOTO"), DUR_RECOMMEND);
      return () => window.clearTimeout(t);
    }
    if (scene === "PHOTO") {
      const t = window.setTimeout(() => {
        const achieved_at = Date.now();
        setHighlightAchievedAt(achieved_at);
        saveRankingToday({ score, bestCharId: bestCharId || "unknown", achieved_at });
        goto("RANKING");
      }, DUR_PHOTO);
      return () => window.clearTimeout(t);
    }
    if (scene === "RANKING") {
      const t = window.setTimeout(() => goto("TITLE"), DUR_RANKING);
      return () => window.clearTimeout(t);
    }
  }, [scene, goto, score, bestCharId]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        position: "relative",
        overflow: "hidden",
        cursor: "none",
        color: "#fff",
      }}
    >

      {!new URLSearchParams(window.location.search).has('screenshot') && <StarBackground />}
      <ScreentoneWipe trigger={wipeTrigger} onMiddle={onWipeMiddle} onComplete={onWipeComplete} />
      <SensorDebugOverlay debug={sensorDebug} visible={new URLSearchParams(window.location.search).has('debug')} />

      {/* particles: DOM divの代わりにcanvasで描画（パフォーマンス最適化） */}
      {!new URLSearchParams(window.location.search).has('screenshot') && <ParticleCanvas particlesRef={particlesRef} />}

      {scene === "TITLE" && (
        <TitleScene
          onStart={async () => {
            await audio.unlock();
            audio.playSeClick();
            audio.playBgm("ui");
            goto("TUTORIAL_VIDEO");
          }}
        />
      )}

      {scene === "TUTORIAL_VIDEO" && (
        <TutorialVideoScene
          onUserSkip={() => audio.playSeClick()}
          onEnded={() => goto("GAME")}
        />
      )}

      {scene === "GAME" && (
        <GameScene
          scene={scene}
          playerXs={playerXs}
          speedMultiplier={speedMultiplier}
          playerCount={personCount}
          onCatchFx={(x, y) => {
            createParticles(x, y);
            audio.playSeCatch();
          }}
          onEnd={(s, c) => {
            setScore(s);
            setCounts(c);
            setBestCharId(calcBestCharId(c));

            // 終了：BGM停止→ジングル→（間）→UI BGM はAudioManager側
            audio.playJingleGameEndThenUi();

            goto("RESULT");
          }}
        />
      )}

      {scene === "RESULT" && <ResultScene score={score} counts={counts} />}
      {scene === "RECOMMEND" && <RecommendScene bestChar={bestChar} />}
      {scene === "PHOTO" && <PhotoScene bestChar={bestChar} score={score} />}
      {scene === "RANKING" && (
        <RankingScene ranking={ranking} highlightAchievedAt={highlightAchievedAt} myScore={score} />
      )}
    </div>
  );
}