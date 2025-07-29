import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">📦 Invento-Manage</h1>
          <nav className="nav">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/inventory" 
              className={`nav-link ${isActive('/inventory') ? 'active' : ''}`}
            >
              Inventory
            </Link>
            <Link 
              to="/products" 
              className={`nav-link ${isActive('/products') ? 'active' : ''}`}
            >
              Products
            </Link>
          </nav>
        </div>
      </header>
      <main className="main">
        {children}
      </main>
      <footer className="footer">
        <p>&copy; 2025 Invento-Manage. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
