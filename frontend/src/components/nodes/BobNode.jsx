import { Handle, Position } from '@xyflow/react';

export default function BobNode({ data }) {
  return (
    <div className="qkd-node animate-in">
      <Handle type="target" position={Position.Left} style={{ background: '#2dd4bf', width: 8, height: 8 }} />
      <div className="node-header">
        <div className="node-icon" style={{ background: 'rgba(45, 212, 191, 0.15)' }}>🧑‍🔬</div>
        <div>
          <div className="node-label" style={{ color: '#2dd4bf' }}>Bob</div>
          <div className="node-sublabel">Receiver / Decoder</div>
        </div>
      </div>
      <div className="node-config">
        <div className="node-config-row">
          <label>Detector Type</label>
          <span className="config-value">{data?.detectorType || 'APD'}</span>
        </div>
        <div className="node-config-row">
          <label>Efficiency</label>
          <span className="config-value">{data?.efficiency || '85'}%</span>
        </div>
        <div className="node-config-row">
          <label>Dark Count</label>
          <span className="config-value">{data?.darkCount || '1e-6'}</span>
        </div>
      </div>
    </div>
  );
}
