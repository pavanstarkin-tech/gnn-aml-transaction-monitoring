import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Server, 
  Settings, 
  ExternalLink, 
  Cpu, 
  Radio
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
    { id: 'overview', label: '8-Stage Pipeline Flow' },
    { id: 'simulator', label: 'Batch AML Simulator' },
    { id: 'single_test', label: 'Single Transaction Tester' },
    { id: 'topology', label: 'Network Graph Topology' },
    { id: 'alerts', label: 'Alerts & SAR Desk' },
    { id: 'mlops', label: 'MLOps & Drift Monitor' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">GNN-AML</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  v1.0.5
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">
                GraphSAGE Anti-Money Laundering Intelligence System
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action & Status Items */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-mono hidden lg:inline">FastAPI REST Live</span>
              <button 
                onClick={() => setShowConfig(!showConfig)}
                title="API Endpoint Configuration"
                className="text-slate-400 hover:text-sky-400 ml-1 transition-colors"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
            </div>

            <a
              href="https://huggingface.co/spaces/shootxpress/gnn_ai-classfier"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 hover:bg-indigo-900/60 text-xs font-medium transition-colors"
            >
              <Server className="h-3.5 w-3.5" />
              <span>HF Space</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>

            <a
              href="https://github.com/pavanstarkin-tech/gnn-aml-transaction-monitoring"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </div>
        </div>

        {/* Mobile Submenu Navigation */}
        <div className="md:hidden flex overflow-x-auto py-2 gap-1 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap px-3 py-1 text-xs font-medium rounded-md ${
                activeTab === item.id
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 bg-slate-900/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* API Configuration Modal */}
      {showConfig && (
        <div className="absolute top-16 right-4 sm:right-12 z-50 w-80 sm:w-96 p-4 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl shadow-black/80">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Settings className="h-4 w-4 text-sky-400" />
              Backend REST API Settings
            </h4>
            <button
              onClick={() => setShowConfig(false)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSaveConfig} className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                FastAPI Target Base URL:
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                placeholder="https://shootxpress-gnn-ai-classfier.hf.space/api/v1"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Default is Hugging Face FastAPI backend. You can also point to local <code className="text-sky-400">http://localhost:7860/api/v1</code> when running Python locally.
            </p>
            {savedMsg && (
              <p className="text-xs text-emerald-400 font-medium">Settings saved successfully.</p>
            )}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleResetConfig}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                Reset Default
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow"
              >
                Save URL
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
