import { InputManager } from './input';

export class Player {
  public id: string;
  public x: number;
  public y: number;
  public isActive: boolean;

  constructor(id: string) {
    this.id = id;
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight - 150; // 下から少し浮かせた位置
    this.isActive = false;
  }
}

export class PlayerManager {
  public players: Record<string, Player> = {};

  constructor() {
    // プレイヤーを作成して有効化
    this.players['player1'] = new Player('player1');
    this.players['player1'].isActive = true;
  }

  public update(_deltaTime: number, inputMgr: InputManager) {
    const p = this.players['player1'];

    // 1. 横移動（X座標）
    // マウスの位置に追従させる
    // ※ inputMgr.x が 0 の場合（初期状態）は動かないようにガードしても良いですが、
    // input.ts で初期値を中央にしているのでそのまま代入します。
    p.x = inputMgr.x;

    // 2. 縦位置（Y座標）
    // 画面の高さ(window.innerHeight)を使って、常に「下から150px」の位置に固定
    // これなら画面が小さくても見えなくなることはありません
    p.y = window.innerHeight - 150;
  }
}