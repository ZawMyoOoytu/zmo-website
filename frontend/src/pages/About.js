import React from 'react';
import './About.css';
import profilePhoto from '../assets/images/profile.jpg'; // Make sure this path is correct

const About = () => {
  const skills = [
    { name: 'React.js', level: 90, category: 'frontend' },
    { name: 'Node.js', level: 85, category: 'backend' },
    { name: 'JavaScript', level: 95, category: 'language' },
    { name: 'Python', level: 80, category: 'language' },
    { name: 'MongoDB', level: 75, category: 'database' },
    { name: 'Express.js', level: 85, category: 'backend' },
    { name: 'CSS3', level: 90, category: 'frontend' },
    { name: 'Git', level: 88, category: 'tool' }
  ];

  const experiences = [
    {
      year: '2024 - Present',
      role: 'Full Stack Developer',
      company: 'Freelance',
      description: 'Building responsive web applications using MERN stack for various clients worldwide.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Express']
    },
    {
      year: '2022 - 2024',
      role: 'Frontend Developer',
      company: 'Tech Solutions',
      description: 'Developed and maintained user interfaces for enterprise-level applications.',
      technologies: ['React', 'TypeScript', 'Redux', 'SASS']
    },
    {
      year: '2020 - 2022',
      role: 'Web Developer',
      company: 'Digital Agency',
      description: 'Created responsive websites and web applications for small to medium businesses.',
      technologies: ['JavaScript', 'PHP', 'WordPress', 'jQuery']
    }
  ];

  const handleImageError = (e) => {
    console.error('Failed to load profile image');
    e.target.style.display = 'none';
    const fallback = e.target.nextSibling;
    if (fallback && fallback.classList.contains('profile-fallback')) {
      fallback.style.display = 'flex';
    }
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Crafting Digital 
                <span className="gradient-text"> Experiences</span> 
                That Matter
              </h1>
              <p className="hero-description">
                I'm a passionate full-stack developer with 4+ years of experience creating 
                innovative web solutions. I specialize in turning complex problems into 
                simple, beautiful, and intuitive designs.
              </p>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Projects Completed</span>
                </div>
                <div className="stat">
                  <span className="stat-number">4+</span>
                  <span className="stat-label">Years Experience</span>
                </div>
                <div className="stat">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Client Satisfaction</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="floating-card card-1">
                <i className="fab fa-react"></i>
                <span>React</span>
              </div>
              <div className="floating-card card-2">
                <i className="fab fa-node-js"></i>
                <span>Node.js</span>
              </div>
              <div className="floating-card card-3">
                <i className="fab fa-js"></i>
                <span>JavaScript</span>
              </div>
              
              {/* Profile Photo Section with Your Photo */}
              <div className="profile-container">
                <div className="profile-image-wrapper">
                  <div className="profile-image">
                    <img 
                      src={profilePhoto}
                      alt="ZawMyoOo - Full Stack Developer"
                      className="profile-photo"
                      onError={handleImageError}
                    />
                    <div className="profile-fallback">
                      <i className="fas fa-user"></i>
                      <span>ZawMyoOo</span>
                    </div>
                  </div>
                  
                  <div className="circle circle-1"></div>
                  <div className="circle circle-2"></div>
                  <div className="circle circle-3"></div>
                  
                  <div className="status-indicator">
                    <div className="status-dot"></div>
                    <span>Available for work</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of your sections */}
      <section className="skills-section">
        <div className="container">
          <div className="section-header">
            <h2>Technical Skills</h2>
            <p>Technologies and tools I work with</p>
          </div>
          <div className="skills-grid">
            {skills.map((skill, index) => (
              <div key={index} className="skill-card">
                <div className="skill-header">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-percentage">{skill.level}%</span>
                </div>
                <div className="skill-bar">
                  <div 
                    className="skill-progress" 
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
                <span className="skill-category">{skill.category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="experience-section">
        <div className="container">
          <div className="section-header">
            <h2>Professional Journey</h2>
            <p>My career path and experiences</p>
          </div>
          <div className="timeline">
            {experiences.map((exp, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <span className="timeline-year">{exp.year}</span>
                  <h3 className="timeline-role">{exp.role}</h3>
                  <span className="timeline-company">{exp.company}</span>
                  <p className="timeline-description">{exp.description}</p>
                  <div className="timeline-tech">
                    {exp.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="philosophy-section">
        <div className="container">
          <div className="philosophy-grid">
            <div className="philosophy-card">
              <div className="card-icon">
                <i className="fas fa-lightbulb"></i>
              </div>
              <h3>Innovation First</h3>
              <p>I believe in pushing boundaries and exploring new technologies to create cutting-edge solutions.</p>
            </div>
            <div className="philosophy-card">
              <div className="card-icon">
                <i className="fas fa-code"></i>
              </div>
              <h3>Clean Code</h3>
              <p>Writing maintainable, scalable, and efficient code is at the core of everything I build.</p>
            </div>
            <div className="philosophy-card">
              <div className="card-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>User Focused</h3>
              <p>Every project starts with understanding user needs and delivering exceptional experiences.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;