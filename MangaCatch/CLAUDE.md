# MangaCatch — CLAUDE.md

## プロジェクト概要

Electron + React + TypeScript + Vite で構築された、タッチレスラクティブ（非接触センサー）対応のゲームアプリ。
センサーから受信したプレイヤー位置でキャラクターを操作し、落下するアイテムをキャッチするゲーム。
最大3人まで途中参加（ドロップイン）可能。本番環境はタッチパネル専用機。

## リポジトリ構成

```
01_repo/                         ← GitHubリポジトリルート
├── .github/workflows/
│   └── build-win.yml            ← Windows向けCI/CDビルド（★実際に使われるワークフロー）
└── MangaCatch/                  ← アプリ本体（作業ディレクトリはここ）
    ├── electron/
    │   ├── main.ts              ← Electronメインプロセス・UDPサーバー・OSCパース
    │   └── preload.ts           ← IPC経由でrendererにelectronAPIを公開
    ├── src/
    │   ├── App.tsx              ← シーン管理・ルート
    │   ├── game/
    │   │   ├── sensor/
    │   │   │   └── SensorManager.ts   ← OSCデータ受信・正規化の中心
    │   │   ├── falling.ts       ← 落下アイテムのロジック
    │   │   ├── players.ts       ← プレイヤー管理
    │   │   └── scenes.ts        ← シーン定義
    │   ├── hooks/
    │   │   ├── useGameLoop.ts   ← ゲームループ・複数プレイヤー対応
    │   │   └── useSensor.ts     ← センサー入力・タッチ/マウスフォールバック・デバッグ情報
    │   └── components/
    │       ├── SensorDebugOverlay.tsx ← センサーデバッグ情報常時表示overlay
    │       └── scenes/          ← 各シーンのReactコンポーネント
    ├── osc-bridge.mjs           ← ChromeBook開発環境用WebSocketブリッジ
    └── public/assets/           ← 画像・動画アセット
```

## シーン構成

`TitleScene` → `TutorialVideoScene` → `TutorialScene` → `GameScene` → `ResultScene` → `RankingScene` → `RecommendScene` → `PhotoScene`

## センサー通信フロー

### Windows / Mac（本番）
```
タッチレスラクティブ
  → UDP OSC (ポート 9100)
  → electron/main.ts（UDPサーバー・OSCパース）
  → IPC (electronAPI.onOscData)
  → SensorManager.ts
```

### ChromeBook Crostini（開発）
```
タッチレスラクティブ
  → UDP OSC (ポート 9100)
  → osc-bridge.mjs（UDP→WebSocket変換）
  → WebSocket (ws://localhost:8765)
  → SensorManager.ts（自動再接続あり）
```

### OSCフォーマット対応
- **TUIOバンドル** (`#bundle` + `/tuio/2Dcur`): `interpretTuioBundle()` で処理
- **シングルOSCメッセージ** (`/touches`, `/mangacatch/players` 等): `interpretArgs()` で自動パターン判別

## 開発コマンド

```bash
cd MangaCatch

# ChromeBook開発環境・センサーなし（Electronなし・Viteのみ）
npx vite --config vite.web.config.ts

# ChromeBook開発環境・センサーあり（OSCブリッジ同時起動）
npm run dev:chromebook

# 通常開発 (Electron + Vite) ※ChromeBookでは使用不可
npm run dev

# Webアセットのみビルド
npm run build:web

# Windows向けローカルビルド（フォルダ形式、単体exeではない）
npm run dist:win
```

> **注意**: ChromeBook で `npm run dev` を実行すると Electron が起動しようとして失敗する。
> センサーなし動作確認は `npx vite --config vite.web.config.ts` を使うこと。

## Windowsリリースビルド（単体 .exe）

`main` ブランチにpushすると GitHub Actions が自動実行される。

- ワークフロー: `/.github/workflows/build-win.yml`（リポジトリルートのもの）
- ビルド結果: GitHub Releases に `MangaCatch 1.0.0.exe`（portable、単体実行可能）がアップロードされる
- リリースページ: https://github.com/yanagiho/01_repo/releases

> **注意**: `MangaCatch/.github/workflows/build-win.yml` も存在するが、
> GitHub Actionsが参照するのはリポジトリルートの `/.github/workflows/` のみ。

