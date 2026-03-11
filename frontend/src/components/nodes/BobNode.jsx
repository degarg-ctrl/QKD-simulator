import { Handle, Position } from '@xyflow/react';

export default function BobNode({ data }) {
  return (
    <div className="gate-node animate-in" style={{ borderColor: 'rgba(167, 139, 250, 0.4)' }}>
      <Handle type="target" position={Position.Left} style={{ background: '#a78bfa', width: 6, height: 6 }} />
      <div className="gate-icon">🧑‍🔬</div>
      <div className="gate-label">Bob</div>
    </div>
  );
}
