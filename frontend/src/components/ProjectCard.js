import React from 'react';

const ProjectCard = ({ project }) => {
  const { title, description, image, icon = 'fas fa-laptop-code', technologies, liveLink, githubLink } = project;

  return (
    <div className="card project-card">
      <div className="card-image">
        {image ? (
          <img src={image} alt={title} />
        ) : (
          <i className={icon}></i>
        )}
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>
        
        {technologies && (
          <div className="technologies">
            {technologies.map((tech, index) => (
              <span key={index} className="tech-tag">{tech}</span>
            ))}
          </div>
        )}
        
        <div className="project-links">
          {liveLink && (
            <a href={liveLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              Live Demo
            </a>
          )}
          {githubLink && (
            <a href={githubLink} target="_blank" rel="noopener noreferrer" className="card-link">
              <i className="fab fa-github"></i> Code
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;