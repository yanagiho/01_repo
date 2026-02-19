import { PlayerManager } from './players';
import { SceneManager } from './scenes';
import { CHARACTER_MASTER } from '../constants/master';

export interface FallingItem {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  rotation: number;
  imagePath: string; 
  typeId: string;
  score: number;
  
  // ゆらゆら動くためのパラメータ
  initialX: number;
  time: number;
  swayAmplitude: number;
  swaySpeed: number;
}

export class FallingManager {
  public items: FallingItem[] = [];
  private spawnTimer: number = 0;
  private nextId: number = 0;
  
  // 抽選用ボックス
  private lotteryBox: string[] = [];

  // --- 揺れ方のパターン（5種類） ---
  private readonly SWAY_PATTERNS = [
    { amplitude: 30,  speed: 2.0 }, // 1. 標準
    { amplitude: 50,  speed: 1.5 }, // 2. ゆったり大きく
    { amplitude: 80,  speed: 1.0 }, // 3. さらに大きく
    { amplitude: 120, speed: 0.8 }, // 4. 最大級の揺れ
    { amplitude: 20,  speed: 3.0 }, // 5. 小刻みに速く
  ];

  public constructor() {
    this.items = [];
    this.initLottery();
  }

  // 重みに基づく抽選箱を作る
  private initLottery() {
    this.lotteryBox = [];
    CHARACTER_MASTER.forEach(char => {
      for (let i = 0; i < char.weight; i++) {
        this.lotteryBox.push(char.id);
      }
    });
  }

  public update(deltaTime: number, playerMgr: PlayerManager, sceneMgr: SceneManager) {
    if (sceneMgr.currentScene !== 'GAME') {
      if (sceneMgr.currentScene !== 'TUTORIAL' && this.items.length > 0) {
        this.items = [];
      }
      return;
    }

    // 1. 生成 (Spawn)
    this.spawnTimer += deltaTime;
    if (this.spawnTimer > 0.8) { 
      this.spawnItem();
      this.spawnTimer = 0;
    }

    // 2. 移動 & 画面外削除
    this.items.forEach(item => {
      // 時間を進める
      item.time += deltaTime;

      // 縦移動（落下）
      item.y += item.speed * deltaTime * 60;
      
      // 横移動（ゆらゆら）: 初期位置 + sin(時間 * 速さ) * 幅
      item.x = item.initialX + Math.sin(item.time * item.swaySpeed) * item.swayAmplitude;
    });

    // 画面下(1200px)を超えたら消す
    this.items = this.items.filter(item => item.y < 1200);

    // 3. 当たり判定
    // ※キャラが大きくなった分、当たり判定も少し大きく感じるようになります
    const players = Object.values(playerMgr.players);
    this.items = this.items.filter(item => {
      let isHit = false;
      const itemCx = item.x + item.width / 2;
      const itemCy = item.y + item.height / 2;

      for (const p of players) {
        if (!p.isActive) continue;
        const dx = itemCx - p.x;
        const dy = itemCy - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        // 判定距離を少し広げる (100 -> 120)
        if (dist < 120) {
          isHit = true;
          sceneMgr.addScore(item.score);
          sceneMgr.recordCatch(item.typeId);
          break; 
        }
      }
      return !isHit;
    });
  }

  private spawnItem() {
    const id = this.nextId++;
    
    // 揺れ幅(最大120px)とキャラサイズ増加分を考慮してマージンを広げる
    const margin = 250; 
    const initialX = margin + Math.random() * (1920 - margin * 2);
    
    // 抽選ロジック
    const randomIndex = Math.floor(Math.random() * this.lotteryBox.length);
    const selectedId = this.lotteryBox[randomIndex];
    
    const master = CHARACTER_MASTER.find(c => c.id === selectedId);
    const score = master ? master.score : 100;
    const imagePath = `./assets/characters/${selectedId}.png`; 

    // 揺れパターンをランダムに決定
    const patternIdx = Math.floor(Math.random() * this.SWAY_PATTERNS.length);
    const pattern = this.SWAY_PATTERNS[patternIdx];

    this.items.push({
      id,
      initialX: initialX,
      // --- 変更点: サイズ1.5倍化に伴う調整 ---
      y: -250,      // 開始位置を少し上にする (サイズが大きくなったため)
      width: 225,   // 幅: 150 * 1.5 = 225
      height: 225,  // 高さ: 150 * 1.5 = 225
      // -----------------------------------
      speed: 4 + Math.random() * 3,
      rotation: 0,
      imagePath: imagePath,
      typeId: selectedId,
      score: score,
      time: 0,
      swayAmplitude: pattern.amplitude,
      swaySpeed: pattern.speed
    });
  }
}