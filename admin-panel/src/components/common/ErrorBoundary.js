import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Increment retry count
    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1
    }));
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // If we've retried too many times, show a different message
      if (this.state.retryCount >= 3) {
        return (
          <div className="error-boundary">
            <div className="error-boundary__content">
              <h2>Application Error</h2>
              <p>We're experiencing technical difficulties. Please try again later.</p>
              <div className="error-boundary__actions">
                <button 
                  className="btn btn-primary"
                  onClick={this.handleGoHome}
                >
                  Go to Homepage
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <h2>Something went wrong</h2>
            <p>We're sorry, but something went wrong. You can try reloading the page.</p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="error-boundary__details">
                <summary>Error Details (Development)</summary>
                <pre>{this.state.error && this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
            
            <div className="error-boundary__actions">
              <button 
                className="btn btn-primary"
                onClick={this.handleRetry}
              >
                Try Again
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;