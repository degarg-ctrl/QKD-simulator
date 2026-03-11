const components = [
  {
    category: 'Entities',
    items: [
      { type: 'alice', data: { label: 'ALICE', icon: '👩‍🔬', color: '#60a5fa', type: 'source' }, description: 'Sender & Key Generator' },
      { type: 'bob', data: { label: 'BOB', icon: '🧑‍🔬', color: '#2dd4bf', type: 'sink' }, description: 'Receiver & Decoder' },
      { type: 'eve', data: { label: 'EVE', icon: '🕵️', color: '#fb7185', type: 'gate' }, description: 'Eavesdropper (Adversary)' },
    ],
  },
  {
    category: 'Gates & Modules',
    items: [
      { type: 'gate', data: { label: 'H', icon: 'H', color: '#c084fc', type: 'gate' }, description: 'Hadamard (switch basis)' },
      { type: 'gate', data: { label: 'X', icon: 'X', color: '#34d399', type: 'gate' }, description: 'Pauli-X (NOT, |1⟩)' },
      { type: 'gate', data: { label: 'I', icon: 'I', color: '#94a3b8', type: 'gate' }, description: 'Identity (ideal state)' },
      { type: 'gate', data: { label: 'X-ERR', icon: 'X', color: '#f43f5e', type: 'gate' }, description: 'Pauli-X (bit-flip noise)' },
      { type: 'gate', data: { label: 'Z-ERR', icon: 'Z', color: '#f59e0b', type: 'gate' }, description: 'Pauli-Z (phase decoherence)' },
      { type: 'gate', data: { label: 'ROT', icon: 'R', color: '#10b981', type: 'gate' }, description: 'Phase/Rotation' },
      { type: 'gate', data: { label: 'ATTN', icon: '−dB', color: '#64748b', type: 'gate' }, description: 'Attenuation Node' },
      { type: 'gate', data: { label: 'MEAS', icon: 'M', color: '#ef4444', type: 'gate' }, description: 'Measurement (collapse)' },
      { type: 'gate', data: { label: 'CNOT', icon: '⊕', color: '#a855f7', type: 'gate' }, description: 'Entanglement trap' },
      { type: 'gate', data: { label: 'SWAP', icon: '⇌', color: '#ec4899', type: 'gate' }, description: 'Full packet replace' },
      { type: 'gate', data: { label: 'DARK', icon: '☽', color: '#1e293b', type: 'gate' }, description: 'Dark Count Injector' },
      { type: 'gate', data: { label: 'EFF', icon: 'η', color: '#8b5cf6', type: 'gate' }, description: 'Efficiency Filter' },
    ],
  },
  {
    category: 'Infrastructure',
    items: [
      { type: 'gate', data: { label: 'DET', icon: '📡', color: '#eab308', type: 'gate' }, description: 'Detector' },
      { type: 'gate', data: { label: 'POL', icon: '◰', color: '#38bdf8', type: 'gate' }, description: 'Polarizer' },
    ],
  },
];

export default function ComponentsPanel() {
  const onDragStart = (event, comp) => {
    // Pass both the node type and the complete data payload (icon, color, label)
    const payload = {
      type: comp.type,
      data: comp.data
    };
    event.dataTransfer.setData('application/reactflow-data', JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="ops-panel">
      <div className="ops-header">Components</div>

      {components.map((group) => (
        <div key={group.category} className="ops-group">
          <div className="ops-category">{group.category}</div>
          <div className="ops-grid">
            {group.items.map((comp, idx) => (
              <div
                key={`${comp.data.label}-${idx}`}
                className="ops-tile"
                draggable
                onDragStart={(e) => onDragStart(e, comp)}
                style={{ borderColor: `${comp.data.color}40`, color: comp.data.color }}
              >
                <span className="ops-tile-icon" style={{ fontSize: comp.data.icon.length > 2 ? '14px' : '20px' }}>
                  {comp.data.icon}
                </span>
                <div className="ops-tooltip">
                  <strong>{comp.data.label}</strong>
                  <br/>
                  <span style={{opacity: 0.7, fontSize: '10px'}}>{comp.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
