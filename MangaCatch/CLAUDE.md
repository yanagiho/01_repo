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
    │   │   └── useSensor.ts     ← センサー入力・タッチフォールバック
    │   └── components/scenes/   ← 各シーンのReactコンポーネント
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
- **タイトル画面**: タッチ入力のみ（マウス・キーボード無効）。本番はタッチパネル専用機のため。
- **ゲーム中**: センサー（OSC）優先。センサー未接続時はタッチフォールバック。

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
| オススメ画面 | `アナタがキャッチしたのは` |
| ランキング画面（自分） | `YOU` |

> システムや翻訳機能による日本語変換禁止。カタカナ・英語で厳密にハードコード。

## 写真撮影画面（PhotoScene）

- 解像度: 1920×1080 (Full HD) フル活用
- 黒枠（レターボックス）なし
- フォントサイズ: スコア等 **71pt**、「写真を撮ってね」**70pt**
