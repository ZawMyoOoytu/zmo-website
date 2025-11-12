// src/components/common/BlogError.js
import React from 'react';

const BlogError = ({ message, onRetry }) => {
  return (
    <div className="error-container">
      <h3>Error Loading Blogs</h3>
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-retry">
          Try Again
        </button>
      )}
    </div>
  );
};

export default BlogError;