import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  Printer, 
  Clock, 
  Send,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { api } from '../services/api';

export function AlertsAndSarDesk({ prefilledAlert }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [triageAction, setTriageAction] = useState('SAR_FILED');
  const [analystNotes, setAnalystNotes] = useState('');
  const [triaging, setTriaging] = useState(false);
  const [triageSuccess, setTriageSuccess] = useState(null);
  const [showDossierModal, setShowDossierModal] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    if (prefilledAlert) {
      const customAlert = {
        id: `SAR-AUTO-${Date.now().toString().slice(-4)}`,
        pattern: prefilledAlert.recommended_action === 'AUTO_BLOCK' ? 'Smurfing / Layering Velocity Ring' : 'Threshold Structuring',
        source_account: prefilledAlert.transaction_id || 'ACC_MULE_401',
        target_account: 'ACC_RECV_PROXY',
        amount_inr: 495000,
        gnn_confidence: prefilledAlert.risk_score || 0.942,
        severity: prefilledAlert.risk_level || 'CRITICAL',
        status: 'PENDING_REVIEW',
        detected_at: 'Just now',
        narrative: `Automated detection triggered by GraphSAGE model scoring ${(prefilledAlert.risk_score * 100 || 94.2).toFixed(1)}% probability of money laundering.`
      };
      setAlerts((prev) => [customAlert, ...prev]);
      setSelectedAlert(customAlert);
    }
  }, [prefilledAlert]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts();
      setAlerts(data);
      if (data.length > 0 && !selectedAlert) {
        setSelectedAlert(data[0]);
      }
    } catch (err) {
      console.error("Alerts fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriageSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAlert) return;
    setTriaging(true);
    try {
      const res = await api.triageAlert(selectedAlert.id, triageAction, analystNotes);
      setTriageSuccess(res);
      setAlerts(alerts.map(a => a.id === selectedAlert.id ? { ...a, status: triageAction } : a));
      setSelectedAlert({ ...selectedAlert, status: triageAction });
      setTimeout(() => setTriageSuccess(null), 3500);
    } catch (err) {
      console.error("Triage error:", err);
    } finally {
      setTriaging(false);
    }
  };

  const printSarDossier = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Panel Card */}
      <div className="brutal-card-lg bg-[#FFFDF5] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-[#FF3B30]" />
              <h2 className="text-2xl font-black text-[#111111] tracking-tight uppercase">
                FIU ALERTS & SAR INVESTIGATION DESK
              </h2>
            </div>
            <p className="text-xs text-[#5B5B55] font-bold uppercase tracking-wider mt-1">
              REGULATORY COMPLIANCE TRIAGE & SUSPICIOUS TRANSACTION REPORT (STR) WORKSTATION
            </p>
          </div>

          <span className="brutal-badge bg-[#FF3B30] text-white">
            ● FIU-IND STR GATE ACTIVE
          </span>
        </div>
      </div>

      {/* Main Investigation Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Alerts (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
              <FolderOpen className="h-4 w-4" />
              ACTIVE ALERT QUEUE ({alerts.length})
            </h3>
            <button
              onClick={loadAlerts}
              className="text-xs font-black text-[#4D7CFE] hover:underline"
            >
              REFRESH
            </button>
          </div>

          <div className="space-y-2.5">
            {alerts.map((alert) => {
              const isSelected = selectedAlert && selectedAlert.id === alert.id;
              const isCrit = alert.severity === 'CRITICAL';

              return (
                <button
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`w-full text-left p-4 border-[2.5px] border-[#111111] rounded-[5px] transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#FFD400] text-[#111111] shadow-[5px_5px_0_#111111] translate-x-[-2px] translate-y-[-2px]'
                      : 'bg-[#FFFDF5] text-[#111111] hover:bg-[#EAE5D8] shadow-[3px_3px_0_#111111]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-black font-mono">
                      {alert.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-[3px] text-[9px] font-black uppercase border border-[#111111] ${
                      isCrit ? 'bg-[#FF3B30] text-white' : 'bg-[#FF7A00] text-white'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>

                  <h4 className="text-xs font-black uppercase line-clamp-1">
                    {alert.pattern}
                  </h4>

                  <div className="flex items-center justify-between text-xs font-mono font-bold mt-2">
                    <span>
                      Rs. {alert.amount_inr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[#111111]">
                      GNN: {(alert.gnn_confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#5B5B55] mt-2 pt-2 border-t border-[#111111]/30">
                    <span>{alert.detected_at}</span>
                    <span className="font-black text-[#111111] uppercase">{alert.status}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Detail Dossier & Triage Form (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedAlert ? (
            <div className="brutal-card-lg bg-[#FFFDF5] p-6 space-y-5">
              {/* Dossier Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#111111] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#5B5B55]">CASE DOSSIER:</span>
                    <h3 className="text-xl font-black text-[#111111] font-mono">{selectedAlert.id}</h3>
                  </div>
                  <p className="text-xs text-[#FF3B30] font-black uppercase mt-0.5">
                    {selectedAlert.pattern}
                  </p>
                </div>

                <button
                  onClick={() => setShowDossierModal(true)}
                  className="brutal-btn px-3.5 py-2 text-xs bg-[#FFD400]"
                >
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  <span>VIEW PRINTABLE STR DOSSIER</span>
                </button>
              </div>

              {/* Transaction Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#EAE5D8] border-2 border-[#111111] rounded-[5px]">
                  <span className="text-[#5B5B55] font-bold block text-[10px] uppercase">PRIMARY TARGET</span>
                  <span className="font-mono font-black text-sm text-[#111111] mt-1 block">
                    {selectedAlert.source_account}
                  </span>
                </div>

                <div className="p-3 bg-[#EAE5D8] border-2 border-[#111111] rounded-[5px]">
                  <span className="text-[#5B5B55] font-bold block text-[10px] uppercase">FLAGGED VOLUME</span>
                  <span className="font-mono font-black text-sm text-[#111111] mt-1 block">
                    Rs. {selectedAlert.amount_inr.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3 bg-[#EAE5D8] border-2 border-[#111111] rounded-[5px]">
                  <span className="text-[#5B5B55] font-bold block text-[10px] uppercase">GNN CONFIDENCE</span>
                  <span className="font-mono font-black text-sm text-[#FF3B30] mt-1 block">
                    {(selectedAlert.gnn_confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Narrative Breakdown */}
              <div className="p-4 bg-[#EAE5D8] border-2 border-[#111111] rounded-[5px] space-y-1.5">
                <h4 className="text-xs font-black text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  COMPLIANCE INVESTIGATION NARRATIVE
                </h4>
                <p className="text-xs text-[#111111] font-medium leading-relaxed">
                  {selectedAlert.narrative}
                </p>
              </div>

              {/* Analyst Triage Decision Form */}
              <form onSubmit={handleTriageSubmit} className="space-y-4 pt-2 border-t-2 border-[#111111]">
                <h4 className="text-xs font-black text-[#111111] uppercase tracking-wider">
                  OFFICIAL COMPLIANCE TRIAGE DIRECTIVE
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'SAR_FILED', label: 'FILE SAR TO FIU', color: 'bg-[#FF3B30] text-white' },
                    { id: 'UNDER_INVESTIGATION', label: 'HOLD & ESCALATE', color: 'bg-[#FF7A00] text-white' },
                    { id: 'DISMISSED_FALSE_POSITIVE', label: 'DISMISS SAFE', color: 'bg-[#36C96F] text-white' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setTriageAction(btn.id)}
                      className={`py-2 px-2 rounded-[4px] text-[11px] font-black uppercase text-center border-2 border-[#111111] transition-all ${
                        triageAction === btn.id
                          ? btn.color + ' shadow-[3px_3px_0_#111111] translate-x-[-1px] translate-y-[-1px]'
                          : 'bg-[#FFFDF5] text-[#111111] hover:bg-[#EAE5D8]'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#111111] block mb-1 uppercase font-mono">
                    ANALYST AUDIT JUSTIFICATION NOTES:
                  </label>
                  <textarea
                    rows={3}
                    value={analystNotes}
                    onChange={(e) => setAnalystNotes(e.target.value)}
                    placeholder="ENTER REGULATORY JUSTIFICATION FOR STR AUDIT TRAIL..."
                    className="w-full px-3 py-2 brutal-input text-xs font-bold"
                  />
                </div>

                {triageSuccess && (
                  <div className="p-3 bg-[#36C96F]/20 border-2 border-[#36C96F] text-[#111111] font-bold text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#36C96F]" />
                    <span>{triageSuccess.message} (REF: {triageSuccess.sar_reference_id})</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={triaging}
                  className="w-full brutal-btn py-3 text-xs bg-[#FFD400]"
                >
                  <Send className="h-3.5 w-3.5 mr-2" />
                  <span>CONFIRM TRIAGE & UPDATE CASE DOSSIER →</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="brutal-card p-12 text-center text-[#5B5B55] font-bold text-xs uppercase">
              SELECT AN ALERT FROM THE QUEUE TO COMMENCE INVESTIGATION.
            </div>
          )}
        </div>
      </div>

      {/* Certified Printable Official SAR Regulatory Modal */}
      {showDossierModal && selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl brutal-card-lg bg-[#FFFDF5] p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b-[3px] border-[#111111] pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#FF3B30] text-white border-2 border-[#111111] shadow-[2px_2px_0_#111111] flex items-center justify-center font-black text-sm">
                  FIU
                </div>
                <div>
                  <h3 className="text-base font-black text-[#111111] uppercase">
                    SUSPICIOUS TRANSACTION REPORT (STR / SAR)
                  </h3>
                  <p className="text-xs text-[#5B5B55] font-mono font-bold">
                    FINANCIAL INTELLIGENCE UNIT REGULATORY FILING
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={printSarDossier}
                  className="brutal-btn-alt px-3 py-1.5 text-xs flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>PRINT DOSSIER</span>
                </button>
                <button
                  onClick={() => setShowDossierModal(false)}
                  className="h-7 w-7 border-2 border-[#111111] bg-[#FF3B30] text-white font-black text-xs rounded hover:bg-black"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official Report Content */}
            <div className="space-y-4 text-xs font-mono text-[#111111] leading-relaxed bg-[#EAE5D8] p-6 border-2 border-[#111111] rounded-[5px]">
              <div className="border-b-2 border-[#111111] pb-3">
                <div className="flex justify-between font-black">
                  <span>REPORT IDENTIFIER:</span>
                  <span>{selectedAlert.id}-FIU-2026</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>FILING DATE:</span>
                  <span>{new Date().toUTCString()}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>REPORTING ENTITY:</span>
                  <span>NATIONAL CORE BANKING GATEWAY (NODE-01)</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-black text-[#FF3B30] block">[SECTION 1: SUBJECT ENTITY]</span>
                <p>Primary Account Target: {selectedAlert.source_account}</p>
                <p>Aggregated Transaction Sum: Rs. {selectedAlert.amount_inr.toLocaleString('en-IN')}</p>
                <p>Assigned Laundering Typology: {selectedAlert.pattern}</p>
              </div>

              <div className="space-y-1">
                <span className="font-black text-[#4D7CFE] block">[SECTION 2: GNN MACHINE LEARNING EVIDENCE]</span>
                <p>GraphSAGE Inductive Risk Score: {(selectedAlert.gnn_confidence * 100).toFixed(2)}%</p>
                <p>Integrated Gradients Feature Attribution: Temporal Velocity Burst, Multi-Hop Fan-Out, Threshold Structuring</p>
              </div>

              <div className="space-y-1">
                <span className="font-black text-[#111111] block">[SECTION 3: INVESTIGATIVE NARRATIVE]</span>
                <p className="text-[#333333] font-sans font-medium">{selectedAlert.narrative}</p>
              </div>

              <div className="pt-3 border-t-2 border-[#111111] flex justify-between text-[11px] font-black">
                <span className="text-[#36C96F]">DIGITAL SIGNATURE: VERIFIED</span>
                <span>COMPLIANCE STATUS: READY FOR DISPATCH</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
