import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Example error reporting function (replace with your actual service)
const logErrorToService = (error, errorInfo) => {
  // Example with Sentry:
  // import * as Sentry from '@sentry/react';
  // Sentry.captureException(error, { extra: errorInfo });
  
  // Example with custom service:
  // fetch('/api/log-error', {
  //   method: 'POST',
  //   body: JSON.stringify({ error, errorInfo })
  // });
  
  console.error('Production error:', error, errorInfo);
};

// Proper Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    console.error('Error caught by Error Boundary:', error, errorInfo);
    
    // Production error reporting
    if (process.env.NODE_ENV === 'production') {
      logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  }

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    // Enhanced error reporting with user context
    const errorData = {
      error: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };
    console.log('Error report data:', errorData);
    alert('Error has been logged. Thank you for reporting!');
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when error occurs
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h2 style={{ color: '#dc2626' }}>Something went wrong</h2>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            The application encountered an unexpected error.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ 
              whiteSpace: 'pre-wrap', 
              margin: '1rem 0',
              padding: '1rem',
              background: '#f3f4f6',
              borderRadius: '6px',
              textAlign: 'left',
              fontSize: '0.875rem'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                Error Details
              </summary>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          )}
          
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button 
              onClick={this.handleReset}
              style={{ 
                padding: '0.5rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Reload Application
            </button>
            
            <button 
              onClick={this.handleReportError}
              style={{ 
                padding: '0.5rem 1.5rem',
                background: 'transparent',
                color: '#3b82f6',
                border: '1px solid #3b82f6',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Report Error
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Get the root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Please ensure there is a div with id="root" in your HTML.');
}

// Create root
const root = ReactDOM.createRoot(rootElement);

// Loading spinner component (could be extracted to a separate file)
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }}>
    <div style={{
      display: 'inline-block',
      width: '40px',
      height: '40px',
      border: '3px solid rgba(59, 130, 246, 0.3)',
      borderTopColor: '#3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Render the app
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <React.Suspense fallback={<LoadingSpinner />}>
        <App />
      </React.Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);

// Development-only console warning
if (typeof window !== 'undefined') {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log(
      '%c🚀 Development mode',
      'color: #3b82f6; font-weight: bold; font-size: 12px;'
    );
    console.log('Consider using React DevTools for debugging: https://react.dev/learn/react-developer-tools');
  }
  
  // Performance monitoring suggestion
  if (process.env.NODE_ENV === 'production') {
    // Consider adding performance monitoring here
    // Example: window.addEventListener('load', trackPerformance);
  }
}