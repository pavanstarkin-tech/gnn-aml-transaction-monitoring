import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ArchitecturePipeline } from './components/ArchitecturePipeline';
import { BatchSimulator } from './components/BatchSimulator';
import { SingleTransactionTester } from './components/SingleTransactionTester';
import { TopologyExplorer } from './components/TopologyExplorer';
import { AlertsAndSarDesk } from './components/AlertsAndSarDesk';
import { MlopsMonitor } from './components/MlopsMonitor';
import { api } from './services/api';
import { 
  ShieldCheck, 
  Activity, 
  Server, 
  Sparkles, 
  ExternalLink,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStatus, setSystemStatus] = useState(null);
  const [sarPrefill, setSarPrefill] = useState(null);

  useEffect(() => {
    // Initial health ping to FastAPI backend
    api.getHealth().then((data) => setSystemStatus(data));
  }, []);

  const handleFileSarFromTester = (result) => {
    setSarPrefill(result);
    setActiveTab('alerts');
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        systemStatus={systemStatus} 
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Real-time System Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold text-white">System Active:</span>
            <span className="text-slate-300">
              GraphSAGE 2-Layer Relational AML Intelligence Engine
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>FastAPI Endpoints: <strong className="text-emerald-400">Online</strong></span>
            <span>•</span>
            <span>Target Currency: <strong className="text-sky-400">INR (Rs.)</strong></span>
            <span>•</span>
            <span>Inference SLA: <strong className="text-indigo-400">&lt; 5ms</strong></span>
          </div>
        </div>

        {/* View Switcher */}
        {activeTab === 'overview' && (
          <ArchitecturePipeline 
            onNavigateToSimulator={() => setActiveTab('simulator')} 
          />
        )}

        {activeTab === 'simulator' && (
          <BatchSimulator />
        )}

        {activeTab === 'single_test' && (
          <SingleTransactionTester 
            onFileSar={handleFileSarFromTester} 
          />
        )}

        {activeTab === 'topology' && (
          <TopologyExplorer />
        )}

        {activeTab === 'alerts' && (
          <AlertsAndSarDesk 
            prefilledAlert={sarPrefill} 
          />
        )}

        {activeTab === 'mlops' && (
          <MlopsMonitor />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-sky-400" />
            <span className="font-semibold text-slate-400">GNN AML Monitoring System</span>
            <span>•</span>
            <span>Production GraphSAGE Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a 
              href="https://github.com/pavanstarkin-tech/gnn-aml-transaction-monitoring" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-sky-400 transition-colors"
            >
              GitHub Repository
            </a>
            <span>•</span>
            <a 
              href="https://huggingface.co/spaces/shootxpress/gnn_ai-classfier" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-sky-400 transition-colors"
            >
              Hugging Face Space
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
