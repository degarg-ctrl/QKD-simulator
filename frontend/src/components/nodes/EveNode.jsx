import { Handle, Position } from '@xyflow/react';

export default function EveNode({ data }) {
  return (
    <div className="qkd-node animate-in" style={{ borderColor: 'rgba(251, 113, 133, 0.3)' }}>
      <Handle type="target" position={Position.Left} style={{ background: '#fb7185', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#fb7185', width: 8, height: 8 }} />
      <div className="node-header">
        <div className="node-icon" style={{ background: 'rgba(251, 113, 133, 0.15)' }}>🕵️</div>
        <div>
          <div className="node-label" style={{ color: '#fb7185' }}>Eve</div>
          <div className="node-sublabel">Eavesdropper</div>
        </div>
      </div>
      <div className="node-config">
        <div className="node-config-row">
          <label>Attack Type</label>
          <span className="config-value" style={{ background: 'rgba(251, 113, 133, 0.1)', color: '#fb7185' }}>
            {data?.attackType || 'Intercept'}
          </span>
        </div>
        <div className="node-config-row">
          <label>Interception</label>
          <span className="config-value" style={{ background: 'rgba(251, 113, 133, 0.1)', color: '#fb7185' }}>
            {data?.interceptionRate || '50'}%
          </span>
        </div>
        <div className="node-config-row">
          <label>Status</label>
          <span className="config-value" style={{ background: 'rgba(251, 113, 133, 0.1)', color: '#fb7185' }}>
            {data?.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
}
