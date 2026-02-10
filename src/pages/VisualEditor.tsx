
import React, { useCallback, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Download } from 'lucide-react';

// Custom Node Component
const ServiceNode = ({ data }: any) => {
  return (
    <div style={{
      padding: '20px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: '2px solid #8b5cf6',
      minWidth: '200px',
      boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)',
      color: 'white'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>
        {data.label}
      </div>
      <div style={{ fontSize: '12px', opacity: 0.8 }}>
        {data.category || 'Service'}
      </div>
      {data.inDegree !== undefined && (
        <div style={{ fontSize: '10px', marginTop: '8px', opacity: 0.7 }}>
          In: {data.inDegree} | Out: {data.outDegree}
        </div>
      )}
    </div>
  );
};

const DomainNode = ({ data }: any) => {
  return (
    <div style={{
      padding: '20px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      border: '2px solid #ec4899',
      minWidth: '200px',
      boxShadow: '0 10px 30px rgba(236, 72, 153, 0.3)',
      color: 'white'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>
        {data.label}
      </div>
      <div style={{ fontSize: '12px', opacity: 0.8 }}>
        Domain Model
      </div>
    </div>
  );
};

const nodeTypes = {
  service: ServiceNode,
  domain: DomainNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'service',
    position: { x: 250, y: 100 },
    data: { label: 'User Service', type: 'REST API' },
  },
];

const initialEdges: Edge[] = [];

const VisualEditor = () => {
  const [searchParams] = useSearchParams();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(2);

  // Load graph data from Nebula if node param exists
  useEffect(() => {
    const nodeParam = searchParams.get('node');
    if (nodeParam) {
      fetch('/api/scan')
        .then(res => res.json())
        .then(data => {
          // Convert graph nodes to React Flow nodes
          const flowNodes: Node[] = data.nodes.map((n: any, index: number) => ({
            id: n.id,
            type: n.category === 'Domain' ? 'domain' : 'service',
            position: { 
              x: (index % 5) * 300, 
              y: Math.floor(index / 5) * 200 
            },
            data: { 
              label: n.label,
              category: n.category,
              inDegree: n.inDegree,
              outDegree: n.outDegree
            },
          }));

          // Convert links to edges
          const flowEdges: Edge[] = (data.edges || data.links || []).map((link: any, index: number) => ({
            id: `e${index}`,
            source: link.source?.id || link.source,
            target: link.target?.id || link.target,
            animated: link.violation,
            style: { stroke: link.violation ? '#ef4444' : '#8b5cf6' }
          }));

          setNodes(flowNodes);
          setEdges(flowEdges);
          setNodeId(flowNodes.length + 1);
        })
        .catch(err => console.error('Failed to load graph:', err));
    }
  }, [searchParams, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addServiceNode = () => {
    const newNode: Node = {
      id: `${nodeId}`,
      type: 'service',
      position: { x: Math.random() * 500, y: Math.random() * 300 },
      data: { label: `Service ${nodeId}`, type: 'REST API' },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeId(nodeId + 1);
  };

  const addDomainNode = () => {
    const newNode: Node = {
      id: `${nodeId}`,
      type: 'domain',
      position: { x: Math.random() * 500, y: Math.random() * 300 },
      data: { label: `Domain ${nodeId}` },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeId(nodeId + 1);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0f172a' }}>
      {/* Top Toolbar */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        display: 'flex',
        gap: '12px',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: '12px 20px',
        borderRadius: '16px',
        border: '1px solid #334155',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
      }}>
        <button
          onClick={addServiceNode}
          style={{
            padding: '10px 20px',
            background: '#8b5cf6',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={18} /> New Service
        </button>
        <button
          onClick={addDomainNode}
          style={{
            padding: '10px 20px',
            background: '#ec4899',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={18} /> New Domain
        </button>
      </div>

      {/* Hero Text */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: nodes.length > 1 ? 0.1 : 0.3,
        transition: 'opacity 0.5s'
      }}>
        <h1 style={{
          fontSize: '72px',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '20px'
        }}>
          Design Your Architecture
        </h1>
        <p style={{ fontSize: '24px', color: '#94a3b8' }}>
          Drag, connect, and generate code instantly
        </p>
      </div>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        zoomOnScroll={true}
        panOnDrag={true}
        fitView
        style={{ background: '#0f172a' }}
      >
        <Controls style={{ background: '#1e293b', border: '1px solid #334155' }} />
        <MiniMap 
          style={{ background: '#1e293b', border: '1px solid #334155' }}
          nodeColor={(node) => {
            if (node.type === 'service') return '#8b5cf6';
            if (node.type === 'domain') return '#ec4899';
            return '#64748b';
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
      </ReactFlow>
    </div>
  );
};

export default VisualEditor;
