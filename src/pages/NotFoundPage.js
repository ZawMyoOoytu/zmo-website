import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../App';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found__content">
        <div className="not-found__icon">404</div>
        <h1 className="not-found__title">Page Not Found</h1>
        <p className="not-found__message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="not-found__actions">
          <Link to={ROUTES.DASHBOARD} className="btn btn-primary">
            Go to Dashboard
          </Link>
          <button 
            className="btn btn-outline" 
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;