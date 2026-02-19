import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StarBackground } from './components/StarBackground';
import { ScreentoneWipe } from './components/ScreentoneWipe';
import { SensorManager } from './game/sensor/SensorManager';

const CHARACTER_MASTER = [
  { id: "chara_001", name: "七本樫夕芽", work: "粉雪ポルカ", artist: "陸奥A子 (MUTSU Ako)", credit: "©陸奥A子", score: 100, weight: 10, workImage: "cover_001.png" },
  { id: "chara_002", name: "ポー", work: "銀曜日のおとぎばなし", artist: "萩岩睦美 (HAGIIWA Mutsumi)", credit: "©萩岩睦美", score: 150, weight: 8, workImage: "cover_002.png" },
  { id: "chara_003", name: "アレクサンドラ", work: "金のアレクサンドラ", artist: "文月今日子 (FUMIZUKI Kyoko)", credit: "©文月今日子", score: 120, weight: 9, workImage: "cover_003.png" },
  { id: "chara_004", name: "白蓮", work: "炭に白蓮", artist: "山田圭子 (YAMADA Keiko)", credit: "©山田圭子", score: 100, weight: 10, workImage: "cover_004.png" },
  { id: "chara_005", name: "冴羽獠＆槇村香", work: "シティーハンター", artist: "北条司 (HOJO Tsukasa)", credit: "©北条司／コアミックス 1985", score: 300, weight: 5, workImage: "cover_001.png" },
  { id: "chara_006", name: "伴省吾", work: "バンビ～ノ！", artist: "せきやてつじ (SEKIYA Tetsuji)", credit: "©せきやてつじ／小学館", score: 150, weight: 8, workImage: "cover_006.png" },
  { id: "chara_007", name: "大月良太", work: "まんだら屋の良太", artist: "畑中純 (HATANAKTA Jun)", credit: "©畑中純", score: 100, weight: 10, workImage: "cover_007.png" },
  { id: "chara_008", name: "ガタロ", work: "ガタロ", artist: "畑中純 (HATANAKTA Jun)", credit: "©畑中純", score: 100, weight: 10, workImage: "cover_008.png" },
  { id: "chara_009", name: "南郷勇一と賢二", work: "ストップ！にいちゃん", artist: "関谷ひさし (SEKIYA Hisashi)", credit: "©関谷ひさし", score: 200, weight: 7, workImage: "cover_009.png" },
  { id: "chara_010", name: "高峰ルリ", work: "スーパーおじょうさん", artist: "関谷ひさし (SEKIYA Hisashi)", credit: "©関谷ひさし", score: 100, weight: 10, workImage: "cover_010.png" },
];

