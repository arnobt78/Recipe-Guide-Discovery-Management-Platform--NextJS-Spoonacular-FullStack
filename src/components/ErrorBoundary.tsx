/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the component tree,
 * logs them, and displays a fallback UI instead of crashing the app.
 *
 * Following DEVELOPMENT_RULES.md: Comprehensive error handling
 */

import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Class Component
 *
 * Must be a class component (React requirement for Error Boundaries)
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console (in production, send to error tracking service)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReload = () => {
    // Reset error state and reload page
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  private handleReset = () => {
    // Reset error state without reloading
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      // Render custom fallback UI or use provided fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <Card className="glow-card border-red-500/30 max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-400" />
                <CardTitle className="text-red-400">Something went wrong</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                An unexpected error occurred. Please try reloading the page or contact support if the problem persists.
              </p>
              
              {this.state.error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 font-mono text-sm break-all">
                    {this.state.error.message || "Unknown error"}
                  </p>
                </div>
              )}

              {process.env.NODE_ENV === "development" && this.state.errorInfo && (
                <details className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <summary className="text-gray-400 cursor-pointer mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-xs text-gray-500 overflow-auto max-h-64">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={this.handleReload}
                  className="glow-button bg-purple-600 hover:bg-purple-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="glow-button"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

