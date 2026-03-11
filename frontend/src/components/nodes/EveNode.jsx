import { Handle, Position } from '@xyflow/react';

export default function EveNode({ data }) {
  return (
    <div className="gate-node animate-in" style={{ borderColor: 'rgba(251, 113, 133, 0.4)' }}>
      <Handle type="target" position={Position.Left} style={{ background: '#fb7185', width: 6, height: 6 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#fb7185', width: 6, height: 6 }} />
      <div className="gate-icon">🕵️</div>
      <div className="gate-label" style={{ color: '#fb7185' }}>Eve</div>
    </div>
  );
}
