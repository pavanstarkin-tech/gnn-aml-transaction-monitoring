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
  ExternalLink,
  Zap,
  Activity,
  Server
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStatus, setSystemStatus] = useState(null);
  const [sarPrefill, setSarPrefill] = useState(null);

  useEffect(() => {
    api.getHealth().then((data) => setSystemStatus(data));
  }, []);

  const handleFileSarFromTester = (result) => {
    setSarPrefill(result);
    setActiveTab('alerts');
  };

  return (
    <div className="min-h-screen bg-[#F4F0E6] text-[#111111] flex flex-col selection:bg-[#FFD400] selection:text-[#111111]">
      {/* Top Operations Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        systemStatus={systemStatus} 
      />

      {/* Main Operations Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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

      {/* Neobrutalist Operations Footer */}
      <footer className="border-t-[3px] border-[#111111] bg-[#FFFDF5] py-6 text-xs text-[#5B5B55] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-bold uppercase">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-[#FFD400] border-2 border-[#111111] rounded flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-[#111111]" />
            </div>
            <span className="text-[#111111] font-black">GNN AML INTELLIGENCE PLATFORM</span>
            <span className="text-[#5B5B55]">•</span>
            <span>PRODUCTION GRAPHSAGE ARCHITECTURE</span>
          </div>

          <div className="flex items-center gap-4 text-[#111111]">
            <a 
              href="https://github.com/pavanstarkin-tech/gnn-aml-transaction-monitoring" 
              target="_blank" 
              rel="noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              <span>GITHUB REPOSITORY</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span>•</span>
            <a 
              href="https://huggingface.co/spaces/shootxpress/gnn_ai-classfier" 
              target="_blank" 
              rel="noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              <span>HUGGING FACE SPACE</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