## 環境別の注意点

| 環境 | 注意 |
|---|---|
| Windows 11 | GPU有効、Electron IPC経由でOSC受信 |
| Mac | GPU有効、Electron IPC経由でOSC受信 |
| ChromeBook (Crostini / Linux) | `--disable-gpu` 適用、WebSocket経由でOSC受信 |

`--disable-gpu` は `process.platform === 'linux'` のときのみ適用（[electron/main.ts](electron/main.ts)）。

## OSCポート

| 用途 | ポート |
|---|---|
| タッチレスラクティブ → アプリ (UDP) | **9100** |
| osc-bridge.mjs WebSocket | **8765** |

## ゲーム仕様

### 入力
- **タイトル画面（アトラクトモード）**: 20秒間無操作で TUTORIAL_VIDEO へ自動遷移し、終了後タイトルに戻るループ。センサーが人を検知 / STARTボタン押下でゲームスタート（タイマーキャンセル → TUTORIAL_VIDEO → GAME）。
- **ゲーム中**: センサー（OSC）優先。センサー未接続時はタッチ・マウス移動フォールバック。

### マルチプレイヤー
- 最大3人まで対応。ゲームプレイ中に途中参加（ドロップイン）可能。
- アクティブプレイヤー数に応じてゲームスピードが動的に増加する（1人:×1.0 / 2人:×1.1 / 3人:×1.2）。
- `useSensor.ts` の `personCountToSpeedMultiplier()` で定義。

### センサー座標マッピング
- SensorManager.ts でセンサー値を 0.0〜1.0 に正規化。
- 光の輪エフェクトは画面端（0〜100%）まで追従するようマッピング済み。

### 画面遷移
- フェードアウト/フェードイン の色: **黒**（ScreentoneWipe.tsx）

## UIテキスト（ハードコード）

| 画面 | テキスト |
|---|---|
| オススメ画面 | `あなたが一番多く集めたのは` |
| ランキング画面（自分） | `YOU` |

> システムや翻訳機能による日本語変換禁止。カタカナ・英語で厳密にハードコード。

## センサーデバッグ overlay

`SensorDebugOverlay.tsx` が `App.tsx` に組み込まれており、常時レンダリングされる。
URL に `?debug=1` を付けたときのみ画面右上に表示される（通常は非表示）。

表示内容: OSC受信状態・frame・playerCount・playerX・rawPlayers・parseMode・usingFallback 等。

OSC状態表示の仕様:
- `未受信`: OSCをまだ一度も受信していない
- `受信中 (Xms前)`: 1500ms以内に受信
- `停止? (Xms前)`: 1500ms〜3000ms以内に受信（最後の受信から時間が経っている）

デバッグ時のURL例: `http://localhost:5173/?debug=1`

## スクリーンショット自動撮影

`screenshot2.js`（Git未管理・ローカルのみ）で Puppeteer による自動撮影が可能。

```bash
# Viteサーバーを先に起動
cd MangaCatch && npx vite --config vite.web.config.ts --port 5174

# 別ターミナルで実行
node screenshot2.js
```

- 出力先: `/tmp/ss_title.png`, `/tmp/ss_result.png`, `/tmp/ss_recommend.png`, `/tmp/ss_photo.png`, `/tmp/ss_ranking.png`
- デバッグoverlay **なし**（`?debug=1` は付けない）
- Chromium: `/usr/bin/chromium`（ChromeBook Crostini環境）
- Ranking撮影時は `localStorage` に事前データを仕込む必要あり（スクリプト内で自動処理）
- Ranking は `DUR_RANKING=10000ms` で自動遷移するため、撮影は起動後4秒以内に完了させること

## 写真撮影画面（PhotoScene）

- 解像度: 1920×1080 (Full HD) フル活用
- 黒枠（レターボックス）なし
- フォントサイズ: スコア等 **71pt**、「写真を撮ってね」**70pt**

## フォント設計

全画面の全テキスト要素に `JP_FONT` 定数を**明示的**に指定済み。bodyからの継承に依存しない。

```ts
const JP_FONT = "'Noto Sans CJK JP', 'Yu Gothic UI', 'Yu Gothic', 'Hiragino Kaku Gothic ProN', sans-serif";
```

