import React from "react";

type Props = {
    fallback?: React.ReactNode;
    children: React.ReactNode;
};

type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(err: unknown) {
        console.error("[ErrorBoundary]", err);
    }

    render() {
        if (this.state.hasError) return this.props.fallback ?? null;
        return this.props.children;
    }
}