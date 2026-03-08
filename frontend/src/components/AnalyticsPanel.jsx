export default function AnalyticsPanel() {
  return (
    <div className="panel-section">
      <div className="panel-title">
        <span className="title-icon">📊</span>
        Performance & Security
      </div>

      <div className="metrics-grid">
        <div className="metric-card qber">
          <div className="metric-label">QBER</div>
          <div className="metric-value">
            4.82<span className="metric-unit">%</span>
          </div>
        </div>
        <div className="metric-card skr">
          <div className="metric-label">Secure Key Rate</div>
          <div className="metric-value">
            1.24<span className="metric-unit">kbps</span>
          </div>
        </div>
        <div className="metric-card keylen">
          <div className="metric-label">Sifted Key</div>
          <div className="metric-value">
            128<span className="metric-unit">bits</span>
          </div>
        </div>
        <div className="metric-card efficiency">
          <div className="metric-label">Efficiency</div>
          <div className="metric-value">
            82.3<span className="metric-unit">%</span>
          </div>
        </div>
      </div>

      {/* QBER over Distance Chart */}
      <div className="chart-container">
        <div className="chart-title">QBER vs Distance</div>
        <div className="chart-placeholder">
          <div className="chart-line">
            <svg viewBox="0 0 300 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="qberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,85 Q30,82 60,78 T120,65 T180,45 T240,28 T300,15"
                fill="none"
                stroke="#fb7185"
                strokeWidth="2"
              />
              <path
                d="M0,85 Q30,82 60,78 T120,65 T180,45 T240,28 T300,15 V100 H0 Z"
                fill="url(#qberGrad)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* SKR over Distance Chart */}
      <div className="chart-container">
        <div className="chart-title">Secure Key Rate vs Distance</div>
        <div className="chart-placeholder">
          <div className="chart-line">
            <svg viewBox="0 0 300 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="skrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,15 Q30,18 60,25 T120,40 T180,60 T240,75 T300,88"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="2"
              />
              <path
                d="M0,15 Q30,18 60,25 T120,40 T180,60 T240,75 T300,88 V100 H0 Z"
                fill="url(#skrGrad)"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
