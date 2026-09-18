import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Search, 
  Filter, 
  ShieldAlert, 
  Share2, 
  Download, 
  RefreshCw,
  Info,
  CheckCircle2,
  Cpu
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
      {/* Header Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-sky-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Heterogeneous Network Graph Topology Explorer
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Visualize multi-hop transactional topology, detect circular smurfing rings, shell account gateways, and graph clustering communities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
              <span>Nodes:</span>
              <select
                value={nodeCount}
                onChange={(e) => setNodeCount(Number(e.target.value))}
                className="bg-transparent font-bold text-sky-400 focus:outline-none"
              >
                <option value="30">30 Nodes</option>
                <option value="50">50 Nodes</option>
                <option value="75">75 Nodes</option>
                <option value="100">100 Nodes</option>
              </select>
            </div>

            <button
              onClick={loadTopology}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Regenerate Graph</span>
            </button>
          </div>
        </div>

        {/* Quick Search & Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search Account ID (e.g. ACC_1001)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium"
            >
              Locate
            </button>
          </form>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>Detected Communities: <strong className="text-white">{topology?.detected_communities || 4}</strong></span>
            <span>•</span>
            <span>High-Risk Cycles: <strong className="text-rose-400">{topology?.high_risk_cycles || 2} Rings</strong></span>
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
        <div className="h-96 glass-panel rounded-2xl border border-slate-800 flex items-center justify-center text-slate-500 text-xs font-mono">
          Loading graph topology...
        </div>
      )}

      {/* Relational Insights Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            Circular Smurfing Ring
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            4-node closed cycle structured just under statutory Rs. 500,000 threshold to evade single-transaction CTR filing triggers.
          </p>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-teal-400" />
            Inductive Graph Embeddings
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Neighborhood aggregation pools 2-hop structural context, enabling instant detection of newly initialized mule accounts.
          </p>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            False Positive Suppression
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Distinguishes high-volume merchant collection hubs from malicious layering fan-outs by incorporating in-degree/out-degree balance.
          </p>
        </div>
      </div>
    </div>
  );
}
