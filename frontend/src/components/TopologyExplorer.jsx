import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Search, 
  Filter, 
  ShieldAlert, 
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
      {/* Header & Controls Toolbar */}
      <div className="fintech-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-blue-700" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Heterogeneous Network Graph Topology Explorer
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Visualize multi-hop transactional topology, detect circular smurfing rings, shell account gateways, and graph clustering communities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700">
              <span className="font-semibold">Density:</span>
              <select
                value={nodeCount}
                onChange={(e) => setNodeCount(Number(e.target.value))}
                className="bg-transparent font-bold text-blue-700 focus:outline-none"
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Regenerate Graph</span>
            </button>
          </div>
        </div>

        {/* Quick Search & Summary Counter */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Account ID (e.g. ACC_1001)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-md bg-slate-50 border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-md bg-[#164E8A] hover:bg-blue-700 text-white text-xs font-semibold"
            >
              Locate
            </button>
          </form>

          <div className="flex items-center gap-3 text-xs text-slate-600 font-mono">
            <span>Detected Communities: <strong className="text-slate-900">{topology?.detected_communities || 4}</strong></span>
            <span>•</span>
            <span>High-Risk Cycles: <strong className="text-red-600">{topology?.high_risk_cycles || 2} Rings</strong></span>
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
        <div className="h-96 fintech-card flex items-center justify-center text-slate-400 text-xs font-mono">
          Loading graph topology...
        </div>
      )}

      {/* 3 Relational Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl fintech-card space-y-1.5">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-red-600" />
            Circular Smurfing Ring
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            4-node closed cycle structured just under statutory Rs. 500,000 threshold to evade single-transaction CTR filing triggers.
          </p>
        </div>

        <div className="p-4 rounded-xl fintech-card space-y-1.5">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-teal-600" />
            Inductive Graph Embeddings
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Neighborhood aggregation pools 2-hop structural context, enabling instant detection of newly initialized mule accounts.
          </p>
        </div>

        <div className="p-4 rounded-xl fintech-card space-y-1.5">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            False Positive Suppression
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Distinguishes high-volume merchant collection hubs from malicious layering fan-outs by incorporating in-degree/out-degree balance.
          </p>
        </div>
      </div>
    </div>
  );
}
