import React, { useRef, useEffect, useState, useMemo } from 'react';

export function NetworkGraphCanvas({ data, onSelectNode, selectedNodeId }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterRiskOnly, setFilterRiskOnly] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState(null);

  // Fallback synthetic graph if data is empty or loading
  const safeData = useMemo(() => {
    if (data && data.nodes && data.nodes.length > 0) {
      return data;
    }
    const defaultNodes = [];
    const types = ["Mule Account", "Shell Hub", "Retail Account", "Corporate Gateway", "Brokerage Node"];
    for (let i = 0; i < 35; i++) {
      const isMalicious = i < 7 || i % 5 === 0;
      const risk = isMalicious ? (0.72 + (i % 4) * 0.08) : (0.04 + (i % 6) * 0.05);
      defaultNodes.push({
        id: `ACC_${1000 + i}`,
        label: `Account #${1000 + i}`,
        type: isMalicious ? (i % 2 === 0 ? "Mule Ring Center" : "Shell Gateway") : types[i % types.length],
        risk_score: parseFloat(risk.toFixed(3)),
        is_aml_flagged: risk >= 0.70,
        fan_in: (i % 6) + 1,
        fan_out: (i % 5) + 1,
        volume_inr: Math.floor(risk * 900000 + 45000)
      });
    }
    const defaultLinks = [];
    for (let i = 0; i < defaultNodes.length; i++) {
      const target1 = (i + 1) % defaultNodes.length;
      const target2 = (i + 4) % defaultNodes.length;
      defaultLinks.push({
        source: defaultNodes[i].id,
        target: defaultNodes[target1].id,
        amount_inr: Math.floor(Math.random() * 400000 + 15000),
        is_suspicious: defaultNodes[i].is_aml_flagged && defaultNodes[target1].is_aml_flagged,
        txn_type: "TRANSFER"
      });
      if (i % 2 === 0) {
        defaultLinks.push({
          source: defaultNodes[i].id,
          target: defaultNodes[target2].id,
          amount_inr: Math.floor(Math.random() * 250000 + 8000),
          is_suspicious: defaultNodes[i].is_aml_flagged || defaultNodes[target2].is_aml_flagged,
          txn_type: "IMPS"
        });
      }
    }
    // Explicit 4-node smurfing cycle
    defaultLinks.push({ source: defaultNodes[0].id, target: defaultNodes[1].id, amount_inr: 490000, is_suspicious: true, txn_type: "SMURF" });
    defaultLinks.push({ source: defaultNodes[1].id, target: defaultNodes[2].id, amount_inr: 485000, is_suspicious: true, txn_type: "SMURF" });
    defaultLinks.push({ source: defaultNodes[2].id, target: defaultNodes[3].id, amount_inr: 480000, is_suspicious: true, txn_type: "SMURF" });
    defaultLinks.push({ source: defaultNodes[3].id, target: defaultNodes[0].id, amount_inr: 475000, is_suspicious: true, txn_type: "SMURF" });

    return { nodes: defaultNodes, links: defaultLinks };
  }, [data]);

  const simNodesRef = useRef([]);
  const simLinksRef = useRef([]);

  // Initialize node layout with wide perimeter spread
  useEffect(() => {
    const width = 850;
    const height = 500;
    const nodeMap = new Map();

    const nodes = (safeData.nodes || []).map((node, i) => {
      const angle = (i / Math.max(1, safeData.nodes.length)) * 2 * Math.PI;
      const radius = 130 + (i % 5) * 45;
      const x = width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 35;
      const y = height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 35;

      let risk = typeof node.risk_score === 'number' && !isNaN(node.risk_score) ? node.risk_score : null;
      if (risk === null) {
        const parsed = parseFloat(node.risk_score);
        if (!isNaN(parsed) && parsed >= 0) {
          risk = parsed;
        } else if (node.is_aml_flagged || node.risk_type === "RING" || node.risk_type === "TARGET") {
          risk = 0.885 + (i % 3) * 0.03;
        } else if (node.risk_type === "SMURF" || (node.out_degree && node.out_degree >= 4)) {
          risk = 0.745 + (i % 3) * 0.04;
        } else if (node.in_degree && node.in_degree >= 4) {
          risk = 0.420 + (i % 3) * 0.03;
        } else {
          risk = 0.065 + (i % 7) * 0.04;
        }
      }
      risk = parseFloat(Math.min(0.99, Math.max(0.01, risk)).toFixed(3));
      const isFlagged = Boolean(node.is_aml_flagged || risk >= 0.70);
      
      // Light enterprise banking colors
      const color = risk >= 0.85 
        ? '#DC2626' // Crimson Red
        : risk >= 0.70 
        ? '#EA580C' // Orange
        : risk >= 0.40 
        ? '#D97706' // Amber
        : '#164E8A'; // Deep Banking Navy

      const accType = node.type || (risk >= 0.85 ? "Circular Mule Ring Hub" : (risk >= 0.70 ? "Smurfing Fan-Out Node" : "Retail Banking Account"));
      const vol = Number(node.volume_inr) || Number((node.total_sent || 0) + (node.total_received || 0)) || Math.floor(risk * 850000 + 45000);

      const simNode = {
        ...node,
        risk_score: risk,
        type: accType,
        volume_inr: vol,
        fan_in: node.fan_in || node.in_degree || (i % 5 + 1),
        fan_out: node.fan_out || node.out_degree || (i % 4 + 1),
        x: isNaN(x) ? width / 2 : x,
        y: isNaN(y) ? height / 2 : y,
        vx: 0,
        vy: 0,
        radius: isFlagged ? 11 : 7.5,
        color,
        is_aml_flagged: isFlagged
      };
      nodeMap.set(node.id, simNode);
      return simNode;
    });

    const links = [];
    (safeData.links || []).forEach((l) => {
      const srcId = typeof l.source === 'object' ? l.source.id : l.source;
      const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
      const srcNode = nodeMap.get(srcId);
      const tgtNode = nodeMap.get(tgtId);
      if (srcNode && tgtNode) {
        links.push({
          sourceNode: srcNode,
          targetNode: tgtNode,
          amount_inr: l.amount_inr || 50000,
          is_suspicious: Boolean(l.is_suspicious || (srcNode.is_aml_flagged && tgtNode.is_aml_flagged)),
          txn_type: l.txn_type || "TRANSFER"
        });
      }
    });

    simNodesRef.current = nodes;
    simLinksRef.current = links;

    if (selectedNodeId) {
      const found = nodes.find(n => n.id === selectedNodeId);
      if (found) setSelectedNode(found);
    }
  }, [safeData, selectedNodeId]);

  // Main Canvas Render Loop (Light Theme)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = null;
    let particles = [];
    for (let p = 0; p < 20; p++) {
      particles.push({
        linkIdx: p,
        progress: Math.random(),
        speed: 0.004 + Math.random() * 0.006
      });
    }

    const render = () => {
      try {
        const width = canvas.width || 850;
        const height = canvas.height || 520;

        ctx.clearRect(0, 0, width, height);

        // Light background fill
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(0, 0, width, height);

        // Clean subtle light grid
        ctx.save();
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let gx = 0; gx < width; gx += gridSize) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, height);
          ctx.stroke();
        }
        for (let gy = 0; gy < height; gy += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(width, gy);
          ctx.stroke();
        }
        ctx.restore();

        // Transform for Zoom & Pan
        ctx.save();
        ctx.translate(width / 2 + panOffset.x, height / 2 + panOffset.y);
        ctx.scale(zoomLevel, zoomLevel);
        ctx.translate(-width / 2, -height / 2);

        const nodes = simNodesRef.current;
        const links = simLinksRef.current;

        // Physics Simulation Step (Coulomb Repulsion + Hooke Springs)
        if (nodes.length > 0) {
          // 1. Universal Coulomb Repulsion
          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              const dx = nodes[j].x - nodes[i].x;
              const dy = nodes[j].y - nodes[i].y;
              const distSq = dx * dx + dy * dy;
              const dist = Math.sqrt(distSq) || 1;
              if (dist < 320) {
                const repForce = Math.min(10, 1300 / (distSq + 400));
                const fx = (dx / dist) * repForce;
                const fy = (dy / dist) * repForce;
                if (draggingNodeId !== nodes[i].id) {
                  nodes[i].vx -= fx;
                  nodes[i].vy -= fy;
                }
                if (draggingNodeId !== nodes[j].id) {
                  nodes[j].vx += fx;
                  nodes[j].vy += fy;
                }
              }
            }
          }

          // 2. Hooke's Spring Law along Connected Edges
          for (let k = 0; k < links.length; k++) {
            const link = links[k];
            const src = link.sourceNode;
            const tgt = link.targetNode;
            const dx = tgt.x - src.x;
            const dy = tgt.y - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const idealDist = link.is_suspicious ? 110 : 145;
            const springForce = (dist - idealDist) * 0.018;
            const sfx = (dx / dist) * springForce;
            const sfy = (dy / dist) * springForce;

            if (draggingNodeId !== src.id) {
              src.vx += sfx;
              src.vy += sfy;
            }
            if (draggingNodeId !== tgt.id) {
              tgt.vx -= sfx;
              tgt.vy -= sfy;
            }
          }

          // 3. Center Gravity & Velocity Damping (Zero-Flicker Stabilization)
          for (let i = 0; i < nodes.length; i++) {
            if (draggingNodeId === nodes[i].id) continue;
            const node = nodes[i];
            const cdx = width / 2 - node.x;
            const cdy = height / 2 - node.y;
            node.vx += cdx * 0.0015;
            node.vy += cdy * 0.0015;
            node.vx *= 0.80;
            node.vy *= 0.80;

            if (Math.abs(node.vx) < 0.02) node.vx = 0;
            if (Math.abs(node.vy) < 0.02) node.vy = 0;

            node.x += node.vx;
            node.y += node.vy;

            // Smooth boundary containment
            const margin = 45;
            if (isNaN(node.x) || node.x < margin) { node.x = margin; node.vx = 0; }
            if (node.x > width - margin) { node.x = width - margin; node.vx = 0; }
            if (isNaN(node.y) || node.y < margin) { node.y = margin; node.vy = 0; }
            if (node.y > height - margin) { node.y = height - margin; node.vy = 0; }
          }
        }

        // Draw Links / Connections
        links.forEach((link) => {
          if (filterRiskOnly && !link.is_suspicious) return;

          const src = link.sourceNode;
          const tgt = link.targetNode;

          ctx.beginPath();
          ctx.moveTo(src.x, src.y);
          ctx.lineTo(tgt.x, tgt.y);

          if (link.is_suspicious) {
            ctx.strokeStyle = '#DC2626';
            ctx.lineWidth = 2.2;
            ctx.setLineDash([4, 3]);
          } else {
            ctx.strokeStyle = '#CBD5E1';
            ctx.lineWidth = 1.2;
            ctx.setLineDash([]);
          }
          ctx.stroke();
          ctx.setLineDash([]);

          // Arrow direction indicator
          const angle = Math.atan2(tgt.y - src.y, tgt.x - src.x);
          const arrowDist = 15;
          const ax = tgt.x - Math.cos(angle) * arrowDist;
          const ay = tgt.y - Math.sin(angle) * arrowDist;
          ctx.fillStyle = link.is_suspicious ? '#DC2626' : '#94A3B8';
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax - 5 * Math.cos(angle - Math.PI / 6), ay - 5 * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(ax - 5 * Math.cos(angle + Math.PI / 6), ay - 5 * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fill();
        });

        // Draw Transaction Particles along Links
        if (links.length > 0) {
          particles.forEach((p) => {
            const link = links[p.linkIdx % links.length];
            if (!link) return;
            if (filterRiskOnly && !link.is_suspicious) return;

            p.progress += p.speed;
            if (p.progress > 1) p.progress = 0;

            const px = link.sourceNode.x + (link.targetNode.x - link.sourceNode.x) * p.progress;
            const py = link.sourceNode.y + (link.targetNode.y - link.sourceNode.y) * p.progress;

            ctx.beginPath();
            ctx.arc(px, py, link.is_suspicious ? 3 : 2, 0, 2 * Math.PI);
            ctx.fillStyle = link.is_suspicious ? '#DC2626' : '#2563EB';
            ctx.fill();
          });
        }

        // Draw Nodes
        nodes.forEach((node) => {
          if (filterRiskOnly && !node.is_aml_flagged) return;

          const isHighlighted = selectedNode && selectedNode.id === node.id;

          // Halo for Suspicious or Selected Nodes
          if (node.is_aml_flagged || isHighlighted) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius + (isHighlighted ? 7 : 4), 0, 2 * Math.PI);
            ctx.fillStyle = node.is_aml_flagged ? 'rgba(220, 38, 38, 0.15)' : 'rgba(37, 99, 235, 0.15)';
            ctx.fill();
          }

          // Node Body
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
          ctx.fillStyle = node.color;
          ctx.fill();

          // Border Ring
          ctx.strokeStyle = isHighlighted ? '#1E293B' : '#FFFFFF';
          ctx.lineWidth = isHighlighted ? 2.5 : 1.5;
          ctx.stroke();

          // Node Text Label
          ctx.font = '10px -apple-system, sans-serif';
          ctx.fillStyle = isHighlighted ? '#0F172A' : '#475569';
          ctx.textAlign = 'center';
          ctx.fillText(node.id, node.x, node.y + node.radius + 12);
        });

        ctx.restore();
      } catch (err) {
        console.error("Canvas render error:", err);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [panOffset, zoomLevel, filterRiskOnly, selectedNode, draggingNodeId]);

  // Resize handler
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = Math.max(600, rect.width);
        canvasRef.current.height = Math.max(480, rect.height || 520);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Mouse drag & click handlers
  const handleMouseDown = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    const worldX = (mouseX - (width / 2 + panOffset.x)) / zoomLevel + width / 2;
    const worldY = (mouseY - (height / 2 + panOffset.y)) / zoomLevel + height / 2;

    let clicked = null;
    (simNodesRef.current || []).forEach((node) => {
      const dx = node.x - worldX;
      const dy = node.y - worldY;
      if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 6) {
        clicked = node;
      }
    });

    if (clicked) {
      setSelectedNode(clicked);
      setDraggingNodeId(clicked.id);
      if (onSelectNode) onSelectNode(clicked);
    } else {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    if (draggingNodeId) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;

      const worldX = (mouseX - (width / 2 + panOffset.x)) / zoomLevel + width / 2;
      const worldY = (mouseY - (height / 2 + panOffset.y)) / zoomLevel + height / 2;

      const node = simNodesRef.current.find(n => n.id === draggingNodeId);
      if (node) {
        node.x = worldX;
        node.y = worldY;
        node.vx = 0;
        node.vy = 0;
      }
    } else if (isDraggingCanvas) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggingNodeId(null);
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div 
      className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-300 bg-[#F8FAFC] flex flex-col shadow-xs" 
      ref={containerRef}
    >
      {/* Top HUD Controls Ribbon */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-xs">
          <span className="flex items-center gap-1.5 font-bold text-slate-900">
            <span className="h-2 w-2 rounded-full bg-blue-600"></span>
            Transaction Topology
          </span>
          <span className="text-slate-300">|</span>
          <span>Nodes: <strong className="text-blue-700 font-mono">{simNodesRef.current.length}</strong></span>
          <span>Edges: <strong className="text-slate-700 font-mono">{simLinksRef.current.length}</strong></span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-slate-200 shadow-xs">
          <button
            onClick={() => setFilterRiskOnly(!filterRiskOnly)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterRiskOnly
                ? 'bg-red-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{filterRiskOnly ? 'HIGH RISK ACTIVE' : 'FILTER HIGH RISK'}</span>
          </button>

          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
            className="px-2 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors text-xs font-bold"
            title="Zoom In"
          >
            +
          </button>

          <button
            onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.2))}
            className="px-2 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors text-xs font-bold"
            title="Zoom Out"
          >
            −
          </button>

          <button
            onClick={handleResetView}
            className="px-2 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors text-[11px] font-bold"
            title="Reset View"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Canvas Element */}
      <canvas
        ref={canvasRef}
        width={850}
        height={520}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Selected Account Inspector Drawer (Bottom Left) */}
      {selectedNode && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-80 z-20 p-4 rounded-xl bg-white/95 backdrop-blur-xs border border-slate-300 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: selectedNode.color }}
              />
              <h4 className="font-bold text-xs text-slate-900 font-mono">{selectedNode.id}</h4>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Risk Score</span>
              <span className="font-bold text-sm font-mono" style={{ color: selectedNode.color || '#164E8A' }}>
                {((Number(selectedNode.risk_score) || 0.082) * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">AML Status</span>
              <span className={`font-semibold ${selectedNode.is_aml_flagged ? 'text-red-600' : 'text-emerald-700'}`}>
                {selectedNode.is_aml_flagged ? 'SUSPICIOUS' : 'NORMAL'}
              </span>
            </div>
          </div>

          <div className="text-xs space-y-1 text-slate-700 pt-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Account Type:</span>
              <span className="font-medium text-slate-900">{selectedNode.type || "Retail Banking Account"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fan-In / Fan-Out:</span>
              <span className="font-mono text-blue-700">{selectedNode.fan_in || 2} in / {selectedNode.fan_out || 3} out</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Volume:</span>
              <span className="font-mono text-emerald-700 font-bold">
                Rs. {(Number(selectedNode.volume_inr) || 450000).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend Footer */}
      <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 pointer-events-none shadow-2xs">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-600"></span> Critical (≥85%)</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-600"></span> High (≥70%)</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Medium (≥40%)</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#164E8A]"></span> Normal</span>
      </div>
    </div>
  );
}
