import { Component } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, isOffline: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  componentDidMount() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  handleOnline = () => {
    this.setState({ isOffline: false });
  };

  handleOffline = () => {
    this.setState({ isOffline: true });
  };

  render() {
    if (this.state.isOffline) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6"
          style={{ background: 'var(--color-surface-950)' }}>
          <div className="glass-card p-8 text-center max-w-md w-full">
            <WifiOff size={48} className="mx-auto mb-4" style={{ color: 'var(--color-primary-500)' }} />
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Connection Lost
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-surface-400)' }}>
              It looks like you&apos;re offline. The app will automatically reconnect when your internet is back.
            </p>
            <div className="spinner mx-auto" />
          </div>
        </div>
      );
    }

    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6"
          style={{ background: 'var(--color-surface-950)' }}>
          <div className="glass-card p-8 text-center max-w-md w-full">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Something went wrong
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-surface-400)' }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}>
              <RefreshCw size={16} />
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