const App = () => {
  const [scene, setScene] = useState("TITLE");
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [particles, setParticles] = useState<any[]>([]);
  const [playerX, setPlayerX] = useState(960);
  const [isHit, setIsHit] = useState(false);
  const [timer, setTimer] = useState(30);
  const [bestChar, setBestChar] = useState<any>(null);
  const [ranking, setRanking] = useState<any[]>([]);
  const [wipeTrigger, setWipeTrigger] = useState(false);
  const [pendingScene, setPendingScene] = useState<string | null>(null);

  // リアルタイム人数 & 速度倍率
  const [playerCount, setPlayerCount] = useState(1);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);

  const nextId = useRef(0);
  const catchCount = useRef<Record<string, number>>({});
  const laneTimers = useRef([0, 0, 0, 0, 0]);

  // ランキング読み込み・保存ロジック
  const saveToRanking = useCallback((finalScore: number, charId: string) => {
    const today = new Date().toLocaleDateString();
    const key = `ranking_v5_${today}`;
    let list = JSON.parse(localStorage.getItem(key) || "[]");

    // 初期値がない場合のダミー
    if (list.length === 0) {
      list = [
        { score: 5000, id: "chara_005" },
        { score: 3000, id: "chara_002" },
        { score: 1500, id: "chara_009" }
      ];
    }

    list.push({ score: finalScore, id: charId });
    list.sort((a: any, b: any) => b.score - a.score);
    const sliced = list.slice(0, 5);
    localStorage.setItem(key, JSON.stringify(sliced));
    setRanking(sliced);
  }, []);

  const changeScene = useCallback((next: string) => {
    setPendingScene(next);
    setWipeTrigger(true);
  }, []);

  // エフェクト生成
  const createParticles = (x: number, y: number) => {
    const pCount = 35; // パーティクル数を増やして豪華に (20 -> 35)
    const newParticles = Array.from({ length: pCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 8 + Math.random() * 24; // 拡散速度をアップ (6-24 -> 8-32)
      return {
        id: Math.random(), x, y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 1.0,
        size: Math.random() * 20 + 15, // サイズを大きく (8-20 -> 15-35)
        color: Math.random() > 0.5 ? '#fff' : 'cyan'
      };
    });
    setParticles(prev => [...prev, ...newParticles]);
  };

  // エフェクト更新
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.5, life: p.life - 0.05
      })).filter(p => p.life > 0));
    }, 16);
    return () => clearInterval(interval);
  }, [particles]);

  // ゲームループ
  useEffect(() => {
    if (scene !== "GAME") return;
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 0.1) { changeScene("RESULT"); return 0; }
        return t - 0.016;
      });

      // 人数に応じた倍率計算 (1人:1.0, 2人:1.2, 3人:1.5)
      const currentMultiplier = playerCount === 1 ? 1.0 : (playerCount === 2 ? 1.2 : 1.5);
      if (currentMultiplier !== speedMultiplier) {
        setSpeedMultiplier(currentMultiplier);
      }

      // レーンタイマーの減算にも倍率を適用（スポーン頻度アップ）
      const tick = 1 * currentMultiplier;
      laneTimers.current = laneTimers.current.map(lt => Math.max(0, lt - tick));

      if (Math.random() < 0.12 * currentMultiplier) {
        const laneIndex = Math.floor(Math.random() * 5);
        if (laneTimers.current[laneIndex] <= 0) {
          const char = CHARACTER_MASTER[Math.floor(Math.random() * CHARACTER_MASTER.length)];
          setItems(prev => [...prev, {
            id: nextId.current++,
            baseX: (window.innerWidth / 5 * laneIndex) + (window.innerWidth / 10),
            x: 0, y: -250, char, time: 0, swaySpeed: 2.2, swayAmp: 50, speed: 7.5
          }]);
          // クールダウン時間も倍率で短縮 (45 / 倍率)
          laneTimers.current[laneIndex] = 45 / currentMultiplier;
        }
      }

      setItems(prev => prev.map(item => {
        const newTime = item.time + 0.016;
        // 移動速度に倍率を適用
        const newY = item.y + (item.speed * currentMultiplier);
        const newX = item.baseX + Math.sin(newTime * item.swaySpeed) * item.swayAmp;
        const pY = window.innerHeight - 80;

        if (newY > pY - 80 && newY < pY + 20 && Math.abs(newX - playerX) < 110) {
          setScore(s => s + item.char.score);
          catchCount.current[item.char.id] = (catchCount.current[item.char.id] || 0) + 1;
          setIsHit(true);
          setTimeout(() => setIsHit(false), 100);
          // 発生位置を上げる (newY + 112 から newY + 0 付近へ調整。キャラの中心より少し上にするために控えめに +50)
          createParticles(newX, newY + 50);
          return null;
        }
        return { ...item, y: newY, x: newX, time: newTime };
      }).filter(i => i !== null && i.y < window.innerHeight + 150));
    }, 16);
    return () => clearInterval(interval);
  }, [scene, playerX, speedMultiplier, playerCount]); // 依存配列に追加

  // シーン遷移オートメーション
  useEffect(() => {
    if (scene === "RESULT") {
      let max = -1; let winner = CHARACTER_MASTER[0];
      Object.keys(catchCount.current).forEach(id => {
        if (catchCount.current[id] > max) { max = catchCount.current[id]; winner = CHARACTER_MASTER.find(c => c.id === id) || winner; }
      });
      setBestChar(winner);
      setTimeout(() => changeScene("RECOMMEND"), 2000);
    } else if (scene === "RECOMMEND") {
      setTimeout(() => {
        // PHOTOに進む前にランキングを保存
        if (bestChar) saveToRanking(score, bestChar.id);
        changeScene("PHOTO");
      }, 5000);
    } else if (scene === "PHOTO") {
      setTimeout(() => changeScene("RANKING"), 10000);
    } else if (scene === "RANKING") {
      // ランキング画面からタイトルへ戻る（10秒）
      setTimeout(() => changeScene("TITLE"), 10000);
    }
  }, [scene, bestChar, score, saveToRanking, changeScene]);

  useEffect(() => {
    const handleMove = (e: any) => setPlayerX(e.touches ? e.touches[0].clientX : e.clientX);
    window.addEventListener('mousemove', handleMove);

    // センサーマネージャーの初期化と購読
    const sensorMgr = SensorManager.getInstance();
    sensorMgr.onPersonCountChange((count) => {
      // 人数制限 (MAX 3)
      const validCount = Math.min(3, Math.max(1, count));
      setPlayerCount(validCount);
    });
    sensorMgr.start();

    return () => {
      window.removeEventListener('mousemove', handleMove);
      sensorMgr.stop();
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', color: 'white', position: 'relative', overflow: 'hidden', cursor: 'none' }}>
      <StarBackground />
      <ScreentoneWipe
        trigger={wipeTrigger}
        onMiddle={() => {
          if (pendingScene) {
            setScene(pendingScene);
            setPendingScene(null);
          }
        }}
        onComplete={() => setWipeTrigger(false)}
      />

      {/* パーティクル */}
      {particles.map(p => (
        <div key={p.id} style={{ position: 'absolute', left: p.x, top: p.y, width: p.size, height: p.size, backgroundColor: p.color, borderRadius: '50%', opacity: p.life, transform: 'translate(-50%, -50%)', zIndex: 20 }} />
      ))}

      {/* ゲームメイン */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        {scene === "GAME" && items.map(item => (
          <img key={item.id} src={`/assets/characters/${item.char.id}.png`} style={{ position: 'absolute', left: item.x, top: item.y, width: '225px', height: '225px', transform: 'translateX(-50%)' }} />
        ))}
        {(scene === "GAME" || scene === "TUTORIAL") && (
          <div style={{ position: 'absolute', left: playerX, bottom: '80px', width: '180px', height: '90px', transform: 'translateX(-50%)', filter: isHit ? 'brightness(3) drop-shadow(0 0 20px white)' : 'none' }}>
            <div style={{ width: '100%', height: '100%', border: '5px solid cyan', borderTop: 'none', borderRadius: '0 0 100px 100px', boxShadow: '0 5px 20px cyan' }} />
          </div>
        )}
      </div>

      {/* UIレイヤー */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        {scene === "TITLE" && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.5)' }}>
            <img src="/assets/ui/mangacatch_title_logo.png" style={{ width: '600px', marginBottom: '80px' }} />
            <div onClick={() => { setScore(0); changeScene("TUTORIAL"); }} style={{ fontSize: '3rem', padding: '30px 80px', border: '4px solid white', borderRadius: '100px', cursor: 'pointer' }}>TOUCH TO START</div>
          </div>
        )}

        {scene === "TUTORIAL" && (
          <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '50px' }}>TUTORIAL (READY?)</div>
            <div onClick={() => changeScene("GAME")} style={{ padding: '20px 60px', background: 'red', borderRadius: '50px', fontSize: '2.5rem', cursor: 'pointer' }}>SKIP ≫</div>
          </div>
        )}

        {scene === "GAME" && (
          <>
            <div style={{ position: 'absolute', top: '20px', right: '30px', fontSize: '2.5rem', fontWeight: 'bold' }}>SCORE: {score}</div>
            <div style={{ position: 'absolute', top: '30px', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '35px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ width: `${(timer / 30) * 100}%`, height: '100%', background: timer < 5 ? 'red' : '#00eebb' }} />
            </div>
          </>
        )}

        {scene === "RESULT" && <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.9)', fontSize: '8rem' }}>FINISH!</div>}

        {scene === "RECOMMEND" && bestChar && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.9)', padding: '100px' }}>
            <img src={`/assets/characters/${bestChar.id}.png`} style={{ width: '400px', marginRight: '80px' }} />
            <div>
              <div style={{ fontSize: '2rem' }}>あなたが一番集めたのは...</div>
              <div style={{ fontSize: '5rem', color: '#00eebb', fontWeight: 'bold' }}>「{bestChar.work}」</div>
              <div style={{ fontSize: '3rem' }}>{bestChar.artist} 先生の作品です</div>
            </div>
          </div>
        )}

        {scene === "PHOTO" && bestChar && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', padding: '60px', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <img src={`/assets/covers/${bestChar.workImage}`} style={{ height: '75vh', borderRadius: '15px' }} />
            <div style={{ width: '45%', textAlign: 'right' }}>
              <div style={{ fontSize: '6rem', color: '#00eebb' }}>{bestChar.work}</div>
              <div style={{ fontSize: '4rem' }}>{bestChar.artist} 先生</div>
              <img src="/assets/ui/mangacatch_title_logo.png" style={{ width: '300px', marginTop: '40px' }} />
            </div>
          </div>
        )}

        {scene === "RANKING" && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.9)', paddingTop: '100px' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '50px' }}>TODAY'S TOP 5</h1>
            <div style={{ width: '70%' }}>
              {ranking.length > 0 ? ranking.map((r: any, i: number) => (
                <div key={`${i}-${r.score}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #444', fontSize: '3rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: '60px' }}>{i + 1}.</span>
                    <img src={`/assets/characters/${r.id}.png`} style={{ height: '80px', margin: '0 30px', objectFit: 'contain' }} />
                  </span>
                  <span>{r.score} pt</span>
                </div>
              )) : <div style={{ fontSize: '2rem' }}>Loading Ranking...</div>}
            </div>
          </div>
        )}
      </div>
      <div style={{ position: 'absolute', top: 5, left: 5, fontSize: '10px', color: 'lime' }}>
        Scene: {scene} <br />
        Players: {playerCount} (Speed x{speedMultiplier.toFixed(1)})
      </div>
    </div >
  );
};

export default App;