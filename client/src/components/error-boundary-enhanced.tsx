import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onRetry: () => void;
  onGoHome: () => void;
  canRetry: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  onRetry,
  onGoHome,
  canRetry
}) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 text-destructive">
          <AlertTriangle className="h-full w-full" />
        </div>
        <CardTitle>Ops! Algo deu errado</CardTitle>
        <CardDescription>
          Encontramos um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-xs bg-muted p-2 rounded">
            <summary className="cursor-pointer font-medium">
              Detalhes técnicos (desenvolvimento)
            </summary>
            <pre className="mt-2 whitespace-pre-wrap">
              {error.message}
              {errorInfo?.componentStack}
            </pre>
          </details>
        )}
        
        <div className="flex gap-2">
          {canRetry && (
            <Button onClick={onRetry} variant="outline" className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          )}
          <Button onClick={onGoHome} className="flex-1">
            <Home className="mr-2 h-4 w-4" />
            Ir para Início
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

class ErrorBoundaryEnhanced extends Component<Props, State> {
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to monitoring service (Sentry, LogRocket, etc.)
      console.error('Production error logged:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  componentWillUnmount() {
    // Clear any pending timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  handleRetry = () => {
    if (this.state.retryCount >= 3) {
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));

    // Auto-retry after 30 seconds if error persists
    const timeout = setTimeout(() => {
      if (this.state.hasError && this.state.retryCount < 3) {
        this.handleRetry();
      }
    }, 30000);

    this.retryTimeouts.push(timeout);
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          canRetry={this.state.retryCount < 3}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryEnhanced;