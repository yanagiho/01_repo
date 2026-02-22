import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(err: unknown): State {
        return { hasError: true, message: err instanceof Error ? err.message : String(err) };
    }

    componentDidCatch(error: unknown) {
        console.error("[ErrorBoundary] Caught:", error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ color: "#fff", padding: 24, fontFamily: "monospace" }}>
                    <h2 style={{ margin: 0, marginBottom: 12 }}>アプリがエラーで停止しました</h2>
                    <div style={{ opacity: 0.8, marginBottom: 8 }}>
                        DevTools（開発者ツール）の Console に詳細が出ています。
                    </div>
                    <pre style={{ whiteSpace: "pre-wrap", background: "#111", padding: 12, borderRadius: 8 }}>
                        {this.state.message ?? "(no message)"}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}