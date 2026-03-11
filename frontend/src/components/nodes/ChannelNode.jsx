import { Handle, Position } from '@xyflow/react';

export default function ChannelNode({ data }) {
  return (
    <div className="qkd-node animate-in">
      <Handle type="target" position={Position.Left} style={{ background: '#a78bfa', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#a78bfa', width: 8, height: 8 }} />
      <div className="node-header">
        <div className="node-icon" style={{ background: 'rgba(167, 139, 250, 0.15)' }}>🔗</div>
        <div>
          <div className="node-label" style={{ color: '#a78bfa' }}>Quantum Channel</div>
          <div className="node-sublabel">Fiber Optic Link</div>
        </div>
      </div>
      <div className="node-config">
        <div className="node-config-row">
          <label>Distance</label>
          <span className="config-value" style={{ background: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa' }}>
            {data?.distance || 50} km
          </span>
        </div>
        <div className="node-config-row">
          <label>Loss</label>
          <span className="config-value" style={{ background: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa' }}>
            {data?.loss || '0.2'} dB/km
          </span>
        </div>
        <div className="node-config-row">
          <label>Noise</label>
          <span className="config-value" style={{ background: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa' }}>
            {data?.noise || 'Low'}
          </span>
        </div>
      </div>
    </div>
  );
}
