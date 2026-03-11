import { Handle, Position } from '@xyflow/react';

export default function AliceNode({ data }) {
  return (
    <div className="gate-node animate-in" style={{ borderColor: 'rgba(56, 189, 248, 0.4)' }}>
      <Handle type="source" position={Position.Right} style={{ background: '#38bdf8', width: 6, height: 6 }} />
      <div className="gate-icon">👩‍🔬</div>
      <div className="gate-label">Alice</div>
    </div>
  );
}
