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
- **タイトル画面**: 本番はタッチ入力のみ想定。ただし現在はマウスクリックでも開始可能（クライアント確認用）。
- **ゲーム中**: センサー（OSC）優先。センサー未接続時はタッチ・マウス移動フォールバック。

### マルチプレイヤー
- 最大3人まで対応。ゲームプレイ中に途中参加（ドロップイン）可能。
- アクティブプレイヤー数に応じてゲームスピードが動的に増加する。

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

## バグ修正履歴（2026-03-21）

### 起動時に高得点ランキングが残ったまま初回プレイが始まる不具合を修正（Build #78）

| 修正内容 | 影響ファイル |
|---------|-------------|
| `clearOldRankings()` が前日以前しか削除しないため、当日の過去セッションのスコアが残り初回プレイヤーがランキングに入れなかった → 起動時に `localStorage.removeItem(todayKey())` を追加し当日分もリセット | `App.tsx` |
| `toLocaleDateString()` がロケール依存のため Windows 英語環境でキー形式が変わりランキングが消える可能性 → `YYYY-MM-DD` 固定形式に変更 | `App.tsx` |
