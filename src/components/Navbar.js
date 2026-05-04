import React from 'react';

export default function Navbar({ appliedCount, currentView, setCurrentView }) {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <span className="logo-icon">💼</span>
        <span className="logo-text">JobSwipe</span>
        <span className="logo-badge">AI</span>
      </div>
      <div className="nav-links">
        <button
          className={`nav-btn ${currentView === 'swipe' ? 'active' : ''}`}
          onClick={() => setCurrentView('swipe')}
        >
          🔍 Discover
        </button>
        <button
          className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`nav-btn ${currentView === 'applied' ? 'active' : ''}`}
          onClick={() => setCurrentView('applied')}
        >
          ✅ Applied
          {appliedCount > 0 && <span className="nav-count">{appliedCount}</span>}
        </button>
      </div>
    </nav>
  );
}