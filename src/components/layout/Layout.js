// admin-panel/src/components/layout/Layout.js
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '20px', background: '#f5f5f5' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;