- **日本語テキスト・英語ラベル**: `JP_FONT`（Windows実機では Yu Gothic UI にフォールバック）
- **数値・スコア・時刻**: `fontFamily: "monospace"`（デザイン意図・変更不可）
- `index.html` の `lang="ja"` 必須（`lang="en"` だと漢字が中国語グリフで描画される）
- `src/index.css` の `body` にも同じフォントスタックを設定済み（フォールバック保険）

## 更新履歴（2026-03-27）

### Canvas描画への切り替えによるパフォーマンス改善

Celeron/Intel UHD環境での描画パフォーマンスを大幅改善。

| 変更内容 | 影響ファイル |
|---------|-------------|
| ゲーム中のキャラクター・キャッチャー描画をReact DOM → `<canvas>` drawImage()に全置換 | `GameScene.tsx` |
| `items` state廃止・`itemsRef`/`isHitRef`を直接公開。`setItems()`をゲームループから除去 | `useGameLoop.ts` |
| 30fps上限キャップを撤廃（Canvas描画はReact再レンダリングを伴わないため不要） | `useGameLoop.ts` |
| 全キャラ・キャッチャー画像をマウント時にプリロード（`imageMapRef`） | `GameScene.tsx` |

> **重要**: ゲームロジック（物理・当たり判定）は `useGameLoop.ts` のRAFループ内で動く。Canvasの描画RAFは `GameScene.tsx` 側で独立して動く。`itemsRef.current` を直接参照することでReact再レンダリングコストをゼロにしている。

### 著作権クレジット表記の更新

| 変更内容 | 影響ファイル |
|---------|-------------|
| タイトル画面の著作権表記を新フォーマットに統一（版元名を正確に併記） | `TitleScene.tsx` |
| オススメ・写真画面の右下に作家別クレジットを表示 | `RecommendScene.tsx`, `PhotoScene.tsx` |
| `getArtistCredit()` 関数を追加（北条司→`©北条司／コアミックス 1985`、せきやてつじ→`©せきやてつじ／小学館`） | `constants/legal.ts` |

### センサー対応

| 変更内容 | 影響ファイル |
|---------|-------------|
| タイトル画面でセンサーが人を検知（personCount > 0）した瞬間に自動スタート | `App.tsx` |

## バグ修正履歴（2026-03-20）

### ランキング不具合を修正（Build #75）

| 修正内容 | 影響ファイル |
|---------|-------------|
| 起動時に前日以前のランキングデータが残る → `clearOldRankings()` を追加し起動時に `mangacatch_ranking_` プレフィックスの旧キーを削除 | `App.tsx` |
| ゲーム中スコアとランキングスコアが異なる → `setScore` を `setItems` の functional updater 内で呼ぶ React アンチパターンを解消。`itemsRef`/`scoreRef` を導入し `setItems`/`setScore` を RAF ステップのトップレベルで呼ぶよう変更 | `useGameLoop.ts` |
| `GameScene` の `onEnd` で `score` state（レンダリングタイミング依存）の代わりに `scoreRef.current`（確定値）を使用 | `GameScene.tsx` |
| `SensorDebugOverlay` の `visible` デフォルト値が `true` になっており、`?debug=1` なしでもoverlay表示される場合があった → `false` に修正 | `SensorDebugOverlay.tsx` |

### ランキングの localStorage キー仕様
- キー形式: `mangacatch_ranking_YYYY-MM-DD`（ロケール非依存・固定形式）
- 起動時に全ランキングを削除（当日分含む）→ セッション内のプレイのみ蓄積
- 当日分は最大30件まで蓄積・スコア降順（セッション内）

## 更新履歴（2026-04-01）Build #90

### ランキング1〜3位バッジ画像

| 変更内容 | 影響ファイル |
|---------|-------------|
| ランキング画面の1〜3位順位表示を星バッジ画像に変更（4位以降はテキストのまま） | `RankingScene.tsx` |
| バッジ画像を追加 | `public/assets/rank1.png`, `rank2.png`, `rank3.png` |

### 光の輪スムージング（複数人プレイ改善）

