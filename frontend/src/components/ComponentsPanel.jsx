const components = [
  {
    category: 'Entities',
    items: [
      {
        type: 'alice',
        label: 'Alice',
        description: 'Sender & key generator',
        icon: '👩‍🔬',
        iconClass: 'alice',
      },
      {
        type: 'bob',
        label: 'Bob',
        description: 'Receiver & decoder',
        icon: '🧑‍🔬',
        iconClass: 'bob',
      },
      {
        type: 'eve',
        label: 'Eve',
        description: 'Eavesdropper (adversary)',
        icon: '🕵️',
        iconClass: 'eve',
      },
    ],
  },
  {
    category: 'Infrastructure',
    items: [
      {
        type: 'channel',
        label: 'Quantum Channel',
        description: 'Fiber optic transmission link',
        icon: '🔗',
        iconClass: 'channel',
      },
      {
        type: 'detector',
        label: 'Detector',
        description: 'Single photon detector (SPD)',
        icon: '📡',
        iconClass: 'detector',
      },
    ],
  },
];

export default function ComponentsPanel() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="panel">
      <div className="panel-title">
        <span className="title-icon">🧩</span>
        Components
      </div>

      {components.map((group) => (
        <div key={group.category}>
          <div className="category-label">{group.category}</div>
          {group.items.map((comp) => (
            <div
              key={comp.type}
              className="component-card"
              draggable
              onDragStart={(e) => onDragStart(e, comp.type)}
            >
              <div className={`card-icon ${comp.iconClass}`}>{comp.icon}</div>
              <div className="card-info">
                <h4>{comp.label}</h4>
                <p>{comp.description}</p>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div style={{ marginTop: 24, padding: '12px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Drag components onto the workspace to build your QKD network
        </p>
      </div>
    </div>
  );
}
