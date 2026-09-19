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
  ArrowRight,
  FlaskConical
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
      label: "SMURFING LOOP (STRUCTURING)",
      badge: "HIGH RISK",
      badgeBg: "bg-[#FF3B30] text-white",
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
      label: "RAPID LAYERING FAN-OUT",
      badge: "HIGH RISK",
      badgeBg: "bg-[#FF7A00] text-white",
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
      label: "HIGH-VELOCITY SHELL INFLOW",
      badge: "CRITICAL",
      badgeBg: "bg-[#FF3B30] text-white",
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
      label: "LEGITIMATE COMMERCIAL PAY",
      badge: "SAFE",
      badgeBg: "bg-[#36C96F] text-white",
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
      {/* 1-Click Typology Presets Ribbon */}
      <div className="brutal-card-lg bg-[#FFFDF5] p-5">
        <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-[#FFD400] fill-[#111111]" />
            <h3 className="text-sm font-black text-[#111111] uppercase tracking-wider">
              1-CLICK TYPOLOGY FORENSIC PRESETS
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-[#5B5B55]">
            SELECT PRE-ENGINEERED AML ATTACK VECTOR
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset.data)}
              className="p-3.5 bg-[#FFFDF5] border-[2.5px] border-[#111111] shadow-[4px_4px_0_#111111] hover:bg-[#EAE5D8] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_#111111] rounded-[5px] text-left transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded-[3px] text-[9px] font-black uppercase border border-[#111111] ${preset.badgeBg}`}>
                  {preset.badge}
                </span>
                <span className="text-[10px] font-mono font-bold text-[#5B5B55]">#{idx + 1}</span>
              </div>
              <h4 className="text-xs font-black text-[#111111] uppercase leading-tight">
                {preset.label}
              </h4>
              <p className="text-xs font-mono font-black text-[#111111] mt-2">
                Rs. {preset.data.amount_inr.toLocaleString('en-IN')}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transaction Input Form (6 Cols) */}
        <div className="lg:col-span-6 brutal-card-lg bg-[#FFFDF5] p-6 space-y-5">
          <div className="flex items-center justify-between border-b-[3px] border-[#111111] pb-4">
            <div>
              <h3 className="text-lg font-black text-[#111111] uppercase">TRANSACTION VECTOR</h3>
              <p className="text-xs font-bold text-[#5B5B55] uppercase">INDUCTIVE GRAPHSAGE INPUT PARAMETERS</p>
            </div>
            <span className="brutal-badge bg-[#FFD400] text-[#111111] font-mono">
              {formData.transaction_id}
            </span>
          </div>

          <form onSubmit={handleScore} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black text-[#111111] uppercase block mb-1">
                  SENDER ACCOUNT ID
                </label>
                <input
                  type="text"
                  value={formData.sender_account}
                  onChange={(e) => setFormData({ ...formData, sender_account: e.target.value })}
                  className="w-full px-3 py-2 brutal-input text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-black text-[#111111] uppercase block mb-1">
                  RECEIVER ACCOUNT ID
                </label>
                <input
                  type="text"
                  value={formData.receiver_account}
                  onChange={(e) => setFormData({ ...formData, receiver_account: e.target.value })}
                  className="w-full px-3 py-2 brutal-input text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black text-[#111111] uppercase block mb-1">
                  AMOUNT IN INR (RS.)
                </label>
                <input
                  type="number"
                  value={formData.amount_inr}
                  onChange={(e) => setFormData({ ...formData, amount_inr: Number(e.target.value) })}
                  className="w-full px-3 py-2 brutal-input text-xs font-black text-[#111111]"
                />
              </div>

              <div>
                <label className="text-xs font-black text-[#111111] uppercase block mb-1">
                  TRANSACTION TYPE
                </label>
                <select
                  value={formData.transaction_type}
                  onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                  className="w-full px-3 py-2 brutal-input text-xs font-bold"
                >
                  <option value="TRANSFER">WIRE / NEFT TRANSFER</option>
                  <option value="PAYMENT">MERCHANT PAYMENT</option>
                  <option value="CASH_DEPOSIT">CASH DEPOSIT</option>
                  <option value="CASH_OUT">ATM CASH OUT</option>
                </select>
              </div>
            </div>

            {/* Velocity & Topological Controls */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-[#EAE5D8] border-2 border-[#111111] rounded-[5px] space-y-1.5">
                <div className="flex justify-between text-xs font-black uppercase">
                  <span>1-HOUR VELOCITY:</span>
                  <span className="text-[#4D7CFE] font-mono">{formData.sender_txn_count_1h} TXNS</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={formData.sender_txn_count_1h}
                  onChange={(e) => setFormData({ ...formData, sender_txn_count_1h: Number(e.target.value) })}
                  className="w-full h-2 bg-[#FFFDF5] border border-[#111111] rounded-lg appearance-none cursor-pointer accent-[#111111]"
                />
              </div>

              <div className="p-3 bg-[#EAE5D8] border-2 border-[#111111] rounded-[5px] space-y-1.5">
                <div className="flex justify-between text-xs font-black uppercase">
                  <span>SENDER FAN-OUT:</span>
                  <span className="text-[#8B5CF6] font-mono">{formData.sender_fan_out} HOPS</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={formData.sender_fan_out}
                  onChange={(e) => setFormData({ ...formData, sender_fan_out: Number(e.target.value) })}
                  className="w-full h-2 bg-[#FFFDF5] border border-[#111111] rounded-lg appearance-none cursor-pointer accent-[#111111]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={scoring}
              className="w-full brutal-btn py-3.5 text-xs bg-[#FFD400]"
            >
              {scoring ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  <span>COMPUTING MULTI-HOP NEIGHBORHOOD EMBEDDINGS...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2 fill-current" />
                  <span>EXECUTE GNN RISK CLASSIFICATION →</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Risk Score HUD & Explainability (6 Cols) */}
        <div className="lg:col-span-6 brutal-card-lg bg-[#FFFDF5] p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between border-b-[3px] border-[#111111] pb-4">
              <h3 className="text-lg font-black text-[#111111] uppercase flex items-center gap-2">
                <Layers className="h-5 w-5 text-[#4D7CFE]" />
                GNN INFERENCE HUD
              </h3>
              <span className="brutal-badge bg-[#36C96F] text-white font-mono">
                LATENCY: 3.4MS
              </span>
            </div>

            {result ? (
              <div className="space-y-4 pt-3">
                {/* Score Gauge Block */}
                <div className="p-4 bg-[#EAE5D8] border-[2.5px] border-[#111111] rounded-[5px] flex items-center justify-between shadow-[4px_4px_0_#111111]">
                  <div>
                    <span className="text-[10px] font-black text-[#5B5B55] uppercase tracking-wider block">
                      CALIBRATED LAUNDERING PROBABILITY
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl font-black text-[#111111] font-mono">
                        {(result.risk_score * 100).toFixed(1)}%
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border border-[#111111] ${
                        result.risk_level === 'CRITICAL' 
                          ? 'bg-[#FF3B30] text-white' 
                          : result.risk_level === 'HIGH'
                          ? 'bg-[#FF7A00] text-white'
                          : 'bg-[#36C96F] text-white'
                      }`}>
                        {result.risk_level}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-black text-[#5B5B55] uppercase tracking-wider block">
                      COMPLIANCE GATE
                    </span>
                    <span className={`inline-block mt-1 font-mono font-black text-xs px-3 py-1.5 rounded-[4px] border-2 border-[#111111] ${
                      result.recommended_action === 'AUTO_BLOCK'
                        ? 'bg-[#FF3B30] text-white shadow-[2px_2px_0_#111111]'
                        : result.recommended_action === 'SAR_INVESTIGATION'
                        ? 'bg-[#FF7A00] text-white shadow-[2px_2px_0_#111111]'
                        : 'bg-[#36C96F] text-white shadow-[2px_2px_0_#111111]'
                    }`}>
                      {result.recommended_action}
                    </span>
                  </div>
                </div>

                {/* Explainability Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-[#FF7A00]" />
                    FEATURE EXPLAINABILITY IMPACTS (INTEGRATED GRADIENTS)
                  </h4>
                  <div className="space-y-1.5">
                    {(result.explainability_top_features || []).map((feat, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-[#FFFDF5] border-2 border-[#111111] rounded-[4px] text-xs font-mono">
                        <span className="font-bold text-[#111111]">{feat.feature}</span>
                        <span className="font-black text-[#FF3B30]">{feat.impact}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Trail */}
                <div className="p-3 bg-[#111111] text-[#FFFDF5] border-2 border-[#111111] rounded text-[11px] font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#EAE5D8]">DECISION ENGINE:</span>
                    <span className="text-white font-bold">{result.audit_trail?.decision_engine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#EAE5D8]">FIU COMPLIANCE:</span>
                    <span className="text-[#36C96F] font-bold">{result.audit_trail?.compliance_status}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-[#5B5B55] space-y-2">
                <Layers className="h-10 w-10 mx-auto text-[#111111]" />
                <p className="text-xs font-bold uppercase">CLICK "EXECUTE GNN RISK CLASSIFICATION" TO COMMENCE INFERENCE</p>
              </div>
            )}
          </div>

          {result && result.risk_score >= 0.70 && (
            <button
              onClick={() => onFileSar && onFileSar(result)}
              className="w-full brutal-btn py-3 text-xs bg-[#FF3B30] text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              <span>GENERATE OFFICIAL FIU SAR FILING DOSSIER →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
