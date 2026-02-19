export class InputManager {
  public x: number = 0;
  public y: number = 0;
  public isDown: boolean = false;

  constructor() {
    // マウス移動
    window.addEventListener('mousemove', (e) => {
      this.x = e.clientX;
      this.y = e.clientY;
    });

    // マウスクリック
    window.addEventListener('mousedown', () => { this.isDown = true; });
    window.addEventListener('mouseup', () => { this.isDown = false; });

    // タッチ移動（スマホ・タブレット用）
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.x = e.touches[0].clientX;
        this.y = e.touches[0].clientY;
      }
    }, { passive: false });

    // タッチ開始・終了
    window.addEventListener('touchstart', () => { this.isDown = true; }, { passive: false });
    window.addEventListener('touchend', () => { this.isDown = false; });

    // 初期値を画面中央にしておく
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight - 100;
  }

  public update() {
    // 毎フレームの処理が必要ならここに書く
  }
}