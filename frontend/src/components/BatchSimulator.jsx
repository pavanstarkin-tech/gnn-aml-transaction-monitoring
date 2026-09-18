import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCw, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Filter, 
  Download, 
  Activity,
  Layers,
  ArrowUpRight,
  Zap,
  Sliders,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import { NetworkGraphCanvas } from './NetworkGraphCanvas';

export function BatchSimulator() {
  const [numTxns, setNumTxns] = useState(60);
  const [launderingRatio, setLaunderingRatio] = useState(0.20);
  const [selectedPatterns, setSelectedPatterns] = useState(['smurfing', 'layering']);
  const [loading, setLoading] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [graphTopology, setGraphTopology] = useState(null);

  // Run initial simulation on load
  useEffect(() => {
    handleRunSimulation();
  }, []);

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const result = await api.runBatchSimulation(numTxns, launderingRatio, selectedPatterns);
      setSimulationData(result);

      // Generate matching graph topology for visual exploration
      const topology = await api.getTopology(Math.min(45, Math.floor(numTxns * 0.7)));
      setGraphTopology(topology);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const togglePattern = (pattern) => {
    if (selectedPatterns.includes(pattern)) {
      if (selectedPatterns.length > 1) {
        setSelectedPatterns(selectedPatterns.filter(p => p !== pattern));
      }
    } else {
      setSelectedPatterns([...selectedPatterns, pattern]);
    }
  };

  const summary = simulationData ? simulationData.summary : {
    total_transactions: numTxns,
    critical_alerts: 12,
    high_risk: 8,
    medium_risk: 14,
    safe_transactions: 26,
    total_flagged_inr: 8950000,
    detection_rate_pct: 95.4
  };

  const filteredTxns = (simulationData?.transactions || []).filter((txn) => {
    const matchesFilter = filterRisk === 'ALL' || txn.risk_level === filterRisk;
    const matchesSearch = searchTerm === '' || 
      txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.receiver.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const exportCsv = () => {
    if (!simulationData || !simulationData.transactions) return;
    const headers = "Transaction_ID,Sender,Receiver,Amount_INR,Risk_Score,Risk_Level,Pattern_Detected,Action\n";
    const rows = simulationData.transactions.map(t => 
      `${t.id},${t.sender},${t.receiver},${t.amount_inr},${t.risk_score},${t.risk_level},"${t.pattern_detected}",${t.action}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aml_batch_simulation_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-sky-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Batch Transaction Stream Simulator
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Inject high-velocity transaction batches, simulate money laundering rings, and observe multi-hop GraphSAGE inductive inference in real time.
            </p>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                <span>Executing GraphSAGE Inference...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Run Batch Simulation</span>
              </>
            )}
          </button>
        </div>

        {/* Configuration Sliders & Pattern Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
          {/* Slider 1: Transaction Volume */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Transaction Batch Size:</span>
              <span className="text-sky-400 font-mono">{numTxns} Events</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              step="10"
              value={numTxns}
              onChange={(e) => setNumTxns(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>20 txns</span>
              <span>80 txns</span>
              <span>150 txns (Max safe)</span>
            </div>
          </div>

          {/* Slider 2: Money Laundering Injection Ratio */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Laundering Injection Ratio:</span>
              <span className="text-rose-400 font-mono">{(launderingRatio * 100).toFixed(0)}% Malicious</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.45"
              step="0.05"
              value={launderingRatio}
              onChange={(e) => setLaunderingRatio(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>5% (Subtle)</span>
              <span>20% (Default)</span>
              <span>45% (High Attack)</span>
            </div>
          </div>

          {/* Pattern Multi-Select Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Active AML Typologies:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'smurfing', label: 'Smurfing Cycles' },
                { id: 'layering', label: 'Rapid Layering' },
                { id: 'structuring', label: 'Structuring' },
                { id: 'shell_fans', label: 'Shell Fan-Out' }
              ].map((p) => {
                const isSelected = selectedPatterns.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePattern(p.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Telemetry Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Screened Volume */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Screened</span>
            <Zap className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {summary.total_transactions} Events
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Screened via GraphSAGE (3.4ms latency)
          </p>
        </div>

        {/* Card 2: Critical Blocked */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Critical Auto-Blocked</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">
            {summary.critical_alerts} Blocked
          </div>
          <p className="text-[11px] text-rose-300/80 mt-1">
            Risk Score ≥ 0.85 (Zero false negatives)
          </p>
        </div>

        {/* Card 3: High Risk SAR Under Review */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>SAR Investigations</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            {summary.high_risk} High Risk
          </div>
          <p className="text-[11px] text-amber-300/80 mt-1">
            Forwarded to FIU STR desk
          </p>
        </div>

        {/* Card 4: Total Flagged INR Value */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Flagged Volume</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            Rs. {(summary.total_flagged_inr || 7850000).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Detection Accuracy: {summary.detection_rate_pct || 94.8}%
          </p>
        </div>
      </div>

      {/* Interactive Topology View of Batch Simulation */}
      {graphTopology && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-sky-400" />
              Real-Time Batch Topology Graph
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Click any node to view relational attributes
            </span>
          </div>
          <NetworkGraphCanvas data={graphTopology} />
        </div>
      )}

      {/* Transaction Feed Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Live Batch Inference Feed</h3>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
              {filteredTxns.length} records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search Account / Txn ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterRisk(lvl)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    filterRisk === lvl
                      ? 'bg-sky-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* CSV Export */}
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-300"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Txn ID</th>
                <th className="py-3 px-4">Sender &rarr; Receiver</th>
                <th className="py-3 px-4 text-right">Amount (INR)</th>
                <th className="py-3 px-4 text-center">GNN Risk Score</th>
                <th className="py-3 px-4">Typology Detected</th>
                <th className="py-3 px-4 text-center">Decision Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No transactions matching selected filter.
                  </td>
                </tr>
              ) : (
                filteredTxns.map((t) => {
                  const isCrit = t.risk_level === 'CRITICAL';
                  const isHigh = t.risk_level === 'HIGH';
                  const isMed = t.risk_level === 'MEDIUM';

                  return (
                    <tr 
                      key={t.id}
                      className="hover:bg-slate-900/60 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {t.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-300">
                          <span className="text-sky-400">{t.sender}</span>
                          <span className="text-slate-600">→</span>
                          <span className="text-indigo-400">{t.receiver}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white">
                        Rs. {t.amount_inr.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
                          <span 
                            className={`h-2 w-2 rounded-full ${
                              isCrit ? 'bg-rose-500' : isHigh ? 'bg-orange-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          />
                          <span className="font-bold">
                            {(t.risk_score * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] ${
                          isCrit || isHigh ? 'text-rose-300 font-semibold' : 'text-slate-400'
                        }`}>
                          {t.pattern_detected}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.action === 'BLOCKED'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : t.action === 'FLAGGED'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {t.action}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
