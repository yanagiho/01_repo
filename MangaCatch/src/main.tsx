import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";

// 画面が真っ白になるのを防ぐ（最低でも黒背景）
document.documentElement.style.background = "#000";
document.body.style.margin = "0";
document.body.style.background = "#000";

function showFatal(title: string, detail?: string) {
  const msg = `${title}${detail ? "\n\n" + detail : ""}`;
  console.error("[FATAL]", msg);

  // 画面に必ず出す（Electronでconsoleが見えなくても分かる）
  document.body.innerHTML = `
    <div style="
      width:100vw;height:100vh;background:#000;color:#fff;
      font-family:monospace; padding:24px; box-sizing:border-box;
    ">
      <div style="font-size:22px; font-weight:800; margin-bottom:12px;">エラーで停止しました</div>
      <div style="opacity:0.8; margin-bottom:12px;">
        ターミナル（npm run dev）または DevTools Console に詳細が出ています。
      </div>
      <pre style="
        white-space:pre-wrap; background:#111; padding:12px; border-radius:10px;
        border:1px solid rgba(255,255,255,0.1);
      ">${escapeHtml(msg)}</pre>
    </div>
  `;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// グローバル例外も拾う
window.addEventListener("error", (e) => {
  const err = (e as ErrorEvent).error;
  showFatal("window.onerror", err?.stack || err?.message || String(e.message));
});

window.addEventListener("unhandledrejection", (e) => {
  const r: any = (e as PromiseRejectionEvent).reason;
  showFatal("unhandledrejection", r?.stack || r?.message || String(r));
});

const el = document.getElementById("root");
if (!el) {
  showFatal("index.html に #root がありません", "index.html を確認してください。");
} else {
  createRoot(el).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}