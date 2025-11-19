import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = ({ children }) => {
  const [isSidebarOnLeft, setIsSidebarOnLeft] = useState(true);

  const toggleSidebarPosition = () => {
    setIsSidebarOnLeft(!isSidebarOnLeft);
  };

  return (
    <div className="layout">
      {/* Sidebar - position changes based on state */}
      <div className={`sidebar-container ${isSidebarOnLeft ? 'sidebar-left' : 'sidebar-right'}`}>
        <Sidebar onAdminPanelClick={toggleSidebarPosition} />
      </div>

      {/* Main content */}
      <div className={`main-content ${isSidebarOnLeft ? 'content-with-left-sidebar' : 'content-with-right-sidebar'}`}>
        <Header />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;