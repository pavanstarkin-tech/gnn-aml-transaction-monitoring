import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Search, 
  Filter, 
  ShieldAlert, 
  RefreshCw,
  Cpu,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { NetworkGraphCanvas } from './NetworkGraphCanvas';

export function TopologyExplorer() {
  const [topology, setTopology] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nodeCount, setNodeCount] = useState(50);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTopology();
  }, [nodeCount]);

  const loadTopology = async () => {
    setLoading(true);
    try {
      const data = await api.getTopology(nodeCount);
      setTopology(data);
    } catch (err) {
      console.error("Topology fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!topology || !topology.nodes) return;
    const match = topology.nodes.find(n => 
      n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (match) {
      setSelectedNode(match);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar Card */}
      <div className="brutal-card-lg bg-[#FFFDF5] p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Network className="h-6 w-6 text-[#4D7CFE]" />
              <h2 className="text-2xl font-black text-[#111111] tracking-tight uppercase">
                NETWORK CRIME TOPOLOGY EXPLORER
              </h2>
            </div>
            <p className="text-xs text-[#5B5B55] font-bold uppercase tracking-wider mt-1">
              MULTI-HOP RELATIONAL AI INVESTIGATION CANVAS & CYCLE RING DETECTION
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#EAE5D8] px-3 py-1.5 rounded-[4px] border-2 border-[#111111] text-xs font-mono font-bold">
              <span>NODES:</span>
              <select
                value={nodeCount}
                onChange={(e) => setNodeCount(Number(e.target.value))}
                className="bg-transparent font-black text-[#111111] focus:outline-none"
              >
                <option value="30">30 NODES</option>
                <option value="50">50 NODES</option>
                <option value="75">75 NODES</option>
                <option value="100">100 NODES</option>
              </select>
            </div>

            <button
              onClick={loadTopology}
              disabled={loading}
              className="brutal-btn-alt px-3.5 py-1.5 text-xs flex items-center gap-1.5 bg-[#FFFDF5]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>REGENERATE GRAPH</span>
            </button>
          </div>
        </div>

        {/* Search & Statistics Bar */}
        <div className="mt-5 pt-4 border-t-2 border-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#5B5B55]" />
              <input
                type="text"
                placeholder="SEARCH ACCOUNT (E.G. ACC_1001)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 brutal-input text-xs font-bold"
              />
            </div>
            <button
              type="submit"
              className="brutal-btn px-4 py-1.5 text-xs bg-[#FFD400]"
            >
              LOCATE
            </button>
          </form>

          <div className="flex items-center gap-2 font-mono text-xs font-bold">
            <span className="brutal-badge bg-[#FFFDF5] text-[#111111]">
              COMMUNITIES: {topology?.detected_communities || 4}
            </span>
            <span className="brutal-badge bg-[#FF3B30] text-white">
              CYCLES: {topology?.high_risk_cycles || 2} RINGS
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      {topology ? (
        <NetworkGraphCanvas
          data={topology}
          selectedNodeId={selectedNode?.id}
          onSelectNode={(node) => setSelectedNode(node)}
        />
      ) : (
        <div className="h-96 brutal-card flex items-center justify-center font-mono font-bold text-xs uppercase text-[#5B5B55]">
          LOADING TOPOLOGY GRAPH...
        </div>
      )}

      {/* 3 Physical Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="brutal-card bg-[#FFFDF5] p-4 space-y-1 border-t-[5px] border-t-[#FF3B30]">
          <h4 className="text-xs font-black text-[#111111] uppercase flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-[#FF3B30]" />
            CIRCULAR SMURFING RING
          </h4>
          <p className="text-[11px] font-medium text-[#5B5B55] leading-relaxed">
            4-node closed cycle structured just under statutory Rs. 500,000 threshold to evade single-transaction CTR filing triggers.
          </p>
        </div>

        <div className="brutal-card bg-[#FFFDF5] p-4 space-y-1 border-t-[5px] border-t-[#00C2D7]">
          <h4 className="text-xs font-black text-[#111111] uppercase flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-[#00C2D7]" />
            INDUCTIVE GRAPH EMBEDDINGS
          </h4>
          <p className="text-[11px] font-medium text-[#5B5B55] leading-relaxed">
            Neighborhood aggregation pools 2-hop structural context, enabling instant detection of newly initialized mule accounts.
          </p>
        </div>

        <div className="brutal-card bg-[#FFFDF5] p-4 space-y-1 border-t-[5px] border-t-[#36C96F]">
          <h4 className="text-xs font-black text-[#111111] uppercase flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#36C96F]" />
            FALSE POSITIVE SUPPRESSION
          </h4>
          <p className="text-[11px] font-medium text-[#5B5B55] leading-relaxed">
            Distinguishes high-volume merchant collection hubs from malicious layering fan-outs by incorporating in-degree/out-degree balance.
          </p>
        </div>
      </div>
    </div>
  );
}
