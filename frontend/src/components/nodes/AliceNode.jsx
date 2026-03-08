import { Handle, Position } from '@xyflow/react';

export default function AliceNode({ data }) {
  return (
    <div className="qkd-node animate-in">
      <Handle type="source" position={Position.Right} style={{ background: '#38bdf8', width: 8, height: 8 }} />
      <div className="node-header">
        <div className="node-icon" style={{ background: 'rgba(56, 189, 248, 0.15)' }}>👩‍🔬</div>
        <div>
          <div className="node-label" style={{ color: '#38bdf8' }}>Alice</div>
          <div className="node-sublabel">Sender / Key Generator</div>
        </div>
      </div>
      <div className="node-config">
        <div className="node-config-row">
          <label>Key Length</label>
          <span className="config-value">{data?.keyLength || 256} bits</span>
        </div>
        <div className="node-config-row">
          <label>Photon Source</label>
          <span className="config-value">{data?.photonSource || 'Single'}</span>
        </div>
        <div className="node-config-row">
          <label>Protocol</label>
          <span className="config-value">BB84</span>
        </div>
      </div>
    </div>
  );
}
