import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(err: unknown): State {
        return { hasError: true, message: err instanceof Error ? err.stack ?? err.message : String(err) };
    }

    componentDidCatch(error: unknown) {
        console.error('[ErrorBoundary]', error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 24, color: '#fff', fontFamily: 'monospace' }}>
                    <h2 style={{ margin: 0, marginBottom: 12 }}>エラーで停止しました</h2>
                    <div style={{ opacity: 0.85, marginBottom: 10 }}>
                        DevTools（開発者ツール）の Console にも詳細が出ています。
                    </div>
                    <pre style={{ whiteSpace: 'pre-wrap', background: '#111', padding: 12, borderRadius: 8 }}>
                        {this.state.message ?? '(no message)'}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}