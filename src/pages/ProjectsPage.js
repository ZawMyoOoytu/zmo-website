import React from 'react';

const ProjectsPage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <div className="page-header">
        <h1>Projects Management</h1>
        <p>Manage your projects here (Coming Soon)</p>
      </div>
      
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '40px',
        textAlign: 'center',
        marginTop: '20px'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚧</div>
        <h2>Projects Feature Under Development</h2>
        <p style={{ color: '#666', marginBottom: '30px', maxWidth: '600px', margin: '0 auto' }}>
          The projects management feature is currently being developed. 
          You'll be able to create, edit, and manage your projects here soon.
        </p>
        <button 
          onClick={() => window.history.back()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4361ee',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ProjectsPage;