import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';

import AliceNode from './nodes/AliceNode';
import BobNode from './nodes/BobNode';
import EveNode from './nodes/EveNode';
import ChannelNode from './nodes/ChannelNode';

const nodeTypes = {
  alice: AliceNode,
  bob: BobNode,
  eve: EveNode,
  channel: ChannelNode,
};

const defaultNodes = [
  {
    id: 'alice-1',
    type: 'alice',
    position: { x: 50, y: 180 },
    data: { keyLength: 256, photonSource: 'Single' },
  },
  {
    id: 'channel-1',
    type: 'channel',
    position: { x: 380, y: 180 },
    data: { distance: 50, loss: '0.2', noise: 'Low' },
  },
  {
    id: 'bob-1',
    type: 'bob',
    position: { x: 720, y: 180 },
    data: { detectorType: 'APD', efficiency: '85', darkCount: '1e-6' },
  },
];

const defaultEdges = [
  {
    id: 'e-alice-channel',
    source: 'alice-1',
    target: 'channel-1',
    animated: true,
    style: { stroke: '#38bdf8', strokeWidth: 2 },
  },
  {
    id: 'e-channel-bob',
    source: 'channel-1',
    target: 'bob-1',
    animated: true,
    style: { stroke: '#a78bfa', strokeWidth: 2 },
  },
];

let nodeId = 10;

export default function Workspace() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 } }, eds)
      ),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 90,
        y: event.clientY - bounds.top - 30,
      };

      const newNode = {
        id: `${type}-${nodeId++}`,
        type,
        position,
        data: {},
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  return (
    <div className="workspace-container" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        style={{ background: '#0a0e1a' }}
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls
          style={{
            background: 'rgba(17, 24, 39, 0.9)',
            border: '1px solid rgba(56, 189, 248, 0.12)',
            borderRadius: '8px',
          }}
        />
        <MiniMap
          nodeStrokeColor="#38bdf8"
          nodeColor="#1e293b"
          maskColor="rgba(10, 14, 26, 0.85)"
          style={{
            background: 'rgba(17, 24, 39, 0.9)',
            border: '1px solid rgba(56, 189, 248, 0.12)',
            borderRadius: '8px',
          }}
        />
      </ReactFlow>
    </div>
  );
}
