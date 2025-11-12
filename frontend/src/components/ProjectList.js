import React, { useState, useEffect } from 'react';
import './ProjectList.css';

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log('📁 Fetching projects from backend...');
      
      const response = await fetch('http://localhost:5000/api/projects');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Projects fetched:', data);
      
      // Ensure we have an array
      const projectsData = data.data || data;
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setError('');
    } catch (err) {
      console.error('❌ Error fetching projects:', err);
      setError('Failed to load projects. Please check if the backend is running.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="project-list">
        <div className="loading">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-list">
        <div className="error-message">
          <h3>Error Loading Projects</h3>
          <p>{error}</p>
          <button onClick={fetchProjects} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-list">
      <h1>My Projects</h1>
      
      {projects.length === 0 ? (
        <div className="no-projects">
          <p>No projects available yet.</p>
          <p>Check back later or add projects in the admin panel.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project._id} className="project-card">
              {project.image && (
                <div className="project-image">
                  <img src={project.image} alt={project.name} />
                </div>
              )}
              
              <div className="project-content">
                <h2>{project.name}</h2>
                
                <p className="project-description">{project.description}</p>
                
                {project.technologies && project.technologies.length > 0 && (
                  <div className="technologies">
                    <h4>Technologies:</h4>
                    <div className="tech-tags">
                      {project.technologies.map(tech => (
                        <span key={tech} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="project-links">
                  {project.githubUrl && (
                    <a 
                      href={project.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="project-link github"
                    >
                      <span>📁</span> GitHub
                    </a>
                  )}
                  {project.liveUrl && (
                    <a 
                      href={project.liveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="project-link live-demo"
                    >
                      <span>🚀</span> Live Demo
                    </a>
                  )}
                </div>
                
                {project.featured && (
                  <span className="featured-badge">⭐ Featured</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectList;