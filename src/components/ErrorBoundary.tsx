import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  resetKey?: string | number;
  title?: string;
  compact?: boolean;
  onNavigateHome?: () => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * Resets cleanly on route or resetKey changes so transient UI/canvas faults
 * never leave the workspace stuck on a blank screen.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'An unexpected rendering error occurred.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[LIFE OS ErrorBoundary]', error, info.componentStack);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, message: '' });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: '' });
    this.props.onReset?.();
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { title = 'View Recovery', compact = false, onNavigateHome } = this.props;

    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: compact ? '100%' : 'auto',
          minHeight: compact ? '260px' : '360px',
          padding: '24px',
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: '440px',
            width: '100%',
            padding: '22px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--status-danger-bg)',
              color: 'var(--status-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {title}
            </h2>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {this.state.message}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
            <button type="button" onClick={this.handleReset} className="btn btn-primary btn-sm">
              <RotateCcw size={13} />
              Retry View
            </button>
            {onNavigateHome && (
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, message: '' });
                  onNavigateHome();
                }}
                className="btn btn-secondary btn-sm"
              >
                <Home size={13} />
                Back to Today
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
