// frontend/src/pages/Projects.js
import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';
import './Projects.css';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedProject, setExpandedProject] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log('📁 Fetching projects for user view...');
      
      const result = await projectsAPI.getProjects();
      
      console.log('✅ User view projects:', result);
      
      if (result.success) {
        setProjects(result.data);
        setError('');
        
        // Debug: Check URL data
        console.log('🔍 DEBUG - Project URLs:');
        result.data.forEach((project, index) => {
          console.log(`Project ${index + 1}: "${project.name}"`, {
            liveUrl: project.liveUrl,
            githubUrl: project.githubUrl,
            demoUrl: project.demoUrl,
            hasLiveUrl: !!project.liveUrl,
            hasGithubUrl: !!project.githubUrl,
            hasDemoUrl: !!project.demoUrl
          });
        });
      } else {
        setError('Failed to load projects');
      }
    } catch (err) {
      console.error('❌ Error fetching projects for user:', err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleReadMore = (projectId) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
    } else {
      setExpandedProject(projectId);
    }
  };

  // Function to limit description to 30 words
  const truncateDescription = (description, wordLimit = 30) => {
    if (!description) return '';
    
    const words = description.split(' ');
    if (words.length <= wordLimit) {
      return description;
    }
    
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  // Function to validate and format URLs
  const formatUrl = (url) => {
    if (!url || url === 'undefined' || url === undefined || url === '') {
      return '';
    }
    
    // Ensure URL has proper protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  // Check if URL is valid and not empty
  const hasValidUrl = (url) => {
    return url && url !== 'undefined' && url !== '' && url !== undefined;
  };

  const filteredProjects = projects.filter(project => {
    if (!project) return false;
    return filter === 'all' || (filter === 'featured' && project.featured);
  });

  if (loading) {
    return (
      <div className="projects-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-page">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Projects</h3>
          <p>{error}</p>
          <button onClick={fetchProjects} className="retry-btn">
            <i className="fas fa-redo"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Projects</h1>
          <p className="page-description">
            Here are some of the projects I've worked on. Each project represents 
            a learning experience and a challenge overcome.
          </p>
          
          {/* Filter Tabs */}
          {projects.length > 0 && (
            <div className="project-filters">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Projects ({projects.length})
              </button>
              <button 
                className={`filter-btn ${filter === 'featured' ? 'active' : ''}`}
                onClick={() => setFilter('featured')}
              >
                Featured ({projects.filter(p => p.featured).length})
              </button>
            </div>
          )}
        </div>
        
        {filteredProjects.length === 0 ? (
          <div className="no-projects">
            <i className="fas fa-folder-open"></i>
            <h3>No Projects Found</h3>
            <p>
              {filter === 'featured' 
                ? 'No featured projects available. Check all projects instead.'
                : 'Projects will be displayed here once they are added to the portfolio.'
              }
            </p>
            {filter === 'featured' && (
              <button 
                className="view-all-btn"
                onClick={() => setFilter('all')}
              >
                View All Projects
              </button>
            )}
          </div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map(project => (
              <div key={project._id} className="project-card">
                {/* Project Image */}
                {project.image && (
                  <div className="project-image">
                    <img src={project.image} alt={project.name} />
                    {project.featured && (
                      <div className="featured-ribbon">
                        <i className="fas fa-star"></i>
                        Featured
                      </div>
                    )}
                  </div>
                )}
                
                <div className="project-content">
                  {/* Project Header */}
                  <div className="project-header">
                    <h2 className="project-title">{project.name}</h2>
                    {project.featured && !project.image && (
                      <span className="featured-badge">
                        <i className="fas fa-star"></i>
                        Featured
                      </span>
                    )}
                  </div>
                  
                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="technologies">
                      <div className="tech-tags">
                        {project.technologies.slice(0, 4).map((tech, index) => (
                          <span key={index} className="tech-tag">{tech}</span>
                        ))}
                        {project.technologies.length > 4 && (
                          <span className="tech-tag more">+{project.technologies.length - 4}</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Project Description - Limited to 30 words */}
                  <div className="description-section">
                    <p className="project-description">
                      {truncateDescription(project.description)}
                    </p>
                    
                    {/* Read More Button - Show only if description has more than 30 words */}
                    {project.description && project.description.split(' ').length > 30 && (
                      <button 
                        className="read-more-btn"
                        onClick={() => toggleReadMore(project._id)}
                      >
                        {expandedProject === project._id ? (
                          <>
                            <i className="fas fa-chevron-up"></i>
                            Read Less
                          </>
                        ) : (
                          <>
                            <i className="fas fa-chevron-down"></i>
                            Read More
                          </>
                        )}
                      </button>
                    )}
                    
                    {/* Expanded Content - Shows when Read More is clicked */}
                    {expandedProject === project._id && (
                      <div className="expanded-content">
                        {/* Full Description */}
                        <div className="full-description">
                          <h4>Project Details</h4>
                          <p>{project.description}</p>
                        </div>

                        {/* Project Links - Only show if URLs exist */}
                        {(hasValidUrl(project.liveUrl) || hasValidUrl(project.githubUrl) || hasValidUrl(project.demoUrl)) && (
                          <div className="project-links">
                            <h4>Project Links:</h4>
                            <div className="links-container">
                              {hasValidUrl(project.liveUrl) && (
                                <a 
                                  href={formatUrl(project.liveUrl)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="project-link live-demo"
                                >
                                  <i className="fas fa-external-link-alt"></i>
                                  Live Demo
                                </a>
                              )}
                              {hasValidUrl(project.githubUrl) && (
                                <a 
                                  href={formatUrl(project.githubUrl)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="project-link github"
                                >
                                  <i className="fab fa-github"></i>
                                  View Code
                                </a>
                              )}
                              {hasValidUrl(project.demoUrl) && (
                                <a 
                                  href={formatUrl(project.demoUrl)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="project-link demo"
                                >
                                  <i className="fas fa-play"></i>
                                  Watch Demo
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Additional Project Info */}
                        <div className="project-meta">
                          <div className="meta-item">
                            <i className="fas fa-code"></i>
                            <span>{project.technologies?.length || 0} technologies used</span>
                          </div>
                          {project.createdAt && (
                            <div className="meta-item">
                              <i className="fas fa-calendar"></i>
                              <span>
                                {new Date(project.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Compact Links for non-expanded cards - Only show if URLs exist */}
                  {expandedProject !== project._id && (hasValidUrl(project.liveUrl) || hasValidUrl(project.githubUrl)) && (
                    <div className="project-links compact">
                      <div className="links-container">
                        {hasValidUrl(project.liveUrl) && (
                          <a 
                            href={formatUrl(project.liveUrl)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="project-link live-demo"
                          >
                            <i className="fas fa-external-link-alt"></i>
                            Live Demo
                          </a>
                        )}
                        {hasValidUrl(project.githubUrl) && (
                          <a 
                            href={formatUrl(project.githubUrl)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="project-link github"
                          >
                            <i className="fab fa-github"></i>
                            Code
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Projects;