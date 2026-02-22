import React, { useMemo, useState } from "react";
import type { Scene, RankingEntry } from "./types/game";
import { useSensor } from "./hooks/useSensor";
import { useParticles } from "./hooks/useParticles";
import { getCharacterById, pickRandomEnabled } from "./constants/master";

import { TitleScene } from "./components/scenes/TitleScene";
import { TutorialScene } from "./components/scenes/TutorialScene";
import { GameScene } from "./components/scenes/GameScene";
import { ResultScene } from "./components/scenes/ResultScene";
import { RecommendScene } from "./components/scenes/RecommendScene";
import { PhotoScene } from "./components/scenes/PhotoScene";
import { RankingScene } from "./components/scenes/RankingScene";

const RANKING_KEY = () => `mangacatch_ranking_${new Date().toLocaleDateString()}`;

function loadRanking(): RankingEntry[] {
  try {
    const raw = localStorage.getItem(RANKING_KEY());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as RankingEntry[];
  } catch {
    return [];
  }
}

function saveRanking(entry: RankingEntry) {
  const list = loadRanking();
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  const trimmed = list.slice(0, 30);
  localStorage.setItem(RANKING_KEY(), JSON.stringify(trimmed));
}

export default function App() {
  const { playerCount, speedMultiplier, playerX } = useSensor();
  const { particles, createParticles } = useParticles();

  const [scene, setScene] = useState<Scene>("TITLE");
  const [score, setScore] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [ranking, setRanking] = useState<RankingEntry[]>([]);

  const bestChar = useMemo(() => {
    let bestId = "";
    let best = -1;
    for (const [id, c] of Object.entries(counts)) {
      if (c > best) {
        best = c;
        bestId = id;
      }
    }
    return (bestId && getCharacterById(bestId)) || pickRandomEnabled();
  }, [counts]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", color: "#fff", position: "relative", overflow: "hidden", cursor: "none" }}>
      {/* 背景 */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 30%, #081018 0%, #000 60%)" }} />

      {/* パーティクル */}
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
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
          }}
        />
      ))}

      {scene === "TITLE" && (
        <TitleScene onStart={() => setScene("TUTORIAL")} />
      )}

      {scene === "TUTORIAL" && (
        <TutorialScene onDone={() => setScene("GAME")} />
      )}

      {scene === "GAME" && (
        <GameScene
          playerX={playerX}
          speedMultiplier={speedMultiplier}
          playerCount={playerCount}
          onCreateParticles={createParticles}
          onEnd={(s, c) => {
            setScore(s);
            setCounts(c);
            setScene("RESULT");
          }}
        />
      )}

      {scene === "RESULT" && (
        <ResultScene score={score} onNext={() => setScene("RECOMMEND")} />
      )}

      {scene === "RECOMMEND" && (
        <RecommendScene bestChar={bestChar} onNext={() => setScene("PHOTO")} />
      )}

      {scene === "PHOTO" && (
        <PhotoScene
          bestChar={bestChar}
          onNext={() => {
            saveRanking({ score, achieved_at: Date.now(), bestCharId: bestChar.id });
            const list = loadRanking();
            setRanking(list);
            setScene("RANKING");
          }}
        />
      )}

      {scene === "RANKING" && (
        <RankingScene ranking={ranking} onBack={() => setScene("TITLE")} />
      )}

      {/* デバッグ */}
      <div style={{ position: "absolute", top: 8, left: 8, fontFamily: "monospace", fontSize: 12, color: "#00eebb", opacity: 0.85 }}>
        Scene: {scene} / Players: {playerCount} / Speed: x{speedMultiplier.toFixed(2)}
      </div>
    </div>
  );
}