import ComponentsPanel from './components/ComponentsPanel';
import Workspace from './components/Workspace';
import AnalyticsPanel from './components/AnalyticsPanel';
import QuantumStatePanel from './components/QuantumStatePanel';

export default function App() {
  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <h1>
          <span className="logo-icon">⚛</span>
          QKD Simulator
          <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>
            BB84 Protocol
          </span>
        </h1>
        <div className="header-controls">
          <div className="status-badge ready">
            <span className="status-dot"></span>
            Ready
          </div>
          <button className="header-btn">Reset</button>
          <button className="header-btn primary">▶ Run Simulation</button>
        </div>
      </header>

      {/* Section 1: Components Panel */}
      <ComponentsPanel />

      {/* Section 2: Interactive Workspace */}
      <Workspace />

      {/* Section 3 & 4: Right Panel (stacked) */}
      <div className="panel-right">
        <AnalyticsPanel />
        <QuantumStatePanel />
      </div>
    </div>
  );
}
