import { useState } from 'react';

// Mock bit stream data — comparing Alice and Bob
const mockBitStream = [
  { idx: 0, aliceBit: 1, aliceBasis: '+', bobBasis: '+', bobBit: 1, match: true, sifted: true },
  { idx: 1, aliceBit: 0, aliceBasis: '×', bobBasis: '+', bobBit: 1, match: false, sifted: false },
  { idx: 2, aliceBit: 1, aliceBasis: '+', bobBasis: '+', bobBit: 1, match: true, sifted: true },
  { idx: 3, aliceBit: 0, aliceBasis: '×', bobBasis: '×', bobBit: 0, match: true, sifted: true },
  { idx: 4, aliceBit: 1, aliceBasis: '+', bobBasis: '×', bobBit: 0, match: false, sifted: false },
  { idx: 5, aliceBit: 0, aliceBasis: '+', bobBasis: '+', bobBit: 0, match: true, sifted: true },
  { idx: 6, aliceBit: 1, aliceBasis: '×', bobBasis: '×', bobBit: 1, match: true, sifted: true },
  { idx: 7, aliceBit: 0, aliceBasis: '+', bobBasis: '×', bobBit: 1, match: false, sifted: false },
  { idx: 8, aliceBit: 1, aliceBasis: '×', bobBasis: '+', bobBit: 0, match: false, sifted: false },
  { idx: 9, aliceBit: 0, aliceBasis: '+', bobBasis: '+', bobBit: 0, match: true, sifted: true },
  { idx: 10, aliceBit: 1, aliceBasis: '×', bobBasis: '×', bobBit: 1, match: true, sifted: true },
  { idx: 11, aliceBit: 1, aliceBasis: '+', bobBasis: '+', bobBit: 1, match: true, sifted: true },
];

// Mock audit log entries
const mockAuditLog = [
  { time: '00:00.0', tag: 'info', msg: 'Protocol initialized — BB84 mode' },
  { time: '00:00.1', tag: 'info', msg: 'Alice generated 256 random bits' },
  { time: '00:00.2', tag: 'info', msg: 'Alice selected random bases (+, ×)' },
  { time: '00:00.4', tag: 'info', msg: 'Photons transmitted over 50km channel' },
  { time: '00:00.5', tag: 'warn', msg: 'Channel loss: 12 photons lost (attenuation)' },
  { time: '00:00.7', tag: 'info', msg: 'Bob measured with random basis selection' },
  { time: '00:01.0', tag: 'sift', msg: 'Basis reconciliation: 128/256 bases matched' },
  { time: '00:01.2', tag: 'sift', msg: 'Sifted key length: 128 bits' },
  { time: '00:01.5', tag: 'info', msg: 'Error estimation: QBER = 4.82%' },
  { time: '00:01.6', tag: 'info', msg: 'QBER below threshold (11%) — key is secure' },
  { time: '00:02.0', tag: 'info', msg: 'Secure key extracted: 98 bits' },
];

export default function QuantumStatePanel() {
  const [activeTab, setActiveTab] = useState('bitstream');

  return (
    <div className="panel-section">
      <div className="panel-title">
        <span className="title-icon">🔬</span>
        Quantum State & Data
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        <button
          onClick={() => setActiveTab('bitstream')}
          style={{
            padding: '5px 14px',
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            background: activeTab === 'bitstream' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'bitstream' ? '#38bdf8' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
        >
          Bit Stream
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '5px 14px',
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            background: activeTab === 'audit' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'audit' ? '#38bdf8' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
        >
          Audit Log
        </button>
      </div>

      {activeTab === 'bitstream' && (
        <div className="bit-stream-section animate-in">
          <table className="bit-stream-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Alice Bit</th>
                <th>A. Basis</th>
                <th>B. Basis</th>
                <th>Bob Bit</th>
                <th>Match</th>
              </tr>
            </thead>
            <tbody>
              {mockBitStream.map((row) => (
                <tr key={row.idx} style={{ opacity: row.sifted ? 1 : 0.4 }}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 10 }}>{row.idx}</td>
                  <td>
                    <span className={`bit-cell ${row.aliceBit === 0 ? 'zero' : 'one'}`}>
                      {row.aliceBit}
                    </span>
                  </td>
                  <td>
                    <span className={`basis-cell ${row.aliceBasis === '+' ? 'rectilinear' : 'diagonal'}`}>
                      {row.aliceBasis}
                    </span>
                  </td>
                  <td>
                    <span className={`basis-cell ${row.bobBasis === '+' ? 'rectilinear' : 'diagonal'}`}>
                      {row.bobBasis}
                    </span>
                  </td>
                  <td>
                    <span className={`bit-cell ${row.bobBit === 0 ? 'zero' : 'one'}`}>
                      {row.bobBit}
                    </span>
                  </td>
                  <td>
                    <span className={`match-cell ${row.match ? 'match' : 'mismatch'}`}>
                      {row.match ? '✓' : '✗'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="audit-log animate-in">
          {mockAuditLog.map((entry, i) => (
            <div className="log-entry" key={i}>
              <span className="log-time">{entry.time}</span>
              <span className={`log-tag ${entry.tag}`}>{entry.tag}</span>
              <span className="log-msg">{entry.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
