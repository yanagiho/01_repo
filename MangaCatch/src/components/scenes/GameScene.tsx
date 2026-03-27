import { useEffect, useRef } from "react";
import { useGameLoop } from "../../hooks/useGameLoop";
import { getEnabledCharacters } from "../../constants/master";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function baseUrl(): string {
  const b = (import.meta as any)?.env?.BASE_URL ?? "/";
  return b.endsWith("/") ? b : b + "/";
}

function loadImage(candidates: string[]): HTMLImageElement {
  const img = new Image();
  let idx = 0;
  const tryNext = () => {
    if (idx >= candidates.length) return;
    img.src = candidates[idx++];
  };
  img.onerror = tryNext;
  tryNext();
  return img;
}

export const GameScene: React.FC<{
  scene: string;
  playerXs: number[];
  speedMultiplier: number;
  playerCount: number;
  onEnd: (score: number, counts: Record<string, number>) => void;
  onCatchFx: (x: number, y: number) => void;
}> = ({ scene, playerXs, speedMultiplier, onEnd, onCatchFx }) => {
  const { itemsRef, isHitRef, score, timer, isHit, catchCount, scoreRef } = useGameLoop(
    scene,
    playerXs,
    speedMultiplier,
    onCatchFx
  );

  // タイマー終了 → ゲーム終了コールバック
  useEffect(() => {
    if (scene === "GAME" && timer <= 0) onEnd(scoreRef.current, catchCount.current);
  }, [scene, timer, onEnd, catchCount, scoreRef]);

  // プレイヤー位置をrefで追跡（Canvas RAFクロージャから読む）
  const playerXsRef = useRef(playerXs);
  useEffect(() => { playerXsRef.current = playerXs; }, [playerXs]);

  // 画像プリロード（マウント時1回のみ）
  const imageMapRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const catcherImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const b = baseUrl();

    // キャッチャー画像
    catcherImgRef.current = loadImage([
      b + "assets/ui/catcher.png",
      "/assets/ui/catcher.png",
      "./assets/ui/catcher.png",
    ]);

    // 全キャラクター画像
    for (const char of getEnabledCharacters()) {
      const filename = char.characterImage;
      imageMapRef.current.set(
        char.id,
        loadImage([
          b + "assets/characters/" + filename,
          "/assets/characters/" + filename,
          "./assets/characters/" + filename,
        ])
      );
    }
  }, []);

  // Canvas描画ループ
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d")!;
    const CHAR_SIZE = 255;
    const BIG_CATCHER_D = 420;

    let rafId: number;
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const now = performance.now();
      const catcherY = h - 200;

      // キャラクター描画
      for (const it of itemsRef.current) {
        const img = imageMapRef.current.get(it.char.id);
        if (!img || !img.complete || img.naturalWidth === 0) continue;

        const age = (now - it.bornAt) / 1000;
        const t = clamp(age / 0.22, 0, 1);
        const opacity = 0.15 + 0.85 * t;
        const scale = 0.92 + 0.08 * t;
        const drawSize = CHAR_SIZE * scale;
        const y = Math.max(it.y, CHAR_SIZE / 2 + 2);

        ctx.globalAlpha = opacity;
        ctx.drawImage(img, it.x - drawSize / 2, y - drawSize / 2, drawSize, drawSize);
      }

      // キャッチャー描画
      const catcherImg = catcherImgRef.current;
      if (catcherImg && catcherImg.complete && catcherImg.naturalWidth > 0) {
        ctx.globalAlpha = isHitRef.current ? 1.0 : 0.92;
        for (const px of playerXsRef.current) {
          ctx.drawImage(
            catcherImg,
            px - BIG_CATCHER_D / 2,
            catcherY - BIG_CATCHER_D / 2,
            BIG_CATCHER_D,
            BIG_CATCHER_D
          );
        }
      }

      ctx.globalAlpha = 1.0;
      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const total = 30;
  const ratio = Math.max(0, Math.min(1, timer / total));
  const barW = Math.floor(window.innerWidth / 3);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
      <style>{`
        @keyframes scorePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Canvas（キャラ・キャッチャー描画） */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 11,
        }}
      />

      {/* スコア */}
      <div
        style={{
          position: "absolute",
          right: 18,
          top: 12,
          zIndex: 30,
          fontFamily: "monospace",
          fontSize: 76,
          fontWeight: 900,
          color: "#00eebb",
          textShadow: "0 4px 16px rgba(0,0,0,0.85)",
          padding: "6px 14px",
          borderRadius: 14,
          background: "rgba(0,0,0,0.28)",
          border: "2px solid rgba(0,238,187,0.35)",
          boxShadow: "0 0 26px rgba(0,238,187,0.18)",
          animation: isHit ? "scorePulse 260ms ease-in-out 1" : "none",
          pointerEvents: "none",
        }}
      >
        {score}
      </div>

      {/* タイマーバー */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: 18,
          width: barW,
          height: 18,
          borderRadius: 12,
          border: "2px solid rgba(0,238,187,0.8)",
          background: "rgba(0,0,0,0.35)",
          zIndex: 20,
        }}
      >
        <div
          style={{
            width: `${ratio * 100}%`,
            height: "100%",
            borderRadius: 12,
            background: "rgba(0,238,187,0.88)",
            transition: "width 120ms linear",
          }}
        />
      </div>

      {/* タイマー数値 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: 44,
          fontFamily: "monospace",
          fontSize: 46,
          fontWeight: 900,
          color: "#00eebb",
          textShadow: "0 3px 12px rgba(0,0,0,0.85)",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        {Math.max(0, Math.ceil(timer))}
      </div>
    </div>
  );
};
