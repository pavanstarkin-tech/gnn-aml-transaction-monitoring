import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Settings, 
  ExternalLink, 
  Radio,
  Server,
  Zap,
  Activity,
  FileText,
  Sliders,
  Layers
} from 'lucide-react';
import { api } from '../services/api';

export function Navbar({ activeTab, setActiveTab, systemStatus }) {
  const [showConfig, setShowConfig] = useState(false);
  const [apiUrl, setApiUrl] = useState(api.getBaseUrl());
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    api.setBaseUrl(apiUrl);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleResetConfig = () => {
    api.resetBaseUrl();
    setApiUrl(api.getBaseUrl());
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const navItems = [
    { id: 'overview', number: '01', label: 'PIPELINE FLOW' },
    { id: 'simulator', number: '02', label: 'BATCH SIMULATOR' },
    { id: 'single_test', number: '03', label: 'FORENSIC TESTER' },
    { id: 'topology', number: '04', label: 'CRIME TOPOLOGY' },
    { id: 'alerts', number: '05', label: 'SAR DESK' },
    { id: 'mlops', number: '06', label: 'MLOPS MONITOR' },
  ];

  const isSimulated = Boolean(systemStatus?.mode);

  return (
    <header className="sticky top-0 z-50 bg-[#FFFDF5] border-b-[3px] border-[#111111] shadow-[0_4px_0_#111111]">
      {/* Top Operations Telemetry Ribbon */}
      <div className="bg-[#111111] text-[#FFFDF5] px-4 sm:px-6 py-1.5 text-[11px] font-mono font-bold flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#FFD400]">
            <span className="h-2 w-2 rounded-full bg-[#FFD400] animate-ping"></span>
            AML COMMAND CENTER: ONLINE
          </span>
          <span className="text-[#5B5B55] hidden sm:inline">|</span>
          <span className="text-[#EAE5D8] hidden sm:inline">
            SYSTEM: <strong className="text-white font-bold">GRAPHSAGE INDUCTIVE V1.0.5</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${isSimulated ? 'bg-[#FFD400]' : 'bg-[#36C96F]'}`}></span>
            <span>{isSimulated ? 'RESILIENT SIMULATOR ACTIVE' : 'FASTAPI REST LIVE'}</span>
          </span>
          <span className="text-[#5B5B55]">•</span>
          <span className="text-[#36C96F]">FIU-IND GATE: ACTIVE</span>
          <span className="text-[#5B5B55]">•</span>
          <span className="text-[#00C2D7]">LATENCY &lt; 3.4ms</span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Brand Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 bg-[#FFD400] border-[3px] border-[#111111] shadow-[3px_3px_0_#111111] rounded-[5px] flex items-center justify-center">
              <ShieldCheck className="h-7 w-7 text-[#111111]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#111111]">
                  GNN AML
                </span>
                <span className="brutal-badge bg-[#FFD400] text-[#111111]">
                  FINCRIME OPS
                </span>
              </div>
              <p className="text-xs text-[#5B5B55] font-semibold uppercase tracking-wider">
                Anti-Money Laundering Intelligence System
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-2 text-xs font-black tracking-wider border-[2.5px] border-[#111111] rounded-[5px] transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#FFD400] text-[#111111] shadow-[3px_3px_0_#111111] translate-x-[1px] translate-y-[1px]'
                      : 'bg-[#FFFDF5] text-[#111111] hover:bg-[#EAE5D8] shadow-[2px_2px_0_#111111]'
                  }`}
                >
                  <span className="font-mono text-[10px] text-[#5B5B55] font-bold">
                    {item.number}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="brutal-btn-alt px-3 py-1.5 text-xs flex items-center gap-1.5"
              title="API Endpoint Configuration"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>API CONFIG</span>
            </button>

            <a
              href="https://shootxpress-gnn-ai-classfier.hf.space/docs"
              target="_blank"
              rel="noreferrer"
              className="brutal-btn-alt px-3 py-1.5 text-xs flex items-center gap-1.5 bg-[#EAE5D8]"
            >
              <Server className="h-3.5 w-3.5" />
              <span>SWAGGER</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* API Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md brutal-card-lg bg-[#FFFDF5] p-6 space-y-4">
            <div className="flex items-center justify-between border-b-[3px] border-[#111111] pb-3">
              <h4 className="text-base font-black text-[#111111] uppercase tracking-wide flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#FF7A00]" />
                FastAPI Target Configuration
              </h4>
              <button
                onClick={() => setShowConfig(false)}
                className="h-7 w-7 border-2 border-[#111111] bg-[#FF3B30] text-white font-black text-xs rounded hover:bg-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#111111] block mb-1 uppercase font-mono">
                  FastAPI Base URL:
                </label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full px-3 py-2 brutal-input text-xs font-bold"
                  placeholder="https://shootxpress-gnn-ai-classfier.hf.space/api/v1"
                />
              </div>

              <div className="p-3 bg-[#EAE5D8] border-2 border-[#111111] rounded text-[11px] font-mono text-[#111111] leading-relaxed">
                Default: Hugging Face FastAPI Space. You can also target local <code className="bg-[#FFD400] px-1 font-bold">http://localhost:7860/api/v1</code>.
              </div>

              {savedMsg && (
                <div className="p-2 bg-[#36C96F]/20 border-2 border-[#36C96F] text-[#111111] font-bold text-xs">
                  Settings saved successfully.
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={handleResetConfig}
                  className="text-xs font-bold text-[#5B5B55] hover:text-[#111111] underline"
                >
                  RESET DEFAULT
                </button>
                <button
                  type="submit"
                  className="brutal-btn px-4 py-2 text-xs"
                >
                  SAVE ENDPOINT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
