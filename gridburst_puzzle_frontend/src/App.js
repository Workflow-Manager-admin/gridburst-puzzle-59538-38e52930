import React from 'react';
import './App.css';
import GridBurstMain from './GridBurstMain';

// PUBLIC_INTERFACE
function App() {
  return (
    <div className="app" style={{ background: "#fafbfc" }}>
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol">*</span> GridBurst Puzzle
            </div>
            <button className="btn" style={{ visibility: 'hidden' }}>
              {/* Placeholder to maintain navbar layout */}
              Hidden
            </button>
          </div>
        </div>
      </nav>
      <main>
        <GridBurstMain />
      </main>
    </div>
  );
}

export default App;