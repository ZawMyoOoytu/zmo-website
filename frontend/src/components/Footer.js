import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Quick Links</h3>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/contact">Contact</Link>
          </div>
          
          <div className="footer-section">
            <h3>Connect</h3>
            <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href="mailto:your@email.com">Email</a>
          </div>
          
          <div className="footer-section">
            <h3>Resources</h3>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <a href="/sitemap.xml">Sitemap</a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Your Portfolio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;