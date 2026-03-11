import { Handle, Position } from '@xyflow/react';

export default function ChannelNode({ data }) {
  return (
    <div className="gate-node animate-in" style={{ borderColor: 'rgba(45, 212, 191, 0.4)' }}>
      <Handle type="target" position={Position.Left} style={{ background: '#2dd4bf', width: 6, height: 6 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#2dd4bf', width: 6, height: 6 }} />
      <div className="gate-icon">🔗</div>
      <div className="gate-label">Ch</div>
    </div>
  );
}
