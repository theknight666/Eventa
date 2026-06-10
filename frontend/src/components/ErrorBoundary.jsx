import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <div className="rounded-full bg-red-500/10 p-4 mb-6">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md mb-8">
            An unexpected error has occurred. Our team has been notified. Please try reloading the page to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-foreground text-background px-6 py-3 font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <RefreshCcw size={18} /> Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
