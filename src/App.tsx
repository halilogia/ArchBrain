
import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Map, Edit3, FileText, LayoutGrid } from 'lucide-react';
import NebulaMap from './pages/NebulaMap';

import DocsPage from './pages/DocsPage';

import './styles/globals.css';

const NavBar = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const btnStyle = (active: boolean) => ({
        padding: '10px 20px',
        borderRadius: '12px',
        background: active ? '#38bdf8' : 'transparent',
        color: active ? '#0f172a' : '#94a3b8',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: active ? 700 : 500,
        transition: 'all 0.2s'
    });

    return (
        <div style={{
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #334155',
            padding: '8px',
            borderRadius: '16px',
            display: 'flex',
            gap: '8px',
            zIndex: 9999,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
            <Link to="/" style={btnStyle(isActive('/'))}>
                <Map size={18} /> Nebula
            </Link>
            <Link to="/docs" style={btnStyle(isActive('/docs'))}>
                <FileText size={18} /> Docs
            </Link>
        </div>
    );
};

const App: React.FC = () => {
    return (
      <Router>
          <div style={{ width: '100vw', height: '100vh', background: '#020617' }}>
              <NavBar />
              <Routes>
                  <Route path="/" element={<NebulaMap />} />
                  <Route path="/docs" element={<DocsPage />} />
              </Routes>
          </div>
      </Router>
    );
  };

export default App;
