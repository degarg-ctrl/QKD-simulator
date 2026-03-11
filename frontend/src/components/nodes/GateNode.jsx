import { Handle, Position } from '@xyflow/react';

export default function GateNode({ data }) {
  // Use provided color or fallback to a default grey-blue
  const color = data?.color || '#94a3b8';
  
  return (
    <div className="gate-node animate-in" style={{ borderColor: `${color}80` }}>
      {/* Dynamic handles — only render target if not a pure source (like Alice), only source if not pure sink (like Bob) */}
      {data?.type !== 'source' && (
        <Handle 
          type="target" 
          position={Position.Left} 
          style={{ background: color, width: 6, height: 6 }} 
        />
      )}
      {data?.type !== 'sink' && (
        <Handle 
          type="source" 
          position={Position.Right} 
          style={{ background: color, width: 6, height: 6 }} 
        />
      )}
      
      <div className="gate-icon" style={{ color: color }}>
        {data?.icon || '⚙️'}
      </div>
      <div className="gate-label" style={{ color: color }}>
        {data?.label || 'GATE'}
      </div>
    </div>
  );
}
