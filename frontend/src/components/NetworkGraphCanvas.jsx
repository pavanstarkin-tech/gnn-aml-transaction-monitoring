import React, { useRef, useEffect, useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RefreshCw, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  Filter,
  Info
} from 'lucide-react';

export function NetworkGraphCanvas({ data, onSelectNode, selectedNodeId }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterRiskOnly, setFilterRiskOnly] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingNodeIndex, setDraggingNodeIndex] = useState(null);

  // Physics simulation state
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const animFrameRef = useRef(null);

  // Initialize simulation nodes & links from props
  useEffect(() => {
    if (!data || !data.nodes) return;

    const width = containerRef.current ? containerRef.current.clientWidth : 800;
    const height = containerRef.current ? containerRef.current.clientHeight : 500;

    // Build node map
    const nodeMap = new Map();
    const simNodes = data.nodes.map((node, i) => {
      // Circular layout initial distribution
      const angle = (i / data.nodes.length) * 2 * Math.PI;
      const radius = 120 + (i % 3) * 60;
      const x = width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 40;
      const y = height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 40;

      const simNode = {
        ...node,
        x,
        y,
        vx: 0,
        vy: 0,
        radius: node.is_aml_flagged ? 12 : 8,
        color: node.risk_score >= 0.85 
          ? '#ef4444' 
          : node.risk_score >= 0.70 
          ? '#f97316' 
          : node.risk_score >= 0.40 
          ? '#eab308' 
          : '#10b981'
      };
      nodeMap.set(node.id, simNode);
      return simNode;
    });

    // Build link objects
    const simLinks = (data.links || []).map((link) => {
      return {
        sourceNode: nodeMap.get(link.source) || simNodes[0],
        targetNode: nodeMap.get(link.target) || simNodes[1],
        amount_inr: link.amount_inr,
        is_suspicious: link.is_suspicious,
        txn_type: link.txn_type
      };
    }).filter(l => l.sourceNode && l.targetNode);

    nodesRef.current = simNodes;
    linksRef.current = simLinks;

    if (selectedNodeId) {
      const match = simNodes.find(n => n.id === selectedNodeId);
      if (match) setSelectedNode(match);
    }
  }, [data, selectedNodeId]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    // Edge particle animation setup
    for (let p = 0; p < 25; p++) {
      particles.push({
        linkIdx: p % (linksRef.current.length || 1),
        progress: Math.random(),
        speed: 0.004 + Math.random() * 0.008
      });
    }

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Save transform for zoom & pan
      ctx.save();
      ctx.translate(width / 2 + panOffset.x, height / 2 + panOffset.y);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(-width / 2, -height / 2);

      const simNodes = nodesRef.current;
      const simLinks = linksRef.current;

      // Simple Force Directed Physics Step
      if (simNodes.length > 0) {
        // Node repulsion
        for (let i = 0; i < simNodes.length; i++) {
          for (let j = i + 1; j < simNodes.length; j++) {
            const dx = simNodes[j].x - simNodes[i].x;
            const dy = simNodes[j].y - simNodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 180) {
              const force = (180 - dist) / dist * 0.05;
              if (draggingNodeIndex !== i) {
                simNodes[i].vx -= dx * force;
                simNodes[i].vy -= dy * force;
              }
              if (draggingNodeIndex !== j) {
                simNodes[j].vx += dx * force;
                simNodes[j].vy += dy * force;
              }
            }
          }
        }

        // Spring attraction along links
        for (let link of simLinks) {
          const dx = link.targetNode.x - link.sourceNode.x;
          const dy = link.targetNode.y - link.sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = link.is_suspicious ? 90 : 130;
          const force = (dist - targetDist) * 0.003;
          link.sourceNode.vx += dx * force;
          link.sourceNode.vy += dy * force;
          link.targetNode.vx -= dx * force;
          link.targetNode.vy -= dy * force;
        }

        // Center gravity and damping
        for (let i = 0; i < simNodes.length; i++) {
          if (draggingNodeIndex === i) continue;
          const node = simNodes[i];
          const cdx = width / 2 - node.x;
          const cdy = height / 2 - node.y;
          node.vx += cdx * 0.0008;
          node.vy += cdy * 0.0008;
          node.vx *= 0.88;
          node.vy *= 0.88;
          node.x += node.vx;
          node.y += node.vy;
        }
      }

      // Draw Links / Edges
      simLinks.forEach((link, idx) => {
        if (filterRiskOnly && !link.is_suspicious) return;

        const src = link.sourceNode;
        const tgt = link.targetNode;

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);

        if (link.is_suspicious) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 2]);
        } else {
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.25)';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Direction Arrow
        const angle = Math.atan2(tgt.y - src.y, tgt.x - src.x);
        const arrowDist = 18;
        const ax = tgt.x - Math.cos(angle) * arrowDist;
        const ay = tgt.y - Math.sin(angle) * arrowDist;
        ctx.fillStyle = link.is_suspicious ? '#ef4444' : '#64748b';
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 6 * Math.cos(angle - Math.PI / 6), ay - 6 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(ax - 6 * Math.cos(angle + Math.PI / 6), ay - 6 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      });

      // Draw Animated Transaction Particles on edges
      particles.forEach((p) => {
        const link = simLinks[p.linkIdx % simLinks.length];
        if (!link) return;
        if (filterRiskOnly && !link.is_suspicious) return;

        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const px = link.sourceNode.x + (link.targetNode.x - link.sourceNode.x) * p.progress;
        const py = link.sourceNode.y + (link.targetNode.y - link.sourceNode.y) * p.progress;

        ctx.beginPath();
        ctx.arc(px, py, link.is_suspicious ? 3.5 : 2, 0, 2 * Math.PI);
        ctx.fillStyle = link.is_suspicious ? '#f87171' : '#38bdf8';
        ctx.shadowColor = link.is_suspicious ? '#ef4444' : '#38bdf8';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Nodes
      simNodes.forEach((node) => {
        if (filterRiskOnly && !node.is_aml_flagged) return;

        const isHighlighted = selectedNode && selectedNode.id === node.id;

        // Glowing outer pulse for flagged nodes or selected
        if (node.is_aml_flagged || isHighlighted) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + (isHighlighted ? 8 : 5), 0, 2 * Math.PI);
          ctx.fillStyle = node.is_aml_flagged ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.25)';
          ctx.fill();
        }

        // Inner Circle Node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = node.is_aml_flagged ? 10 : 2;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Border ring
        ctx.strokeStyle = isHighlighted ? '#ffffff' : '#0f172a';
        ctx.lineWidth = isHighlighted ? 2.5 : 1.5;
        ctx.stroke();

        // Node Label
        ctx.font = '9px monospace';
        ctx.fillStyle = isHighlighted ? '#ffffff' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(node.id, node.x, node.y + node.radius + 12);
      });

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [panOffset, zoomLevel, filterRiskOnly, selectedNode, draggingNodeIndex]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight || 520;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Canvas Mouse Interactions
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    // Transform mouse into canvas coordinates
    const worldX = (mouseX - (width / 2 + panOffset.x)) / zoomLevel + width / 2;
    const worldY = (mouseY - (height / 2 + panOffset.y)) / zoomLevel + height / 2;

    // Check if a node is clicked
    let clickedNode = null;
    let clickedIndex = null;
    nodesRef.current.forEach((node, idx) => {
      const dx = node.x - worldX;
      const dy = node.y - worldY;
      if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 4) {
        clickedNode = node;
        clickedIndex = idx;
      }
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
      setDraggingNodeIndex(clickedIndex);
      if (onSelectNode) onSelectNode(clickedNode);
    } else {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (draggingNodeIndex !== null && nodesRef.current[draggingNodeIndex]) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;

      nodesRef.current[draggingNodeIndex].x = (mouseX - (width / 2 + panOffset.x)) / zoomLevel + width / 2;
      nodesRef.current[draggingNodeIndex].y = (mouseY - (height / 2 + panOffset.y)) / zoomLevel + height / 2;
    } else if (isDraggingCanvas) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggingNodeIndex(null);
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col" ref={containerRef}>
      {/* HUD Overlay Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Stats Badge */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 shadow-lg">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            Dynamic Graph Topology
          </span>
          <span className="text-slate-500">|</span>
          <span>Nodes: <strong className="text-sky-400">{nodesRef.current.length}</strong></span>
          <span>Edges: <strong className="text-indigo-400">{linksRef.current.length}</strong></span>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-lg">
          <button
            onClick={() => setFilterRiskOnly(!filterRiskOnly)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
              filterRiskOnly
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Filter className="h-3 w-3" />
            <span>High Risk Only</span>
          </button>

          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.2))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <button
            onClick={handleResetView}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset View"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Canvas Element */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Selected Node HUD Drawer (Bottom Left) */}
      {selectedNode && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-80 z-20 p-4 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: selectedNode.color }}
              />
              <h4 className="font-bold text-xs text-white font-mono">{selectedNode.id}</h4>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Risk Score</span>
              <span className="font-bold text-sm" style={{ color: selectedNode.color }}>
                {(selectedNode.risk_score * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">AML Status</span>
              <span className={`font-semibold ${selectedNode.is_aml_flagged ? 'text-rose-400' : 'text-emerald-400'}`}>
                {selectedNode.is_aml_flagged ? 'SUSPICIOUS' : 'NORMAL'}
              </span>
            </div>
          </div>

          <div className="text-[11px] space-y-1 text-slate-300 pt-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Account Type:</span>
              <span className="font-medium text-slate-200">{selectedNode.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Fan-In / Fan-Out:</span>
              <span className="font-mono text-sky-400">{selectedNode.fan_in || 2} in / {selectedNode.fan_out || 3} out</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Volume:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                Rs. {(selectedNode.volume_inr || 450000).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend Footer (Bottom Right) */}
      <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500"></span> Critical / High</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Medium</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Normal</span>
      </div>
    </div>
  );
}
