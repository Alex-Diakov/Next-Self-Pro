import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full card-premium p-8 text-center space-y-6 border-error/20">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-error" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-primary tracking-tight">Something went wrong</h1>
              <p className="text-muted text-sm leading-relaxed">
                An unexpected error occurred. We've been notified and are looking into it.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-surface-hover p-3 rounded-lg text-xs font-mono text-error-muted overflow-auto max-h-32 text-left border border-border/50">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-background px-4 py-2.5 rounded-xl font-bold transition-all focus-ring"
              >
                <RefreshCcw className="w-4 h-4" />
                Retry
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 bg-surface hover:bg-surface-hover text-primary px-4 py-2.5 rounded-xl font-bold border border-border transition-all focus-ring"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
