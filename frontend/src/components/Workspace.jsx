import { useCallback, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ReactFlow,
  Background,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';

import AliceNode from './nodes/AliceNode';
import BobNode from './nodes/BobNode';
import EveNode from './nodes/EveNode';
import ChannelNode from './nodes/ChannelNode';
import GateNode from './nodes/GateNode';
import RailNode from './nodes/RailNode';
import { useWorkspace, getNextNodeId } from './WorkspaceContext';

const nodeTypes = {
  alice: AliceNode,
  bob: BobNode,
  eve: EveNode,
  channel: ChannelNode,
  gate: GateNode,
  rail: RailNode,
};

/* ── Find the nearest channel Y for a given flow-coordinate Y ── */
function snapToNearestChannel(channels, flowY) {
  let closest = channels[0];
  let minDist = Infinity;
  for (const ch of channels) {
    const dist = Math.abs(flowY - ch.y);
    if (dist < minDist) {
      minDist = dist;
      closest = ch;
    }
  }
  return closest.y;
}

function WorkspaceInner() {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const {
    nodes,
    setNodes,
    onNodesChange: ctxOnNodesChange,
    edges,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
    deleteNode,
    channels,
    addChannel,
    removeLastChannel,
  } = useWorkspace();

  const [menu, setMenu] = useState(null);
  const [clipboard, setClipboard] = useState(null);

  // Check if channels overflow the visible area (~460px fits 4 channels)
  const needsVerticalScroll = useMemo(() => {
    if (channels.length === 0) return false;
    const lastY = channels[channels.length - 1].y;
    return lastY > 380;
  }, [channels]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const rawData = event.dataTransfer.getData('application/reactflow-data');
      if (!rawData) return;
      
      const payload = JSON.parse(rawData);

      // Convert screen pixel to React Flow coordinate
      const flowPos = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const snappedY = snapToNearestChannel(channels, flowPos.y);
      console.log('[DROP DEBUG]', {
        clientX: event.clientX, clientY: event.clientY,
        flowX: flowPos.x, flowY: flowPos.y,
        snappedY,
        channels: channels.map(c => ({ id: c.id, y: c.y })),
      });

      const position = {
        x: flowPos.x,
        y: snappedY,
      };

      const newNode = {
        id: `${payload.type}-${getNextNodeId()}`,
        type: payload.type,
        position,
        data: payload.data,
        extent: [[-Infinity, snappedY], [Infinity, snappedY]],
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, channels, screenToFlowPosition]
  );

  // Constrain Y: nodes can only slide horizontally on their assigned channel
  const onNodesChange = useCallback(
    (changes) => {
      const constrainedChanges = changes.map((change) => {
        // Skip rail nodes entirely
        if (change.id && change.id.startsWith('rail-')) return change;

        if (change.type === 'position' && change.position) {
          if (change.dragging) {
            // Keep Y at the node's current channel
            const currentNode = nodes.find((n) => n.id === change.id);
            return {
              ...change,
              position: {
                ...change.position,
                y: currentNode ? currentNode.position.y : snapToNearestChannel(channels, change.position.y),
              },
            };
          }
          return {
            ...change,
            position: {
              ...change.position,
              y: snapToNearestChannel(channels, change.position.y),
            },
          };
        }
        return change;
      });
      ctxOnNodesChange(constrainedChanges);
    },
    [ctxOnNodesChange, channels, nodes]
  );

  const onNodeClick = useCallback(
    (_event, node) => { setSelectedNodeId(node.id); },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setMenu(null);
  }, [setSelectedNodeId]);

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    if (node.type === 'rail') return; // No context menu on rails
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    setMenu({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      nodeId: node.id,
      nodeType: node.type,
      nodeData: node.data,
      nodePosition: node.position,
    });
  }, []);

  const handleCopy = () => {
    if (!menu) return;
    setClipboard({ type: menu.nodeType, data: { ...menu.nodeData }, mode: 'copy' });
    setMenu(null);
  };

  const handleCut = () => {
    if (!menu) return;
    setClipboard({ type: menu.nodeType, data: { ...menu.nodeData }, mode: 'cut' });
    deleteNode(menu.nodeId);
    setMenu(null);
  };

  const handlePaste = () => {
    if (!clipboard || !menu) return;
    const snappedY = snapToNearestChannel(channels, menu.nodePosition.y);
    const newNode = {
      id: `${clipboard.type}-${getNextNodeId()}`,
      type: clipboard.type,
      position: { x: menu.nodePosition.x + 40, y: snappedY },
      data: { ...clipboard.data },
      extent: [[-Infinity, snappedY], [Infinity, snappedY]],
    };
    setNodes((nds) => [...nds, newNode]);
    setMenu(null);
  };

  const handleDelete = () => {
    if (!menu) return;
    deleteNode(menu.nodeId);
    setMenu(null);
  };

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
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        nodeTypes={nodeTypes}
        panOnDrag={false}
        panOnScroll={needsVerticalScroll}
        panOnScrollMode="vertical"
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={needsVerticalScroll}
        proOptions={{ hideAttribution: true }}
        style={{ background: '#0c0c0c' }}
      >
        <Background color="#222222" gap={20} size={1} />
      </ReactFlow>

      {/* Channel controls */}
      <div className="channel-controls">
        <button
          className="add-channel-btn"
          onClick={addChannel}
          title="Add Quantum Channel"
        >
          ＋ Channel
        </button>
        <button
          className="add-channel-btn remove"
          onClick={removeLastChannel}
          title="Remove Last Channel"
          disabled={channels.length <= 1}
        >
          － Channel
        </button>
      </div>

      {menu && createPortal(
        <div
          className="ctx-menu"
          style={{ left: menu.x, top: menu.y }}
        >
          <button className="ctx-item" onClick={handleCopy}>
            <span className="ctx-icon">📋</span> Copy
          </button>
          <button className="ctx-item" onClick={handleCut}>
            <span className="ctx-icon">✂️</span> Cut
          </button>
          <div className="ctx-divider" />
          <button
            className={`ctx-item ${!clipboard ? 'disabled' : ''}`}
            onClick={handlePaste}
            disabled={!clipboard}
          >
            <span className="ctx-icon">📄</span> Paste
          </button>
          <div className="ctx-divider" />
          <button className="ctx-item danger" onClick={handleDelete}>
            <span className="ctx-icon">🗑️</span> Delete
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

export default function Workspace() {
  return (
    <ReactFlowProvider>
      <WorkspaceInner />
    </ReactFlowProvider>
  );
}
