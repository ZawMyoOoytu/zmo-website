import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../../services/api';
import './AdminProjects.css';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching projects from live backend...');
      
      const result = await projectsAPI.getAllProjects();
      
      console.log('📦 Backend Response:', result);
      
      if (result.success) {
        console.log(`✅ Loaded ${result.data.length} projects`);
        setProjects(result.data);
      } else {
        setError(result.message || 'Failed to load projects');
      }
    } catch (err) {
      console.error('❌ Error fetching projects:', err);
      setError('Failed to load projects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!projectId) {
      alert('Error: Invalid project ID');
      return;
    }

    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const result = await projectsAPI.deleteProject(projectId);
        if (result.success) {
          alert('Project deleted successfully!');
          fetchProjects(); // Refresh the list
        } else {
          alert('Failed to delete project: ' + result.message);
        }
      } catch (error) {
        console.error('❌ Delete error:', error);
        alert('Error deleting project: ' + error.message);
      }
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="admin-projects">
        <div className="loading">Loading projects from database...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-projects">
        <div className="error-message">
          <h3>Error Loading Projects</h3>
          <p>{error}</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Make sure your backend is running on port 5001 and CORS is enabled.
          </p>
          <button onClick={fetchProjects} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-projects">
      <div className="admin-header">
        <h1>Project Management</h1>
        <button className="btn-primary">
          + Add New Project
        </button>
      </div>

      <div className="projects-stats">
        <p>Total Projects: {projects.length}</p>
      </div>

      {projects.length === 0 ? (
        <div className="no-projects">
          <p>No projects found in database.</p>
          <p>Create your first project to get started!</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project._id || project.id} className="project-card">
              <div className="project-image">
                {project.image ? (
                  <img src={project.image} alt={project.title || project.name} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              
              <div className="project-content">
                <h3>{project.title || project.name}</h3>
                <p className="project-description">
                  {project.description}
                </p>
                
                {project.technologies && project.technologies.length > 0 && (
                  <div className="technologies">
                    <div className="tech-tags">
                      {project.technologies.map((tech, index) => (
                        <span key={index} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="project-meta">
                  <small className="project-id">ID: {project._id || project.id}</small>
                  {project.status && (
                    <span className={`status-badge ${project.status}`}>
                      {project.status}
                    </span>
                  )}
                </div>
                
                <div className="project-links">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                      GitHub
                    </a>
                  )}
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                      Live Demo
                    </a>
                  )}
                </div>
                
                <div className="project-actions">
                  <button className="btn-edit">
                    Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteProject(project._id || project.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProjects;