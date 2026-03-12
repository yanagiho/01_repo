# MangaCatch Windows版 センサーデバッグ表示 実装タスク

## 目的
Windows版 `MangaCatch` は **カーソルキーでは動くが、センサーでは動かない**。
ターミナルログが見えないため、**ゲーム画面上にデバッグ情報を常時表示**して、
以下を切り分けたい。

- OSCが来ているか
- playerCount が何人として解釈されているか
- playerX がどう計算されているか
- speedMultiplier が更新されているか

## 前提
- Touchless Ractive / HokuyoUtil 経由
- 想定OSC:
  - host: `127.0.0.1`
  - port: `7000`
  - address: `/touches`
- HokuyoUtil 推奨設定:
  - `SEND ID = Off`
  - `SEND LIFETIME = Off`

## 既に想定している構成
### electron/main.ts
- UDP 7000 番待受
- `/touches` を受信
- `{ frame, players: [{x,y,id}] }` に変換して renderer に送る
- 旧 `/mangacatch/players` は後方互換で残す

### electron/preload.ts
- `window.electronAPI.onOscData(...)` で renderer に渡す

### SensorManager.ts
- `players.length` から人数
- players の平均 x から `playerX`
- `onPersonCountChange(...)`
- `onPlayerXChange(...)`

### useSensor.ts
- `onPersonCountChange` で人数と speedMultiplier 更新
- `onPlayerXChange` で `playerX` 更新
- mousemove/touchmove はフォールバックとして残してよい

---

# やってほしいこと

## 1. SensorManager.ts に debugInfo と onDebugChange を追加
対象:
- `src/game/sensor/SensorManager.ts`

追加したい情報:
- `lastOscAt`
- `frame`
- `playerCount`
- `playerX`
- `rawPlayers`

要件:
- OSC受信のたびに debugInfo を更新すること
- `onDebugChange(listener)` を追加すること
- 既存の `onPersonCountChange`, `onPlayerXChange` は壊さないこと

---

## 2. useSensor.ts が debugInfo も返すようにする
対象:
- `src/hooks/useSensor.ts`

要件:
- `debugInfo` を state で保持
- `sensorManager.onDebugChange(...)` を購読
- 既存の戻り値に加えて `debugInfo` を返すこと

---

## 3. 画面右上に常時表示する SensorDebugOverlay.tsx を新規作成
新規ファイル:
- `src/components/SensorDebugOverlay.tsx`

要件:
- 画面右上固定
- 黒背景・モノスペース・小さめ文字
- 以下を表示

表示項目:
- OSC 状態
  - 未受信
  - 受信中（何ms前）
  - 停止っぽい（何ms前）
- frame
- personCount(useSensor)
- playerCount(raw)
- playerX(useSensor)
- playerX(raw avg)
- speedMultiplier
- rawPlayers の先頭数件

仕様:
- `lastOscAt == null` なら「未受信」
- 3秒以内にOSCを受信していれば「受信中」
- 3秒以上空いていれば「停止?」

---

## 4. ゲーム起動中に必ず overlay が見えるよう差し込む
対象候補:
- `src/App.tsx`
- またはゲームのルートシーン

要件:
- `useSensor()` から
  - `personCount`
  - `playerX`
  - `speedMultiplier`
  - `debugInfo`
  を受け取って `SensorDebugOverlay` に渡す
- 既存ゲームを壊さないこと

---

## 5. 実装後の確認観点
Windows版で以下が分かるようにしたい。

### ケースA
`OSC: 未受信`
→ UDP受信できていない / 古いexe / 送信先違い / firewall の可能性

### ケースB
`OSC: 受信中` だが `playerCount(raw)=0`
→ `/touches` の形式違い / SEND LIFETIME や ID 混入 / main.ts のパース不一致

### ケースC
`playerCount(raw)` は出るが `playerX` が変
→ x座標レンジ解釈ズレ

### ケースD
`playerX(useSensor)` は変わるのにゲームが動かない
→ ゲーム制御側への反映不良

---

# 重要
- **最小差分で実装すること**
- **既存のキーボード操作は壊さないこと**
- **フォールバックの mouse/touch 入力も壊さないこと**
- **最終的に Windows 用のデバッグビルドが作れる状態にすること**

---

# 最後にやってほしいこと
実装後、以下を報告してほしい。

1. 修正したファイル一覧
2. 追加した主な型とAPI
3. overlay の表示箇所
4. Windows exe で確認すべき表示パターン
5. 追加差分のコード全文