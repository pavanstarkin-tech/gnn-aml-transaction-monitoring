import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  PlaySquare, 
  FlaskConical, 
  Network, 
  FileText, 
  Activity, 
  Settings, 
  ExternalLink, 
  ChevronRight,
  Server,
  User,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export function Sidebar({ activeTab, setActiveTab, systemStatus, isOpen, setIsOpen }) {
  const [showConfig, setShowConfig] = useState(false);
  const [apiUrl, setApiUrl] = useState(api.getBaseUrl());
  const [savedMsg, setSavedMsg] = useState(false);

  const navItems = [
    { 
      id: 'overview', 
      num: '01', 
      label: '8-Stage Pipeline', 
      desc: 'Architecture & Stream Lifecycle',
      icon: Layers 
    },
    { 
      id: 'simulator', 
      num: '02', 
      label: 'Batch AML Simulator', 
      desc: 'Live Multi-Rail Stream Sim',
      icon: PlaySquare 
    },
    { 
      id: 'single_test', 
      num: '03', 
      label: 'Single Transaction Tester', 
      desc: 'Isolated Forensics & Presets',
      icon: FlaskConical 
    },
    { 
      id: 'topology', 
      num: '04', 
      label: 'Network Graph Topology', 
      desc: 'Multi-Hop Crime Ring Explorer',
      icon: Network 
    },
    { 
      id: 'alerts', 
      num: '05', 
      label: 'Alerts & SAR Desk', 
      desc: 'FIU-IND Compliance Triage',
      icon: FileText 
    },
    { 
      id: 'mlops', 
      num: '06', 
      label: 'MLOps & Drift Monitor', 
      desc: 'KS Tests & PSI Governance',
      icon: Activity 
    },
  ];

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

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Left Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 fintech-sidebar flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header / Brand Logo */}
        <div>
          <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#164E8A] flex items-center justify-center text-white shadow-xs">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-sm tracking-tight">GNN AML</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    v1.0.5
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">Enterprise Banking</p>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Core Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 768) setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border-l-3 border-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                      {item.num}
                    </span>
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-medium leading-none">{item.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-none">{item.desc}</div>
                    </div>
                  </div>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Telemetry, API Settings & User Profile */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
          {/* Status Badge */}
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${systemStatus?.mode ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${systemStatus?.mode ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="text-[11px] font-semibold text-slate-700">
                {systemStatus?.mode ? 'Resilient Simulator' : 'FastAPI REST Live'}
              </span>
            </div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              title="API Configuration"
              className="text-slate-400 hover:text-blue-600 transition-colors p-1"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* External Links */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-medium">
            <a
              href="https://huggingface.co/spaces/shootxpress/gnn_ai-classfier"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 p-1.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-2xs"
            >
              <Server className="h-3 w-3" />
              <span>HF Space</span>
              <ExternalLink className="h-2.5 w-2.5 opacity-60" />
            </a>

            <a
              href="https://github.com/pavanstarkin-tech/gnn-aml-transaction-monitoring"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 p-1.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-2xs"
            >
              <span>GitHub</span>
              <ExternalLink className="h-2.5 w-2.5 opacity-60" />
            </a>
          </div>

          {/* User Profile */}
          <div className="pt-2 border-t border-slate-200 flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
              CO
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-800 truncate">Compliance Officer</div>
              <div className="text-[10px] text-slate-600 truncate">Tier-1 FIU Clearance</div>
            </div>
          </div>
        </div>

        {/* API Settings Modal */}
        {showConfig && (
          <div className="absolute bottom-20 left-4 right-4 z-50 p-4 rounded-xl bg-white border border-slate-300 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Settings className="h-3.5 w-3.5 text-blue-600" />
                Backend REST Target URL
              </h4>
              <button
                onClick={() => setShowConfig(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveConfig} className="space-y-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                placeholder="https://shootxpress-gnn-ai-classfier.hf.space/api/v1"
              />
              <p className="text-[10px] text-slate-500 leading-tight">
                Points to Hugging Face or local <code className="text-blue-600">http://localhost:7860/api/v1</code>.
              </p>
              {savedMsg && (
                <p className="text-[11px] text-emerald-600 font-semibold">Settings saved!</p>
              )}
              <div className="flex justify-between items-center pt-1">
                <button
                  type="button"
                  onClick={handleResetConfig}
                  className="text-[11px] text-slate-500 hover:underline"
                >
                  Reset Default
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded bg-[#164E8A] hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Save URL
                </button>
              </div>
            </form>
          </div>
        )}
      </aside>
    </>
  );
}