| 変更内容 | 影響ファイル |
|---------|-------------|
| 最近傍マッチングを追加。センサーのフレーム間で配列順が入れ替わっても、各リングが正しい人物を追従し続ける | `SensorManager.ts` |
| EMAスムージング（α=0.25）を追加。センサーノイズによるリングのガタつきを抑制。約4〜5フレームで目標位置に収束 | `SensorManager.ts` |
| チューニング用定数 `SMOOTHING_ALPHA`（ファイル冒頭）で滑らかさを調整可能（0.1=超滑らか/遅め、0.5=速め/少しガタつく） | `SensorManager.ts` |

### スコアバグ修正

| 変更内容 | 影響ファイル |
|---------|-------------|
| キャッチ時スコアが固定値10になっていたバグを修正。`it.char.score`（100/120/150/300）を使用するよう変更 | `useGameLoop.ts` |

---

## 更新履歴（2026-03-30）

### STARTボタン改善

| 変更内容 | 影響ファイル |
|---------|-------------|
| STARTボタンを大きく（fontSize 36→48px）・不透明（border/bg強化）・太字（アニメーション最小opacity 0.25→0.65）に変更 | `TitleScene.tsx` |

### タイトル画面 copyright 修正

| 変更内容 | 影響ファイル |
|---------|-------------|
| copyright を一行表示・フォントサイズ縮小（32→20px、`nowrap`）。版元名込みの正式表記に統一 | `TitleScene.tsx` |

### 作品ごとの copyright 表記を整備

| 変更内容 | 影響ファイル |
|---------|-------------|
| `getCoverCredit()` 関数を追加。萩岩睦美→`©萩岩睦美／平凡社`、陸奥A子→`©陸奥A子／集英社`（版元が異なる作家のみ） | `constants/legal.ts` |
| オススメ・写真画面で、版元が異なる作家は**左下に表紙クレジット**・**右下にキャラクレジット**を分けて表示 | `RecommendScene.tsx`, `PhotoScene.tsx` |

### アトラクトループ追加

| 変更内容 | 影響ファイル |
|---------|-------------|
| タイトル画面で20秒間無操作 → TUTORIAL_VIDEO → タイトル画面 → … のループ（アトラクトモード） | `App.tsx` |
| センサー検知 / STARTボタン押下はアトラクトタイマーをキャンセルしてゲームスタート（TUTORIAL_VIDEO → GAME） | `App.tsx` |
| `tutorialAttractRef` / `attractTimerRef` を追加。`TutorialVideoScene.onEnded` でアトラクト/ゲームを分岐 | `App.tsx` |

### バグ修正：センサー初フレームで光の輪が左端に出る

| 修正内容 | 影響ファイル |
|---------|-------------|
| Hokuyo が人を検知した最初のOSCフレームで `x=0`（左端）を送るため、光の輪が一瞬左端にチラつく → `prevPlayerCount` フィールドを追加し、0→N人検知の初フレームのみ位置更新をスキップ。次フレームから正しい位置で表示 | `SensorManager.ts` |

---

## バグ修正履歴（2026-03-28）

### 一人プレイ時に光の輪が複数表示される不具合を修正

| 修正内容 | 影響ファイル |
|---------|-------------|
| `playerCount=0` の OSC フレームを受信したとき `playerXsNormalized` が前フレームの値のまま残り、光の輪（キャッチャー）がプレイヤー人数より多く表示されていた → 0人フレーム受信時に `playerXsNormalized = []` にリセットし、`emitPlayerXs()` を常に呼ぶよう変更 | `SensorManager.ts` |

---

## バグ修正履歴（2026-03-21）

### 起動時に高得点ランキングが残ったまま初回プレイが始まる不具合を修正（Build #78）

| 修正内容 | 影響ファイル |
|---------|-------------|
| `clearOldRankings()` が前日以前しか削除しないため、当日の過去セッションのスコアが残り初回プレイヤーがランキングに入れなかった → 起動時に `localStorage.removeItem(todayKey())` を追加し当日分もリセット | `App.tsx` |
| `toLocaleDateString()` がロケール依存のため Windows 英語環境でキー形式が変わりランキングが消える可能性 → `YYYY-MM-DD` 固定形式に変更 | `App.tsx` |
