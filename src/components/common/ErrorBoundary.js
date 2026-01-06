import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    window.history.back();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">🚨</div>
            <h2 className="error-title">Something went wrong</h2>
            <p className="error-message">
              An unexpected error occurred. Our team has been notified.
            </p>
            
            {this.state.error && (
              <details className="error-details">
                <summary>Error Details</summary>
                <div className="error-details-content">
                  <p><strong>Error:</strong> {this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <pre className="error-stack">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className="error-actions">
              <button
                onClick={this.handleReload}
                className="btn-error btn-primary"
              >
                🔄 Reload Page
              </button>
              <button
                onClick={this.handleGoBack}
                className="btn-error btn-secondary"
              >
                ↩️ Go Back
              </button>
              <button
                onClick={this.handleGoHome}
                className="btn-error btn-outline"
              >
                🏠 Go Home
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