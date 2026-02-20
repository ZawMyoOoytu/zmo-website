// frontend/src/components/Header.js - MINIMAL MOBILE FIX
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/blogs', label: 'Blog' },
    { path: '/projects', label: 'Projects' },
    { path: '/contact', label: 'Contact' }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    
    // Toggle body class for scroll prevention
    if (!isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.classList.remove('menu-open');
  };

  // Close menu when clicking a link
  const handleLinkClick = () => {
    closeMenu();
  };

  // Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  // Close menu with Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/" onClick={handleLinkClick}>ZawMyoOo</Link>
        </div>
        
        {/* Desktop Navigation - UNCHANGED */}
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className={`menu-toggle ${isMenuOpen ? 'nav-open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Overlay (for closing menu by clicking outside) */}
        <div 
          className="nav-overlay"
          onClick={closeMenu}
          aria-hidden="true"
        ></div>
      </div>
    </header>
  );
}

export default Header;