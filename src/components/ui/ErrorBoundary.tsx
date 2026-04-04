import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Icon } from './Icon';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
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
    console.error('Uncaught error in component:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-6 h-full min-h-[200px] bg-surface/50 border border-border/50 rounded-2xl text-center">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
            <Icon name="warning" className="text-2xl text-error-muted" />
          </div>
          <h3 className="text-sm font-bold text-primary mb-2">
            {this.props.fallbackMessage || 'Не удалось загрузить модуль'}
          </h3>
          <p className="text-xs text-subtle mb-4 max-w-[250px]">
            {this.state.error?.message || 'An unexpected error occurred during rendering.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-surface-hover hover:bg-border/50 text-secondary text-xs font-medium rounded-lg transition-colors focus-ring"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
