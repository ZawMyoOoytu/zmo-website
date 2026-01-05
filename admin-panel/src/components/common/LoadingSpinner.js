import React from 'react';

const LoadingSpinner = ({ size = 'medium', message, className = '' }) => {
  const sizeMap = {
    small: { size: 24, border: 3 },
    medium: { size: 40, border: 4 },
    large: { size: 60, border: 5 }
  };

  const { size: spinnerSize, border: borderSize } = sizeMap[size] || sizeMap.medium;

  const spinnerStyle = {
    width: `${spinnerSize}px`,
    height: `${spinnerSize}px`,
    border: `${borderSize}px solid #f3f3f3`,
    borderTop: `${borderSize}px solid #667eea`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px'
  };

  const messageStyle = {
    color: '#6b7280',
    fontSize: '14px',
    textAlign: 'center',
    maxWidth: '200px',
    lineHeight: '1.5'
  };

  // Add spin animation to document if not already added
  if (!document.querySelector('#spinner-animation')) {
    const style = document.createElement('style');
    style.id = 'spinner-animation';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  return (
    <div className={`loading-spinner ${className}`} style={containerStyle}>
      <div style={spinnerStyle}></div>
      {message && (
        <div style={messageStyle}>
          {message}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;