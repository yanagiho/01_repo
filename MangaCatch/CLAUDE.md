# MangaCatch — CLAUDE.md

## プロジェクト概要

Electron + React + TypeScript + Vite で構築された、タッチレスラクティブ（非接触センサー）対応のゲームアプリ。
センサーから受信したプレイヤー位置でキャラクターを操作し、落下するアイテムをキャッチするゲーム。

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
    │   └── components/scenes/   ← 各シーンのReactコンポーネント
    ├── osc-bridge.mjs           ← ChromeBook開発環境用WebSocketブリッジ
    └── public/assets/           ← 画像・動画アセット
```

## センサー通信フロー

### Windows / Mac（本番）
```
タッチレスラクティブ
  → UDP OSC (ポート 7000)
  → electron/main.ts（UDPサーバー・OSCパース）
  → IPC (electronAPI.onOscData)
  → SensorManager.ts
```

### ChromeBook Crostini（開発）
```
タッチレスラクティブ
  → UDP OSC (ポート 7000)
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

# 通常開発 (Electron + Vite)
npm run dev

# ChromeBook開発環境（OSCブリッジ同時起動）
npm run dev:chromebook

# Webアセットのみビルド
npm run build:web

# Windows向けローカルビルド（フォルダ形式、単体exeではない）
npm run dist:win
```

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

`--disable-gpu` は `process.platform === 'linux'` のときのみ適用（[electron/main.ts:592-594](electron/main.ts)）。

## OSCポート

| 用途 | ポート |
|---|---|
| タッチレスラクティブ → アプリ (UDP) | **7000** |
| osc-bridge.mjs WebSocket | **8765** |

## シーン構成

`TitleScene` → `TutorialVideoScene` → `TutorialScene` → `GameScene` → `ResultScene` → `RankingScene` → `RecommendScene` → `PhotoScene`
