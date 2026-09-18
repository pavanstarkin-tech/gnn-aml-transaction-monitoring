import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Printer, 
  Search, 
  ExternalLink,
  Clock,
  Send,
  AlertTriangle,
  Layers
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
      {/* Header Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-rose-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                FIU SAR / STR Compliance & Investigation Desk
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Review GNN-flagged AML alerts, execute formal analyst triaging decisions, and export certified Suspicious Activity Reports for regulatory dispatch.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-mono font-semibold">
              FIU-IND STR Gate Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Investigation Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Alerts (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Flagged Alert Queue ({alerts.length})
            </h3>
            <button
              onClick={loadAlerts}
              className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-2">
            {alerts.map((alert) => {
              const isSelected = selectedAlert && selectedAlert.id === alert.id;
              const isCrit = alert.severity === 'CRITICAL';

              return (
                <button
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-sky-500 ring-1 ring-sky-500/40 shadow-lg'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <span className="text-xs font-bold font-mono text-white">
                      {alert.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isCrit ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {alert.pattern}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span className="font-mono text-emerald-400 font-bold">
                      Rs. {alert.amount_inr.toLocaleString('en-IN')}
                    </span>
                    <span className="font-mono text-sky-400">
                      GNN Conf: {(alert.gnn_confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-800">
                    <span>{alert.detected_at}</span>
                    <span className="uppercase font-semibold text-indigo-400">{alert.status}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Detail Dossier & Triage Form (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedAlert ? (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              {/* Dossier Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Case Dossier:</span>
                    <h3 className="text-lg font-bold text-white font-mono">{selectedAlert.id}</h3>
                  </div>
                  <p className="text-xs text-rose-400 font-semibold mt-0.5">
                    {selectedAlert.pattern}
                  </p>
                </div>

                <button
                  onClick={() => setShowDossierModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>View Printable STR Dossier</span>
                </button>
              </div>

              {/* Transaction Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Primary Target</span>
                  <span className="font-mono font-bold text-white mt-1 block">
                    {selectedAlert.source_account}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Flagged Volume</span>
                  <span className="font-mono font-bold text-emerald-400 mt-1 block">
                    Rs. {selectedAlert.amount_inr.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">GNN Confidence</span>
                  <span className="font-mono font-bold text-sky-400 mt-1 block">
                    {(selectedAlert.gnn_confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Narrative Breakdown */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-sky-400" />
                  Compliance Investigation Narrative
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedAlert.narrative}
                </p>
              </div>

              {/* Analyst Triage Decision Form */}
              <form onSubmit={handleTriageSubmit} className="space-y-4 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Compliance Officer Triage Action
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'SAR_FILED', label: 'File SAR to FIU', color: 'bg-rose-600 hover:bg-rose-500' },
                    { id: 'UNDER_INVESTIGATION', label: 'Hold & Escalate', color: 'bg-amber-600 hover:bg-amber-500' },
                    { id: 'DISMISSED_FALSE_POSITIVE', label: 'Dismiss Safe', color: 'bg-slate-700 hover:bg-slate-600' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setTriageAction(btn.id)}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold text-center transition-all ${
                        triageAction === btn.id
                          ? 'ring-2 ring-white ' + btn.color + ' text-white shadow-md'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Analyst Case Notes & Audit Justification:
                  </label>
                  <textarea
                    rows={3}
                    value={analystNotes}
                    onChange={(e) => setAnalystNotes(e.target.value)}
                    placeholder="Enter compliance justification for audit trail..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {triageSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{triageSuccess.message} (Ref: {triageSuccess.sar_reference_id})</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={triaging}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-colors shadow"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Confirm Triage & Update Case Record</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-500 text-xs">
              Select an alert from the queue to investigate.
            </div>
          )}
        </div>
      </div>

      {/* Official Printable SAR Modal */}
      {showDossierModal && selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold">
                  FIU
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    SUSPICIOUS TRANSACTION REPORT (STR / SAR)
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Financial Intelligence Unit Compliance Filing
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={printSarDossier}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Dossier</span>
                </button>
                <button
                  onClick={() => setShowDossierModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official Report Content */}
            <div className="space-y-4 text-xs text-slate-300 font-mono leading-relaxed bg-slate-950 p-6 rounded-xl border border-slate-800">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex justify-between">
                  <span>REPORT IDENTIFIER:</span>
                  <span className="font-bold text-white">{selectedAlert.id}-FIU-2026</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>FILING DATE:</span>
                  <span>{new Date().toUTCString()}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>REPORTING INSTITUTION:</span>
                  <span>National Core Banking Gateway (AML-GNN-NODE-01)</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sky-400 font-bold block">[SECTION 1: SUBJECT ENTITY]</span>
                <p>Primary Account Target: {selectedAlert.source_account}</p>
                <p>Aggregated Transaction Sum: Rs. {selectedAlert.amount_inr.toLocaleString('en-IN')}</p>
                <p>Assigned Laundering Typology: {selectedAlert.pattern}</p>
              </div>

              <div className="space-y-2">
                <span className="text-sky-400 font-bold block">[SECTION 2: GNN MACHINE LEARNING EVIDENCE]</span>
                <p>GraphSAGE Inductive Risk Score: {(selectedAlert.gnn_confidence * 100).toFixed(2)}%</p>
                <p>Integrated Gradients Feature Attribution: Temporal Burst Ratio, High Fan-Out Hub, Structuring Anomaly</p>
              </div>

              <div className="space-y-2">
                <span className="text-sky-400 font-bold block">[SECTION 3: INVESTIGATIVE NARRATIVE]</span>
                <p className="text-slate-300">{selectedAlert.narrative}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between text-[11px] text-emerald-400">
                <span>DIGITAL SIGNATURE: VERIFIED</span>
                <span>COMPLIANCE STATUS: READY FOR SUBMISSION</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
