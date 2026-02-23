// MangaCatch/src/App.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StarBackground } from "./components/StarBackground";
import { ScreentoneWipe } from "./components/ScreentoneWipe";

import { useParticles } from "./hooks/useParticles";
import { useSensor } from "./hooks/useSensor";

import { TitleScene } from "./components/scenes/TitleScene";
import { TutorialVideoScene } from "./components/scenes/TutorialVideoScene";
import { GameScene } from "./components/scenes/GameScene";
import { ResultScene } from "./components/scenes/ResultScene";
import { RecommendScene } from "./components/scenes/RecommendScene";
import { PhotoScene } from "./components/scenes/PhotoScene";
import { RankingScene } from "./components/scenes/RankingScene";

import { AudioManager } from "./audio/AudioManager";
import { getCharacterById, getEnabledCharacters } from "./constants/master";
import type { RankingEntry, SceneType } from "./types/game";

const DUR_RESULT = 3200;
const DUR_RECOMMEND = 5200;
const DUR_PHOTO = 9000;
const DUR_RANKING = 7000;

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

  const { playerCount, speedMultiplier, playerX } = useSensor();
  const { particles, createParticles } = useParticles();

  const [scene, setScene] = useState<SceneType>("TITLE");

  // 派手ワイプ用
  const [wipeTrigger, setWipeTrigger] = useState(false);
  const pendingRef = useRef<SceneType | null>(null);
  const transitioningRef = useRef(false);

  // ゲーム結果
  const [score, setScore] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [bestCharId, setBestCharId] = useState<string>("");

  // ランキング
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [highlightAchievedAt, setHighlightAchievedAt] = useState<number | undefined>(undefined);

  const bestChar = useMemo(() => (bestCharId ? getCharacterById(bestCharId) : null), [bestCharId]);

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

          // BGM切替（unlock後）
          if (audio.isUnlocked()) {
            if (next === "GAME") audio.playBgm("game");
            else audio.playBgm("ui");
          }
          if (next === "RANKING") setRanking(loadRankingToday());
        }
      }, 1600);
    },
    [audio]
  );

  const onWipeMiddle = useCallback(() => {
    const next = pendingRef.current;
    if (!next) return;

    setScene(next);
    pendingRef.current = null;

    // BGM切替（unlock後）
    if (audio.isUnlocked()) {
      if (next === "GAME") audio.playBgm("game");
      else audio.playBgm("ui");
    }

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
      <StarBackground />
      <ScreentoneWipe trigger={wipeTrigger} onMiddle={onWipeMiddle} onComplete={onWipeComplete} />

      {/* particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "#00eebb",
            opacity: p.life,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 30,
          }}
        />
      ))}

      {/* TITLE：クリック必須（将来センサー入力に置換） */}
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

      {/* チュートリアル動画（動画内にカウントダウンを埋め込む前提） */}
      {scene === "TUTORIAL_VIDEO" && (
        <TutorialVideoScene
          onUserSkip={() => audio.playSeClick()}
          onEnded={() => goto("GAME")}
        />
      )}

      {scene === "GAME" && (
        <GameScene
          scene={scene}
          playerX={playerX}
          speedMultiplier={speedMultiplier}
          playerCount={playerCount}
          onCatchFx={(x, y) => {
            createParticles(x, y);
            audio.playSeCatch();
          }}
          onEnd={(s, c) => {
            setScore(s);
            setCounts(c);
            setBestCharId(calcBestCharId(c));

            // BGM停止→ジングル→（待ち）→UI BGM（AudioManager側の実装を使用）
            audio.playJingleGameEndThenUi();

            goto("RESULT");
          }}
        />
      )}

      {scene === "RESULT" && <ResultScene score={score} counts={counts} />}
      {scene === "RECOMMEND" && <RecommendScene bestChar={bestChar} />}
      {scene === "PHOTO" && <PhotoScene bestChar={bestChar} score={score} />}
      {scene === "RANKING" && <RankingScene ranking={ranking} highlightAchievedAt={highlightAchievedAt} />}

      {/* debug */}
      <div
        style={{
          position: "fixed",
          top: 8,
          left: 8,
          zIndex: 20000,
          padding: "6px 8px",
          borderRadius: 8,
          background: "rgba(0,0,0,0.45)",
          fontFamily: "monospace",
          fontSize: 12,
          opacity: 0.85,
          pointerEvents: "none",
        }}
      >
        scene:{scene} / wipe:{String(wipeTrigger)}
      </div>
    </div>
  );
}