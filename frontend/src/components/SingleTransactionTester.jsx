import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  Sparkles, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export function SingleTransactionTester({ onFileSar }) {
  const [formData, setFormData] = useState({
    transaction_id: "TXN-INSPECT-882",
    sender_account: "ACC_MULE_401",
    receiver_account: "ACC_SHELL_902",
    amount_inr: 495000,
    transaction_type: "TRANSFER",
    sender_txn_count_1h: 9,
    sender_fan_out: 6,
    receiver_fan_in: 5
  });

  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState(null);

  const presets = [
    {
      label: "Smurfing Loop (Structuring)",
      badge: "High Risk",
      badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      data: {
        transaction_id: "TXN-SMURF-991",
        sender_account: "ACC_MULE_101",
        receiver_account: "ACC_MULE_102",
        amount_inr: 490000,
        transaction_type: "TRANSFER",
        sender_txn_count_1h: 8,
        sender_fan_out: 5,
        receiver_fan_in: 4
      }
    },
    {
      label: "Rapid Layering Fan-Out",
      badge: "High Risk",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      data: {
        transaction_id: "TXN-LAYER-442",
        sender_account: "ACC_CORP_881",
        receiver_account: "ACC_RECV_MULE_12",
        amount_inr: 850000,
        transaction_type: "TRANSFER",
        sender_txn_count_1h: 14,
        sender_fan_out: 12,
        receiver_fan_in: 1
      }
    },
    {
      label: "High-Velocity Shell Inflow",
      badge: "Critical",
      badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      data: {
        transaction_id: "TXN-SHELL-703",
        sender_account: "ACC_OFFSHORE_HUB",
        receiver_account: "ACC_DOMESTIC_SHELL",
        amount_inr: 2800000,
        transaction_type: "TRANSFER",
        sender_txn_count_1h: 11,
        sender_fan_out: 8,
        receiver_fan_in: 9
      }
    },
    {
      label: "Legitimate Commercial Pay",
      badge: "Safe",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      data: {
        transaction_id: "TXN-COMM-012",
        sender_account: "ACC_RETAIL_USER_41",
        receiver_account: "ACC_VERIFIED_MERCHANT",
        amount_inr: 12500,
        transaction_type: "PAYMENT",
        sender_txn_count_1h: 1,
        sender_fan_out: 1,
        receiver_fan_in: 8
      }
    }
  ];

  const handleApplyPreset = (presetData) => {
    setFormData(presetData);
    setResult(null);
  };

  const handleScore = async (e) => {
    if (e) e.preventDefault();
    setScoring(true);
    try {
      const res = await api.scoreTransaction(formData);
      setResult(res);
    } catch (err) {
      console.error("Scoring error:", err);
    } finally {
      setScoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1-Click Presets Ribbon */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              1-Click Typology Presets
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Select a verified AML attack vector or normal pattern
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset.data)}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500 hover:bg-slate-800/60 text-left transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${preset.badgeColor}`}>
                  {preset.badge}
                </span>
                <span className="text-[10px] font-mono text-slate-500">Preset #{idx + 1}</span>
              </div>
              <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white">
                {preset.label}
              </h4>
              <p className="text-[11px] font-mono text-emerald-400 mt-1">
                Rs. {preset.data.amount_inr.toLocaleString('en-IN')}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transaction Input Form */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Transaction Vector Parameters</h3>
              <p className="text-xs text-slate-400">Configure parameters for inductive GNN scoring</p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-sky-400">
              {formData.transaction_id}
            </span>
          </div>

          <form onSubmit={handleScore} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Sender Account ID
                </label>
                <input
                  type="text"
                  value={formData.sender_account}
                  onChange={(e) => setFormData({ ...formData, sender_account: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Receiver Account ID
                </label>
                <input
                  type="text"
                  value={formData.receiver_account}
                  onChange={(e) => setFormData({ ...formData, receiver_account: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Amount in INR (Rs.)
                </label>
                <input
                  type="number"
                  value={formData.amount_inr}
                  onChange={(e) => setFormData({ ...formData, amount_inr: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Transaction Type
                </label>
                <select
                  value={formData.transaction_type}
                  onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="TRANSFER">WIRE / NEFT TRANSFER</option>
                  <option value="PAYMENT">MERCHANT PAYMENT</option>
                  <option value="CASH_DEPOSIT">CASH DEPOSIT</option>
                  <option value="CASH_OUT">ATM CASH OUT</option>
                </select>
              </div>
            </div>

            {/* Velocity & Topological Fan-Out Controls */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">1-Hour Velocity:</span>
                  <span className="text-sky-400 font-mono">{formData.sender_txn_count_1h} txns</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={formData.sender_txn_count_1h}
                  onChange={(e) => setFormData({ ...formData, sender_txn_count_1h: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Sender Fan-Out:</span>
                  <span className="text-indigo-400 font-mono">{formData.sender_fan_out} hops</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={formData.sender_fan_out}
                  onChange={(e) => setFormData({ ...formData, sender_fan_out: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={scoring}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
            >
              {scoring ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Computing Multi-Hop GraphSAGE Embeddings...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-current" />
                  <span>Execute GNN Risk Classification</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: GNN Model Scoring & Explainability HUD */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-sky-400" />
                GNN Inference Output
              </h3>
              <span className="text-xs font-mono text-emerald-400">
                Latency: 3.4ms
              </span>
            </div>

            {result ? (
              <div className="space-y-5 pt-3">
                {/* Score Gauge Meter */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Calibrated Laundering Probability
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-extrabold text-white font-mono">
                        {(result.risk_score * 100).toFixed(1)}%
                      </span>
                      <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        result.risk_level === 'CRITICAL' 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                          : result.risk_level === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {result.risk_level} RISK
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Compliance Gate Action
                    </span>
                    <span className={`inline-block mt-1 font-mono font-bold text-sm px-3 py-1 rounded-lg ${
                      result.recommended_action === 'AUTO_BLOCK'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                        : result.recommended_action === 'SAR_INVESTIGATION'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {result.recommended_action}
                    </span>
                  </div>
                </div>

                {/* Explainability Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-sky-400" />
                    Top Attributed Feature Impacts (Integrated Gradients)
                  </h4>
                  <div className="space-y-1.5">
                    {(result.explainability_top_features || []).map((feat, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                        <span className="font-mono text-slate-300">{feat.feature}</span>
                        <span className="font-semibold text-rose-400 font-mono">{feat.impact}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Trail */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Audit Decision Engine:</span>
                    <span className="text-slate-200">{result.audit_trail?.decision_engine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FIU Compliance Status:</span>
                    <span className="text-emerald-400">{result.audit_trail?.compliance_status}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <Layers className="h-10 w-10 mx-auto text-slate-700 animate-pulse" />
                <p className="text-xs">Click "Execute GNN Risk Classification" to view inductive scores</p>
              </div>
            )}
          </div>

          {result && result.risk_score >= 0.70 && (
            <button
              onClick={() => onFileSar && onFileSar(result)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600/20 border border-rose-500/40 hover:bg-rose-600/30 text-rose-300 font-semibold text-xs transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Generate Official FIU SAR Filing Dossier</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
