import { createContext, useContext, useCallback, useState, useEffect, useMemo } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';

// Spacing between channel lines
const CHANNEL_SPACING = 100;
const CHANNEL_START_Y = 80;

function makeChannels(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    label: `QUANTUM CHANNEL ${i + 1}`,
    y: CHANNEL_START_Y + i * CHANNEL_SPACING,
  }));
}

/**
 * Auto-generate edges for each channel line.
 * For each channel Y: find Alice and Bob, sort all nodes between them by X,
 * and chain them: Alice → node1 → node2 → ... → Bob
 */
function buildAutoEdges(nodes, channels) {
  const edges = [];

  for (const ch of channels) {
    // Get all user nodes on this channel (exclude rail nodes)
    const onChannel = nodes.filter((n) => n.type !== 'rail' && n.position.y === ch.y);
    if (onChannel.length < 2) continue;

    const alice = onChannel.filter((n) => n.type === 'alice');
    const bob = onChannel.filter((n) => n.type === 'bob');
    if (alice.length === 0 || bob.length === 0) continue;

    const aliceNode = alice.reduce((a, b) => (a.position.x < b.position.x ? a : b));
    const bobNode = bob.reduce((a, b) => (a.position.x > b.position.x ? a : b));

    const leftX = aliceNode.position.x;
    const rightX = bobNode.position.x;

    const between = onChannel
      .filter((n) => n.position.x >= leftX && n.position.x <= rightX)
      .sort((a, b) => a.position.x - b.position.x);

    for (let i = 0; i < between.length - 1; i++) {
      edges.push({
        id: `auto-${between[i].id}-${between[i + 1].id}`,
        source: between[i].id,
        target: between[i + 1].id,
        animated: true,
        style: { stroke: '#38bdf8', strokeWidth: 2 },
      });
    }
  }

  return edges;
}

const WorkspaceContext = createContext(null);

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}

let nodeId = 10;
export function getNextNodeId() {
  return nodeId++;
}

export function WorkspaceProvider({ children }) {
  const [userNodes, setUserNodes] = useState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [channels, setChannels] = useState(() => makeChannels(4));

  // Generate rail nodes from channels — these are non-interactive React Flow nodes
  const railNodes = useMemo(() =>
    channels.map((ch) => ({
      id: `rail-${ch.id}`,
      type: 'rail',
      position: { x: 0, y: ch.y },
      data: { label: ch.label },
      selectable: false,
      draggable: false,
      connectable: false,
      deletable: false,
    })),
    [channels]
  );

  // Combine rail nodes (background) + user nodes (foreground)
  const allNodes = useMemo(() => [...railNodes, ...userNodes], [railNodes, userNodes]);

  // Auto-generate edges whenever user nodes change
  useEffect(() => {
    const autoEdges = buildAutoEdges(userNodes, channels);
    setEdges(autoEdges);
  }, [userNodes, channels, setEdges]);

  const setNodes = useCallback((updater) => {
    if (typeof updater === 'function') {
      setUserNodes((prev) => updater(prev));
    } else {
      setUserNodes(updater);
    }
  }, []);

  const addChannel = useCallback(() => {
    setChannels((prev) => {
      const next = prev.length;
      return [...prev, {
        id: next,
        label: `QUANTUM CHANNEL ${next + 1}`,
        y: CHANNEL_START_Y + next * CHANNEL_SPACING,
      }];
    });
  }, []);

  const removeLastChannel = useCallback(() => {
    setChannels((prev) => {
      if (prev.length <= 1) return prev;
      const removed = prev[prev.length - 1];
      setUserNodes((nds) => nds.filter((n) => n.position.y !== removed.y));
      return prev.slice(0, -1);
    });
  }, []);

  const deleteNode = useCallback(
    (nid) => {
      setUserNodes((nds) => nds.filter((n) => n.id !== nid));
      setSelectedNodeId((prev) => (prev === nid ? null : prev));
    },
    []
  );

  // Custom onNodesChange — only apply changes to user nodes, ignore rail nodes
  const onNodesChange = useCallback(
    (changes) => {
      setUserNodes((prev) => {
        let next = [...prev];
        for (const change of changes) {
          // Skip changes targeting rail nodes
          if (change.id && change.id.startsWith('rail-')) continue;

          if (change.type === 'remove') {
            next = next.filter((n) => n.id !== change.id);
          } else if (change.type === 'position' && change.position) {
            next = next.map((n) => {
              if (n.id !== change.id) return n;
              return { ...n, position: { ...change.position } };
            });
          } else if (change.type === 'select') {
            // Handled by React Flow internally
          }
        }
        return next;
      });
    },
    []
  );

  return (
    <WorkspaceContext.Provider
      value={{
        nodes: allNodes, setNodes, onNodesChange,
        userNodes,
        edges, setEdges, onEdgesChange,
        onConnect: () => {},
        selectedNodeId, setSelectedNodeId,
        deleteNode,
        channels, addChannel, removeLastChannel,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
