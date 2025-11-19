// admin-panel/src/components/common/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 'medium',
  centered = true,
  className = ''
}) => {
  const sizeClass = `loading-spinner--${size}`;
  const alignmentClass = centered ? 'loading-spinner--centered' : '';
  
  return (
    <div className={`loading-spinner ${sizeClass} ${alignmentClass} ${className}`}>
      <div className="loading-spinner__animation" role="status">
        <span className="loading-spinner__sr-only">Loading...</span>
      </div>
      {message && <p className="loading-spinner__message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;