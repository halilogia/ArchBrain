
import React, { useState, useEffect, useRef, useMemo } from 'react';
// @ts-ignore
import ForceGraph3D from '3d-force-graph';
// @ts-ignore
import { forceRadial } from 'd3-force';
import * as d3 from 'd3';
import { AnimatePresence } from 'framer-motion';
import { NeuralNode, colorMap } from '../types';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/panels/Sidebar';
import { CodePanel } from '../components/panels/CodePanel';
import { DocsPanel, SettingsPanel } from '../components/panels/OverlayPanels';

// COPY OF THE HUGE APP COMPONENT, ADAPTED TO BE A PAGE
const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:5050' : '';

const NebulaMap = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<NeuralNode | null>(null);
  const [hoverNode, setHoverNode] = useState<NeuralNode | null>(null);
  const [isSidebarMinimized, setSidebarMinimized] = useState(localStorage.getItem('arch_sidebarMinimized') === 'true');
  const [activePanel, setActivePanel] = useState<'none' | 'docs' | 'settings'>('none');
  const [logs, setLogs] = useState<string[]>(['> Neural Systems Initiated...']);
  const [serverStatus, setServerStatus] = useState({ uptime: 0, watcher: '...', mcp: '...' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NeuralNode[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [activeColorMap, setActiveColorMap] = useState<Record<string, string>>({ ...colorMap });
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  // Persistence
  const [nodeSize, setNodeSize] = useState(Number(localStorage.getItem('arch_nodeSize')) || 8);
  const [linkDist, setLinkDist] = useState(Number(localStorage.getItem('arch_linkDist')) || 200);
  const [linkThickness, setLinkThickness] = useState(Number(localStorage.getItem('arch_linkThickness')) || 2);
  const [inboundColor, setInboundColor] = useState(localStorage.getItem('arch_inboundColor') || '#d946ef');
  const [outboundColor, setOutboundColor] = useState(localStorage.getItem('arch_outboundColor') || '#22d3ee');

  const highlightedLinks = useMemo(() => {
    if (!graphData.links || (!hoverNode && !selectedNode)) return new Set();
    const activeId = selectedNode?.id || hoverNode?.id;
    return new Set(graphData.links.filter((l: any) => {
        const sourceId = l.source?.id || l.source;
        const targetId = l.target?.id || l.target;
        return sourceId === activeId || targetId === activeId;
    }));
  }, [hoverNode, selectedNode, graphData]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-50), `> [${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const fetchScan = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/scan`);
      if (!res.ok) throw new Error(res.statusText);
      const rawData = await res.json();
      const data = { nodes: rawData.nodes || [], links: rawData.edges || rawData.links || [] };
      
      // APPLY SAVED LAYOUT
      try {
          const savedLayout = JSON.parse(localStorage.getItem('arch_layout') || '{}');
          data.nodes.forEach((n: any) => {
              if (savedLayout[n.id]) {
                  n.fx = savedLayout[n.id].fx;
                  n.fy = savedLayout[n.id].fy;
                  n.fz = savedLayout[n.id].fz;
              }
          });
      } catch(e) {}

      setGraphData(data);
      if (graphRef.current) {
        const safeNodes = data.nodes.map((n: any) => ({ ...n }));
        const safeLinks = data.links.map((l: any) => ({ ...l }));
        graphRef.current.graphData({ nodes: safeNodes, links: safeLinks });
      }
      if (data.nodes.length > 0) addLog(`Sync Successful: ${data.nodes.length} nodes synthesized.`);
    } catch (e) {
      addLog("Core Offline. Check server connection.");
    }
  };

  const handleRestart = async () => {
    try { await fetch(`${API_BASE}/api/restart`, { method: 'POST' }); } catch (e) {}
  };

  const handleToggleWatcher = async () => {
      try { const res = await fetch(`${API_BASE}/api/toggle-watcher`, { method: 'POST' }); const data = await res.json(); addLog(`Watcher Shift: ${data.status}`); } catch(e) {}
  };

  const handleManualScan = () => { fetchScan(); addLog("Tactical Sync Initiated."); };

  const zoomToNode = (targetNode: NeuralNode) => {
    if (!graphRef.current) return;
    const graphNodes = graphRef.current.graphData().nodes;
    const activeNode = graphNodes.find((n: any) => n.id === targetNode.id);
    if (!activeNode || !activeNode.x) { addLog(`Target ${targetNode.label} not visible.`); return; }
    const distance = 120;
    const distRatio = 1 + distance/Math.hypot(activeNode.x, activeNode.y || 0, activeNode.z || 0);
    graphRef.current.cameraPosition(
        { x: activeNode.x * distRatio, y: (activeNode.y || 0) * distRatio, z: (activeNode.z || 0) * distRatio },
        activeNode,
        2000
    );
    setSearchQuery('');
    setSearchResults([]);
    setSelectedNode(activeNode);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q) { setSearchResults([]); return; }
    const matches = graphData.nodes.filter((n: any) => n.label.toLowerCase().includes(q.toLowerCase())).slice(0, 5);
    setSearchResults(matches);
  };

  useEffect(() => {
    let isMounted = true;
    let graphInstance: any = null;
    const initGraph = async () => {
        if (!containerRef.current) return;
        await new Promise(r => setTimeout(r, 100));
        if (!isMounted) return;

        // @ts-ignore
        graphInstance = ForceGraph3D()(containerRef.current)
          .backgroundColor('#020617')
          .nodeColor((node: any) => node.isOrphan ? '#475569' : (activeColorMap[node.category] || '#ffffff'))
          .nodeVal((node: any) => 6 + (node.criticality || 0) * 1)
          .nodeRelSize(nodeSize)
          .nodeLabel((node: any) => `
            <div class="node-hover-card">
                <div class="glow-bar" style="background: ${node.isOrphan ? '#475569' : (activeColorMap[node.category] || '#ffffff')}"></div>
                <strong>${node.label} ${node.isOrphan ? '💀' : ''}</strong>
                <span>${node.category}</span>
                <div class="stats" style="display: flex; gap: 8px; justify-content: center; margin-top: 4px;">
                    <span style="color:#4ade80">In: ${node.inDegree}</span>
                    <span style="color:#f472b6">Out: ${node.outDegree}</span>
                </div>
                ${node.isOrphan ? '<div style="color:#ef4444; font-size:9px; margin-top:5px; font-weight:900">⚠️ ORPHAN</div>' : ''}
            </div>
          `)
          .onNodeClick((node: any) => setSelectedNode(node))
          .onNodeHover((node: any) => setHoverNode(node))
          .linkColor((link: any) => {
              if (link.violation) return '#ef4444'; 
              const activeId = selectedNode?.id || hoverNode?.id;
              if (activeId) {
                  const sourceId = link.source?.id || link.source;
                  const targetId = link.target?.id || link.target;
                  if (sourceId === activeId) return outboundColor; 
                  if (targetId === activeId) return inboundColor; 
                  return 'rgba(71, 85, 105, 0.05)';
              }
              return '#334155';
          })
          .linkOpacity((link: any) => {
             const activeId = selectedNode?.id || hoverNode?.id;
             if (!activeId) return 0.2;
             return highlightedLinks.has(link) ? 1 : 0.05;
          })
          .linkWidth((link: any) => {
              const activeId = selectedNode?.id || hoverNode?.id;
              if (activeId && (link.source?.id || link.source) === activeId) return linkThickness * 2;
              return linkThickness;
          })
          .linkCurvature(0.2)
          .linkDirectionalArrowLength((link: any) => highlightedLinks.has(link) ? 6 : 0)
          .linkDirectionalArrowRelPos(1)
          .linkDirectionalParticles((link: any) => {
              if (highlightedLinks.has(link)) return 15;
              return link.violation ? 4 : 0;
          })
          .linkDirectionalParticleSpeed((link: any) => {
              const activeId = selectedNode?.id || hoverNode?.id;
              const sourceId = link.source?.id || link.source;
              // OUTBOUND: Fast, energetic flow
              if (activeId && sourceId === activeId) return 0.06; 
              // INBOUND: Steady, heavy flow
              return 0.01;
          })
          .linkDirectionalParticleWidth((link: any) => highlightedLinks.has(link) ? 4 : 2)
          .width(window.innerWidth)
          .height(window.innerHeight);

        const handleResize = () => { if (graphInstance) { graphInstance.width(window.innerWidth); graphInstance.height(window.innerHeight); } };
        window.addEventListener('resize', handleResize);

        graphInstance.d3Force('charge').strength(-300); 
        graphInstance.d3Force('link').distance(200).strength(0.8);
        
        // COLLISION DETECTION (Prevent Overlap)
        graphInstance.d3Force('collide', d3.forceCollide(nodeSize * 3));
        
        graphInstance.d3Force('radial', null);
        graphInstance.d3AlphaDecay(0.04);
        graphInstance.d3VelocityDecay(0.4);
        graphInstance.cooldownTicks(100);

        graphInstance.onNodeDrag((node: any) => { node.fx = node.x; node.fy = node.y; node.fz = node.z; })
                     .onNodeDragEnd((node: any) => { node.fx = node.x; node.fy = node.y; node.fz = node.z; });
        graphInstance.onNodeHover((node: any) => setHoverNode(node));
          
        if (isMounted) {
            graphRef.current = graphInstance;
            fetchScan(); 
        }
    };

    initGraph();

    // LIVE UPDATES (WebSocket & Polling)
    const wsUrl = `ws://${API_BASE.replace('http://', '') || window.location.host}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'LOG') {
                setLogs(prev => [...prev.slice(-50), `> [${new Date().toLocaleTimeString()}] ${data.message}`]);
            }
            if (data.type === 'COMMAND') {
                if (data.action === 'SCAN') fetchScan();
            }
        } catch (e) {}
    };

    const statusInterval = setInterval(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/status`);
            if (res.ok) {
                const data = await res.json();
                setServerStatus(data);
            }
        } catch (e) {}
    }, 2000);

    return () => {
        isMounted = false;
        ws.close();
        clearInterval(statusInterval);
        if (graphRef.current) { try { graphRef.current.pauseAnimation(); graphRef.current._destructor(); graphRef.current = null; } catch(e) {} }
    }
  }, []);

  // Settings sync useEffect
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.nodeRelSize(nodeSize);
      graphRef.current.d3Force('link').distance(linkDist);
      graphRef.current.linkWidth((link: any) => {
          const activeId = selectedNode?.id || hoverNode?.id;
          if (activeId && (link.source?.id || link.source) === activeId) return linkThickness * 2;
          return linkThickness;
      });
      graphRef.current.nodeColor((node: any) => node.isOrphan ? '#475569' : (activeColorMap[node.category] || '#ffffff'));
      
      // FORCE LINK COLOR RE-EVALUATION for hover feedback
      graphRef.current.linkColor((link: any) => {
          if (link.violation) return '#ef4444'; 
          
          const activeId = selectedNode?.id || hoverNode?.id;
          if (activeId) {
              const sourceId = link.source?.id || link.source;
              const targetId = link.target?.id || link.target;
              
              if (sourceId === activeId) return outboundColor; // CYAN for outbound
              if (targetId === activeId) return inboundColor;  // MAGENTA for inbound
              
              return 'rgba(71, 85, 105, 0.05)'; // Ghost others
          }
          
          return '#334155'; // Default gray
      });
      
      // Save positions to localStorage
      const saveLayout = () => {
          if (!graphRef.current) return;
          const currentNodes = graphRef.current.graphData().nodes;
          const layout = currentNodes.reduce((acc: any, node: any) => {
              if (node.fx !== undefined || node.fy !== undefined || node.fz !== undefined) {
                  acc[node.id] = { fx: node.fx, fy: node.fy, fz: node.fz };
              }
              return acc;
          }, {});
          localStorage.setItem('arch_layout', JSON.stringify(layout));
      };

      // Auto-save on drag end
      graphRef.current.onNodeDragEnd((node: any) => { 
          node.fx = node.x; 
          node.fy = node.y; 
          node.fz = node.z;
          saveLayout();
      });
      
      localStorage.setItem('arch_nodeSize', nodeSize.toString());
      localStorage.setItem('arch_linkDist', linkDist.toString());
      localStorage.setItem('arch_linkThickness', linkThickness.toString());
      localStorage.setItem('arch_inboundColor', inboundColor);
      localStorage.setItem('arch_outboundColor', outboundColor);
      localStorage.setItem('arch_sidebarMinimized', isSidebarMinimized.toString());
    }
  }, [nodeSize, linkDist, activeColorMap, linkThickness, inboundColor, outboundColor, selectedNode, hoverNode, highlightedLinks, isSidebarMinimized]);

  // Separate effect ONLY for link distance changes (to avoid jitter on hover)
  useEffect(() => {
    if (graphRef.current && linkDist !== 200) {
      try {
        graphRef.current.d3ReheatSimulation();
      } catch(e) {}
    }
  }, [linkDist]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', background: '#020617' }}>
      <Header 
         onOpenDocs={() => {}} // Disabled in Nebula
         onOpenSettings={() => setActivePanel('settings')}
         onScan={fetchScan}
         searchQuery={searchQuery}
         onSearch={handleSearch}
         searchResults={searchResults}
         onResultClick={zoomToNode}
      />

      <div ref={containerRef} id="3d-graph" style={{ width: '100%', height: '100%' }} />

      <Sidebar 
         isMinimized={isSidebarMinimized}
         onToggle={() => setSidebarMinimized(!isSidebarMinimized)}
         logs={logs}
         serverStatus={serverStatus}
         onToggleWatcher={handleToggleWatcher}
         onToggleMCP={() => {}}
         onManualScan={handleManualScan}
         onResetView={() => graphRef.current?.zoomToFit(1000)}
         onRestartServer={handleRestart}
      />

      <AnimatePresence>
        {selectedNode && <CodePanel selectedNode={selectedNode} onClose={() => setSelectedNode(null)} />}
        {activePanel === 'docs' && <DocsPanel onClose={() => setActivePanel('none')} />}
        {activePanel === 'settings' && (
          <SettingsPanel 
           onClose={() => setActivePanel('none')}
           nodeSize={nodeSize} setNodeSize={setNodeSize}
           linkDist={linkDist} setLinkDist={setLinkDist}
           linkThickness={linkThickness} setLinkThickness={setLinkThickness}
           colorMap={activeColorMap} setColorMap={setActiveColorMap}
           inboundColor={inboundColor} setInboundColor={setInboundColor}
           outboundColor={outboundColor} setOutboundColor={setOutboundColor}
        />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NebulaMap;
