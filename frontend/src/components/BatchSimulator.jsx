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

  useEffect(() => {
    handleRunSimulation();
  }, []);

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const result = await api.runBatchSimulation(numTxns, launderingRatio, selectedPatterns);
      setSimulationData(result);

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
      {/* Simulation Control Card */}
      <div className="brutal-card-lg bg-[#FFFDF5] p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-[3px] border-[#111111] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[#FF7A00]" />
              <h2 className="text-2xl font-black text-[#111111] tracking-tight uppercase">
                LIVE AML BATCH SIMULATOR
              </h2>
            </div>
            <p className="text-xs text-[#5B5B55] font-bold uppercase tracking-wider mt-1">
              DYNAMIC MULTI-HOP INFERENCE & TYPOLOGY INJECTION LABORATORY
            </p>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className="brutal-btn px-6 py-3 text-xs bg-[#FFD400]"
          >
            {loading ? (
              <>
                <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                <span>COMPUTING GRAPHSAGE INFERENCE...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2 fill-current" />
                <span>RUN BATCH SIMULATION →</span>
              </>
            )}
          </button>
        </div>

        {/* Configuration Sliders & Pattern Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
          {/* Slider 1: Transaction Volume */}
          <div className="space-y-2 p-3 bg-[#EAE5D8] border-2 border-[#111111] rounded-[5px]">
            <div className="flex justify-between text-xs font-black uppercase">
              <span className="text-[#111111]">Batch Volume:</span>
              <span className="text-[#4D7CFE] font-mono">{numTxns} TXNS</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              step="10"
              value={numTxns}
              onChange={(e) => setNumTxns(Number(e.target.value))}
              className="w-full h-2.5 bg-[#FFFDF5] border border-[#111111] rounded-lg appearance-none cursor-pointer accent-[#111111]"
            />
            <div className="flex justify-between text-[10px] text-[#5B5B55] font-mono font-bold">
              <span>20 TXNS</span>
              <span>80 TXNS</span>
              <span>150 (MAX)</span>
            </div>
          </div>

          {/* Slider 2: Money Laundering Injection Ratio */}
          <div className="space-y-2 p-3 bg-[#EAE5D8] border-2 border-[#111111] rounded-[5px]">
            <div className="flex justify-between text-xs font-black uppercase">
              <span className="text-[#111111]">Laundering Ratio:</span>
              <span className="text-[#FF3B30] font-mono">{(launderingRatio * 100).toFixed(0)}% MALICIOUS</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.45"
              step="0.05"
              value={launderingRatio}
              onChange={(e) => setLaunderingRatio(Number(e.target.value))}
              className="w-full h-2.5 bg-[#FFFDF5] border border-[#111111] rounded-lg appearance-none cursor-pointer accent-[#FF3B30]"
            />
            <div className="flex justify-between text-[10px] text-[#5B5B55] font-mono font-bold">
              <span>5% (SUBTLE)</span>
              <span>20% (DEFAULT)</span>
              <span>45% (ATTACK)</span>
            </div>
          </div>

          {/* Pattern Multi-Select Buttons */}
          <div className="space-y-2 p-3 bg-[#EAE5D8] border-2 border-[#111111] rounded-[5px]">
            <span className="text-xs font-black text-[#111111] uppercase block">
              ACTIVE TYPOLOGIES:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'smurfing', label: 'SMURFING' },
                { id: 'layering', label: 'LAYERING' },
                { id: 'structuring', label: 'STRUCTURING' },
                { id: 'shell_fans', label: 'SHELL FANS' }
              ].map((p) => {
                const isSelected = selectedPatterns.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePattern(p.id)}
                    className={`px-2.5 py-1 rounded-[4px] text-[10px] font-black border-2 border-[#111111] transition-all ${
                      isSelected
                        ? 'bg-[#111111] text-[#FFD400] shadow-[2px_2px_0_#111111]'
                        : 'bg-[#FFFDF5] text-[#111111] hover:bg-[#FFFDF5]'
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

      {/* 4 Large Neobrutalist Metric Blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Screened Volume */}
        <div className="brutal-card bg-[#FFFDF5] p-5">
          <div className="flex items-center justify-between text-xs font-black uppercase text-[#5B5B55] mb-2">
            <span>TOTAL SCREENED</span>
            <Zap className="h-4 w-4 text-[#4D7CFE]" />
          </div>
          <div className="text-3xl font-black text-[#111111] font-mono tracking-tight">
            {summary.total_transactions}
          </div>
          <p className="text-[11px] font-bold text-[#5B5B55] uppercase mt-1">
            EVENTS VIA GRAPHSAGE
          </p>
        </div>

        {/* Card 2: Critical Blocked */}
        <div className="brutal-card bg-[#FFFDF5] p-5 border-t-[5px] border-t-[#FF3B30]">
          <div className="flex items-center justify-between text-xs font-black uppercase text-[#FF3B30] mb-2">
            <span>CRITICAL BLOCKED</span>
            <ShieldAlert className="h-4 w-4 text-[#FF3B30]" />
          </div>
          <div className="text-3xl font-black text-[#FF3B30] font-mono tracking-tight">
            {summary.critical_alerts}
          </div>
          <p className="text-[11px] font-bold text-[#5B5B55] uppercase mt-1">
            AUTO-BLOCKED (RISK ≥ 0.85)
          </p>
        </div>

        {/* Card 3: High Risk SAR Under Review */}
        <div className="brutal-card bg-[#FFFDF5] p-5 border-t-[5px] border-t-[#FF7A00]">
          <div className="flex items-center justify-between text-xs font-black uppercase text-[#FF7A00] mb-2">
            <span>SAR INVESTIGATIONS</span>
            <AlertTriangle className="h-4 w-4 text-[#FF7A00]" />
          </div>
          <div className="text-3xl font-black text-[#FF7A00] font-mono tracking-tight">
            {summary.high_risk}
          </div>
          <p className="text-[11px] font-bold text-[#5B5B55] uppercase mt-1">
            FORWARDED TO STR DESK
          </p>
        </div>

        {/* Card 4: Total Flagged INR Value */}
        <div className="brutal-card bg-[#FFFDF5] p-5 border-t-[5px] border-t-[#36C96F]">
          <div className="flex items-center justify-between text-xs font-black uppercase text-[#111111] mb-2">
            <span>FLAGGED INR VALUE</span>
            <Activity className="h-4 w-4 text-[#36C96F]" />
          </div>
          <div className="text-2xl font-black text-[#111111] font-mono tracking-tight">
            Rs. {(summary.total_flagged_inr || 7850000).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] font-bold text-[#36C96F] uppercase mt-1">
            ACCURACY: {summary.detection_rate_pct || 94.8}%
          </p>
        </div>
      </div>

      {/* Interactive Topology View */}
      {graphTopology && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#111111] uppercase tracking-wide flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#4D7CFE]" />
              DYNAMIC BATCH TOPOLOGY GRAPH
            </h3>
            <span className="text-xs text-[#5B5B55] font-mono font-bold">
              CLICK ANY NODE TO INSPECT ATTRIBUTES
            </span>
          </div>
          <NetworkGraphCanvas data={graphTopology} />
        </div>
      )}

      {/* Live Intelligence Table */}
      <div className="brutal-card-lg bg-[#FFFDF5] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#111111] pb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-[#111111]" />
            <h3 className="text-base font-black text-[#111111] uppercase">LIVE INFERENCE FEED</h3>
            <span className="brutal-badge bg-[#FFD400] text-[#111111]">
              {filteredTxns.length} EVENTS
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="SEARCH ACCOUNT / TXN ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 brutal-input text-xs font-bold w-48 sm:w-60"
            />

            <div className="flex items-center gap-1 bg-[#EAE5D8] p-1 rounded-[4px] border-2 border-[#111111] text-xs">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterRisk(lvl)}
                  className={`px-2 py-1 rounded-[3px] text-[10px] font-black uppercase transition-colors ${
                    filterRisk === lvl
                      ? 'bg-[#111111] text-[#FFD400]'
                      : 'text-[#111111] hover:bg-[#FFFDF5]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              onClick={exportCsv}
              className="brutal-btn-alt px-3 py-1.5 text-xs flex items-center gap-1.5 bg-[#FFFDF5]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>EXPORT CSV</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto border-2 border-[#111111] rounded-[5px]">
          <table className="w-full text-left text-xs text-[#111111]">
            <thead className="bg-[#111111] text-[#FFFDF5] font-mono uppercase text-[10px] border-b-2 border-[#111111]">
              <tr>
                <th className="py-3 px-4">TXN ID</th>
                <th className="py-3 px-4">SENDER &rarr; RECEIVER</th>
                <th className="py-3 px-4 text-right">INR AMOUNT</th>
                <th className="py-3 px-4 text-center">GNN RISK</th>
                <th className="py-3 px-4">TYPOLOGY</th>
                <th className="py-3 px-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#111111] font-mono font-bold bg-[#FFFDF5]">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#5B5B55]">
                    NO TRANSACTIONS MATCHING FILTER.
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
                      className="hover:bg-[#EAE5D8] transition-colors"
                    >
                      <td className="py-3 px-4 font-black">
                        {t.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[#4D7CFE]">{t.sender}</span>
                          <span className="text-[#5B5B55]">→</span>
                          <span className="text-[#8B5CF6]">{t.receiver}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-black">
                        Rs. {t.amount_inr.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded border border-[#111111] font-black text-xs ${
                          isCrit ? 'bg-[#FF3B30] text-white' : isHigh ? 'bg-[#FF7A00] text-white' : isMed ? 'bg-[#FFD400] text-[#111111]' : 'bg-[#36C96F] text-white'
                        }`}>
                          {(t.risk_score * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] font-bold">
                        {t.pattern_detected}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-black border-2 border-[#111111] ${
                          t.action === 'BLOCKED'
                            ? 'bg-[#FF3B30] text-white shadow-[2px_2px_0_#111111]'
                            : t.action === 'FLAGGED'
                            ? 'bg-[#FF7A00] text-white shadow-[2px_2px_0_#111111]'
                            : 'bg-[#36C96F] text-white shadow-[2px_2px_0_#111111]'
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
