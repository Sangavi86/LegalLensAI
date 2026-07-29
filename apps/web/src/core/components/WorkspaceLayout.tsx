import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import '../../styles/workspace.css';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/upload', label: 'Upload Document', icon: '☁️' },
  { path: '/documents', label: 'My Documents', icon: '📁' },
  { path: '/recent', label: 'Recent Analyses', icon: '⏱️' },
  { path: '/chat', label: 'AI Chat', icon: '💬' },
  { path: '/compare', label: 'Compare Documents', icon: '⚖️' },
  { path: '/clause-library', label: 'Clause Library', icon: '📚' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export const WorkspaceLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="workspace-container">
      {/* LEFT SIDEBAR */}
      <aside className="workspace-sidebar">
        <NavLink to="/dashboard" className="workspace-brand">
          <span className="workspace-brand-logo">⚖️</span>
          <span className="workspace-brand-name">JurisMind AI</span>
        </NavLink>

        <nav className="workspace-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `workspace-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="workspace-nav-item-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="workspace-sidebar-footer">
          <button onClick={handleLogout} className="workspace-logout-btn">
            <span style={{ fontSize: '1.2rem' }}>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="workspace-main">
        {/* TOP BAR */}
        <header className="workspace-topbar">
          <div className="topbar-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search documents, clauses..."
              className="topbar-search-input"
            />
          </div>

          <div className="topbar-actions">
            <button className="topbar-icon-btn">🌐</button>
            <button className="topbar-icon-btn">🔔</button>
            <div className="topbar-profile">
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                  {user?.fullName}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Workspace Admin
                </div>
              </div>
              <div className="topbar-avatar">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* DYNAMIC CONTENT */}
        <div className="workspace-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
