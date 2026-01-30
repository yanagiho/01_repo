#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- options ----
// 実際にファイルを変更するには --run が必要（安全のため）
// 例）node 01_repo/scripts/sync_assets.mjs --run --clean
const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run") || !args.has("--run");
const MOVE = args.has("--move");     // 原本(00_raw_assets)から削除したいときだけ
const CLEAN = args.has("--clean");   // 出力先を一旦空にしてから作り直す

function log(...a) {
  console.log(...a);
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(p) {
  if (!DRY_RUN) await fs.mkdir(p, { recursive: true });
}

async function rmDir(p) {
  if (!DRY_RUN) await fs.rm(p, { recursive: true, force: true });
}

async function readDirSafe(p) {
  try {
    return await fs.readdir(p, { withFileTypes: true });
  } catch {
    return [];
  }
}

async function walkPngFiles(dir) {
  const out = [];
  const entries = await readDirSafe(dir);

  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);

    if (e.isDirectory()) {
      out.push(...(await walkPngFiles(full)));
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (ext === ".png") out.push(full);
    }
  }
  return out;
}

function naturalSort(a, b) {
  return a.localeCompare(b, "ja", { numeric: true, sensitivity: "base" });
}

function pad(n, width) {
  return String(n).padStart(width, "0");
}

async function statSize(p) {
  const s = await fs.stat(p);
  return s.size;
}

// ---- paths (あなたの構成に合わせて自動決定) ----
// script: 01_repo/scripts/sync_assets.mjs
// raw:    (01_repoの1つ上)/00_raw_assets
// app:    01_repo/MangaCatch
const REPO_ROOT = path.resolve(__dirname, "..");          // .../01_repo
const WORKSPACE_ROOT = path.resolve(REPO_ROOT, "..");    // .../Desktop/MangaCatch (想定)
const RAW_ROOT = path.resolve(WORKSPACE_ROOT, "00_raw_assets");
const APP_ROOT = path.resolve(REPO_ROOT, "MangaCatch");
const OUT_ROOT = path.resolve(APP_ROOT, "public", "assets");
const MANIFEST_OUT = path.resolve(OUT_ROOT, "asset_manifest.json");

// ---- category rules ----
// 00_raw_assets 直下にあるフォルダ名を「部分一致」で探します（多少の _ の違いもOK）
const CATEGORIES = [
  {
    key: "covers",
    includeAny: ["書影", "cover"],
    dstDir: path.join(OUT_ROOT, "covers"),
    prefix: "cover",
  },
  {
    key: "characters",
    includeAny: ["切り抜き", "キャラクター", "chara", "character"],
    dstDir: path.join(OUT_ROOT, "characters"),
    prefix: "chara",
  },
];

async function findSourceDir(cat) {
  const entries = await readDirSafe(RAW_ROOT);
  const dirs = entries.filter((d) => d.isDirectory()).map((d) => d.name);

  const cand = dirs.find((name) => cat.includeAny.some((t) => name.includes(t)));
  if (!cand) return null;
  return path.join(RAW_ROOT, cand);
}

async function main() {
  log("=== Asset Sync ===");
  log("RAW_ROOT :", RAW_ROOT);
  log("APP_ROOT :", APP_ROOT);
  log("OUT_ROOT :", OUT_ROOT);
  log("mode     :", DRY_RUN ? "dry-run (no file changes)" : (MOVE ? "move" : "copy"));

  if (!(await exists(RAW_ROOT))) throw new Error(`RAW_ROOT not found: ${RAW_ROOT}`);
  if (!(await exists(APP_ROOT))) throw new Error(`APP_ROOT not found: ${APP_ROOT}`);

  if (CLEAN) {
    log("clean: removing", OUT_ROOT);
    await rmDir(OUT_ROOT);
  }
  await ensureDir(OUT_ROOT);

  const manifest = {
    generatedAt: new Date().toISOString(),
    mode: DRY_RUN ? "dry-run" : (MOVE ? "move" : "copy"),
    covers: [],
    characters: [],
  };

  let planned = 0;
  let done = 0;

  for (const cat of CATEGORIES) {
    const srcDir = await findSourceDir(cat);
    if (!srcDir) {
      log(`- ${cat.key}: source dir not found in ${RAW_ROOT} (match: ${cat.includeAny.join(", ")})`);
      continue;
    }

    const files = (await walkPngFiles(srcDir)).sort(naturalSort);
    log(`- ${cat.key}: ${files.length} png found in ${srcDir}`);
    if (files.length === 0) continue;

    await ensureDir(cat.dstDir);

    for (let i = 0; i < files.length; i++) {
      const src = files[i];
      const base = `${cat.prefix}_${pad(i + 1, 3)}.png`;
      const dst = path.join(cat.dstDir, base);

      planned++;

      // ここで「リネーム済みファイル名」で出力先に作ります
      if (!DRY_RUN) {
        await fs.copyFile(src, dst);

        // コピー検証（サイズ一致チェック）
        const [a, b] = await Promise.all([statSize(src), statSize(dst)]);
        if (a !== b) throw new Error(`Size mismatch: ${src} (${a}) -> ${dst} (${b})`);

        if (MOVE) {
          await fs.unlink(src); // 原本から消したい場合だけ
        }
        done++;
      }

      manifest[cat.key].push({
        id: path.parse(base).name,
        file: `assets/${cat.key}/${base}`,
        src: path.relative(RAW_ROOT, src),
      });
    }
  }

  // manifest を public/assets に生成（ゲーム側が参照できる）
  const json = JSON.stringify(manifest, null, 2);
  log("manifest:", MANIFEST_OUT);
  if (!DRY_RUN) {
    await ensureDir(path.dirname(MANIFEST_OUT));
    await fs.writeFile(MANIFEST_OUT, json, "utf8");
  }

  log("planned:", planned, "done:", done);

  if (DRY_RUN) {
    log("NOTE: dry-run なので、ファイルは一切変更していません。実行するには --run を付けてください。");
  } else {
    log("OK: assets synced.");
  }

  log("\n確認場所:");
  log("  covers     ->", path.join(OUT_ROOT, "covers"));
  log("  characters ->", path.join(OUT_ROOT, "characters"));
}

main().catch((err) => {
  console.error("\n[ERROR]", err?.message ?? err);
  process.exitCode = 1;
});
