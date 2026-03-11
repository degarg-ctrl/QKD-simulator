import { useState, useCallback, useRef, useEffect } from 'react';
import ComponentsPanel from './components/ComponentsPanel';
import Workspace from './components/Workspace';
import AnalyticsPanel from './components/AnalyticsPanel';
import QuantumStatePanel from './components/QuantumStatePanel';
import { WorkspaceProvider } from './components/WorkspaceContext';

export default function App() {
  const [topRatio, setTopRatio] = useState(0.6);
  const [panelWidth, setPanelWidth] = useState(230);
  const [panelOpen, setPanelOpen] = useState(true);

  // Which axis is being dragged: 'row' (horizontal split) or 'col' (panel width)
  const dragAxis = useRef(null);
  const containerRef = useRef(null);

  // ── Horizontal split drag ──
  const onSplitDown = useCallback((e) => {
    e.preventDefault();
    dragAxis.current = 'row';
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, []);

  // ── Panel width drag ──
  const onPanelResizeDown = useCallback((e) => {
    e.preventDefault();
    dragAxis.current = 'col';
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragAxis.current || !containerRef.current) return;

      if (dragAxis.current === 'row') {
        const bounds = containerRef.current.getBoundingClientRect();
        const headerH = 48;
        const available = bounds.height - headerH;
        const y = e.clientY - bounds.top - headerH;
        setTopRatio(Math.max(0.2, Math.min(0.85, y / available)));
      }

      if (dragAxis.current === 'col') {
        const bounds = containerRef.current.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        setPanelWidth(Math.max(120, Math.min(400, x)));
      }
    };

    const onMouseUp = () => {
      if (!dragAxis.current) return;
      dragAxis.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <WorkspaceProvider>
      <div className="app-shell" ref={containerRef}>
        {/* ── Header ── */}
        <header className="app-header">
          <div className="header-left">
            <span className="logo-icon">⚛</span>
            <h1>QKD Simulator</h1>
            <span className="header-tag">BB84</span>
          </div>
          <div className="header-controls">
            <div className="status-badge ready">
              <span className="status-dot" />
              Ready
            </div>
            <button className="header-btn">Reset</button>
            <button className="header-btn primary">▶ Run</button>
          </div>
        </header>

        {/* ── Upper half ── */}
        <div
          className="upper-half"
          style={{ height: `calc((100vh - 48px) * ${topRatio})` }}
        >
          {/* Collapsible + resizable components panel */}
          <div
            className="ops-panel-wrap"
            style={{ width: panelOpen ? panelWidth : 36 }}
          >
            {panelOpen && <ComponentsPanel />}
            <button
              className="ops-toggle"
              onClick={() => setPanelOpen(!panelOpen)}
              title={panelOpen ? 'Collapse' : 'Expand'}
            >
              {panelOpen ? '‹' : '›'}
            </button>
          </div>

          {/* Vertical resize handle */}
          {panelOpen && (
            <div className="col-handle" onMouseDown={onPanelResizeDown} />
          )}

          <div className="workspace-wrapper">
            <Workspace />
          </div>
        </div>

        {/* ── Horizontal drag handle ── */}
        <div className="split-handle" onMouseDown={onSplitDown}>
          <div className="split-handle-bar" />
        </div>

        {/* ── Lower half — fills remaining space ── */}
        <div className="lower-half">
          <div className="lower-panel">
            <AnalyticsPanel />
          </div>
          <div className="lower-divider" />
          <div className="lower-panel">
            <QuantumStatePanel />
          </div>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
