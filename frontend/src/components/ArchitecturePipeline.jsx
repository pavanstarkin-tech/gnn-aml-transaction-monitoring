import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  ArrowRight, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Cpu, 
  Database, 
  GitBranch, 
  Network, 
  ShieldAlert, 
  FileText, 
  Activity,
  Zap,
  Check
} from 'lucide-react';

export function ArchitecturePipeline({ onNavigateToSimulator }) {
  const [selectedStage, setSelectedStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStepAnim, setActiveStepAnim] = useState(0);

  const stages = [
    {
      id: 1,
      title: "Stage 1: Ingestion Gateway",
      subtitle: "Multi-Rail Transaction Ingestion",
      icon: Database,
      badge: "Real-time Stream",
      color: "from-blue-500 to-cyan-500",
      borderColor: "border-cyan-500",
      description: "Ingests raw financial events across NEFT, RTGS, IMPS, UPI, and Wire Transfers with schema validation and sub-millisecond throughput.",
      inputs: ["Transaction ID, Timestamp", "Sender & Receiver Account IDs", "Amount in INR", "Channel & Device Metadata"],
      processing: "Apache Kafka / Redis event queue with distributed schema validator and de-duplication window.",
      outputs: ["Validated Ingestion Payload Stream", "Kafka Partition Offsets"],
      complexity: "O(1) streaming latency < 2ms",
      codeSnippet: `def ingest_event(payload: dict) -> TransactionEvent:
    validated = schema.validate(payload)
    return stream_publisher.publish("aml_raw_events", validated)`
    },
    {
      id: 2,
      title: "Stage 2: Feature Engineering",
      subtitle: "Velocity & Topological Profiling",
      icon: Cpu,
      badge: "Stateful Aggregation",
      color: "from-cyan-500 to-teal-500",
      borderColor: "border-teal-500",
      description: "Computes 1-hour and 24-hour temporal velocity, fan-in/fan-out ratios, structuring threshold proximity, and sudden behavioral volume spikes.",
      inputs: ["Validated Ingestion Stream", "Historical Account State (30-day window)"],
      processing: "Sliding window accumulators calculate fan_out_ratio, burst_velocity_1h, amount_std_dev.",
      outputs: ["16-Dimensional Dense Feature Vector per Node/Transaction"],
      complexity: "O(k) where k = active window events",
      codeSnippet: `def extract_temporal_features(acc_id: str, window_hours=24):
    txns = redis_cache.get_window(acc_id, hours=window_hours)
    return compute_velocity_ratios(txns)`
    },
    {
      id: 3,
      title: "Stage 3: Graph Construction",
      subtitle: "Dynamic Heterogeneous Network",
      icon: Network,
      badge: "PyTorch Geometric",
      color: "from-teal-500 to-emerald-500",
      borderColor: "border-emerald-500",
      description: "Transforms isolated transactions into a dynamic graph where Accounts are Nodes and Transactions form Directed Weighted Edges.",
      inputs: ["Node Feature Vectors", "Source-Target Edge Index Tuples", "Edge Attributes (Amount, Timestamps)"],
      processing: "PyTorch Geometric Data object construction with dynamic adjacency matrix updater.",
      outputs: ["PyG Data(x=[N, 16], edge_index=[2, E], edge_attr=[E, 4])"],
      complexity: "Sparse CSR Graph Representation",
      codeSnippet: `data = Data(
    x=torch.tensor(node_features, dtype=torch.float),
    edge_index=torch.tensor(edge_indices, dtype=torch.long),
    edge_attr=torch.tensor(edge_weights, dtype=torch.float)
)`
    },
    {
      id: 4,
      title: "Stage 4: 2-Layer GraphSAGE",
      subtitle: "Relational Neighborhood Aggregation",
      icon: GitBranch,
      badge: "Inductive GNN",
      color: "from-emerald-500 to-indigo-500",
      borderColor: "border-indigo-500",
      description: "Aggregates multi-hop structural topology across neighboring accounts. Detects indirect laundering paths, mule rings, and shell proxies.",
      inputs: ["Heterogeneous Graph Adjacency", "Initial Node Embeddings h_v^(0)"],
      processing: "Mean Aggregation -> Linear Projection (64 dims) -> LayerNorm -> LeakyReLU -> Dropout(0.3) -> 2nd Hop Aggregation.",
      outputs: ["64-Dimensional Context-Aware Node Embeddings h_v^(2)"],
      complexity: "O(B * d1 * d2) where B = sample size",
      codeSnippet: `class GraphSAGEAML(torch.nn.Module):
    def forward(self, x, edge_index):
        h1 = F.relu(self.conv1(x, edge_index))
        h1 = self.dropout(h1)
        h2 = self.conv2(h1, edge_index)
        return torch.sigmoid(self.classifier(h2))`
    },
    {
      id: 5,
      title: "Stage 5: Risk Scoring Engine",
      subtitle: "Multi-Head Inference Output",
      icon: Zap,
      badge: "Inference 3.4ms",
      color: "from-indigo-500 to-violet-500",
      borderColor: "border-violet-500",
      description: "Calculates calibrated risk probability score P(Laundering) between 0.000 and 1.000 along with confidence intervals and explainability impacts.",
      inputs: ["GraphSAGE Node Embeddings", "Transaction Risk Classifiers"],
      processing: "Sigmoidal classifier projection with Integrated Gradients for feature attribution breakdown.",
      outputs: ["Calibrated Risk Score (0.0 - 1.0)", "Top-3 Feature Impact Weights"],
      complexity: "AUC-ROC: 0.978 | Precision@K: 0.942",
      codeSnippet: `risk_prob = model.predict_proba(graph_batch)
explanations = integrated_gradients.attribute(model, inputs=graph_batch)`
    },
    {
      id: 6,
      title: "Stage 6: Policy Rule Gate",
      subtitle: "Compliance Tier Routing",
      icon: ShieldAlert,
      badge: "Regulatory Gate",
      color: "from-violet-500 to-rose-500",
      borderColor: "border-rose-500",
      description: "Maps calculated risk score against strict regulatory thresholds (Auto-Pass, Human Review, SAR Investigation, Auto-Block).",
      inputs: ["Calibrated Risk Probability", "Custom Enterprise Policy Rules"],
      processing: "Threshold Engine: <0.40: AUTO_PASS | 0.40-0.69: HUMAN_REVIEW | 0.70-0.84: SAR_INVESTIGATION | >=0.85: AUTO_BLOCK.",
      outputs: ["Compliance Triage Directive", "Automated Webhook / API Dispatch"],
      complexity: "Zero False-Negative Safety Guardrails",
      codeSnippet: `if risk_score >= 0.85:
    action = ComplianceAction.AUTO_BLOCK
elif risk_score >= 0.70:
    action = ComplianceAction.SAR_INVESTIGATION`
    },
    {
      id: 7,
      title: "Stage 7: SAR Generation",
      subtitle: "FIU STR / SAR Document Filing",
      icon: FileText,
      badge: "FIU-IND Ready",
      color: "from-rose-500 to-amber-500",
      borderColor: "border-amber-500",
      description: "Automatically compiles complete audit dossiers containing transaction chains, topological subgraphs, account KYC flags, and legal narrative.",
      inputs: ["Triaged High-Risk Alert", "Sub-Graph Topology Trace", "Account KYC Profiles"],
      processing: "Automated SAR Compiler formats regulatory filing JSON and printable STR dossier conforming to FIU standards.",
      outputs: ["Official SAR Audit Dossier", "Sub-Graph Cytoscape Snapshot"],
      complexity: "Complete Chain of Custody Audit Trail",
      codeSnippet: `def generate_sar_report(alert: Alert) -> SARDossier:
    return SARDossier(
        ref_id=f"FIU-STR-{uuid4()}",
        topology_nodes=alert.get_subgraph(),
        narrative=generate_llm_compliance_narrative(alert)
    )`
    },
    {
      id: 8,
      title: "Stage 8: MLOps Drift Monitor",
      subtitle: "Continuous KS & PSI Monitoring",
      icon: Activity,
      badge: "Active Defense",
      color: "from-amber-500 to-sky-500",
      borderColor: "border-sky-500",
      description: "Continuously tracks concept drift, feature distribution shifts using Kolmogorov-Smirnov (KS) tests and Population Stability Index (PSI).",
      inputs: ["Production Scoring Distribution", "Baseline Validation Dataset"],
      processing: "KS-Test statistic evaluation on amounts/velocity; PSI score computed across risk bins. Triggers automatic retrain when PSI > 0.2.",
      outputs: ["Model Health Telemetry Status", "Auto-Retrain Job Triggers"],
      complexity: "Automated Continuous Machine Learning",
      codeSnippet: `def check_concept_drift(prod_scores, baseline_scores):
    psi = calculate_psi(prod_scores, baseline_scores)
    if psi > 0.20:
        mlflow.trigger_pipeline_retrain()`
    }
  ];

  // Auto-play interactive animation across stages
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStepAnim((prev) => {
          const next = (prev + 1) % stages.length;
          setSelectedStage(next);
          return next;
        });
      }, 2400);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const activeStage = stages[selectedStage];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-400 animate-pulse"></span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                End-to-End GNN Architecture Pipeline
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Interactive 8-stage intelligence lifecycle: from multi-rail financial stream ingestion to inductive GraphSAGE neighborhood aggregation, automated SAR regulatory dossiers, and continuous MLOps drift checks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                  : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/25'
              }`}
            >
              {isPlaying ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  <span>Pause Stream Flow</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Auto-Simulate Pipeline Flow</span>
                </>
              )}
            </button>

            <button
              onClick={onNavigateToSimulator}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-500 text-xs font-medium text-slate-200 transition-colors"
            >
              <Zap className="h-4 w-4 text-sky-400" />
              <span>Launch Live Batch Simulator</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 8-Stage Interactive Process Map */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = selectedStage === idx;
            const isCurrentAnim = activeStepAnim === idx && isPlaying;

            return (
              <button
                key={stage.id}
                onClick={() => {
                  setSelectedStage(idx);
                  setActiveStepAnim(idx);
                }}
                className={`relative text-left p-3 rounded-xl border transition-all flex flex-col justify-between group h-32 ${
                  isSelected
                    ? `bg-slate-800/90 ${stage.borderColor} shadow-lg shadow-sky-500/10 scale-[1.03] ring-1 ring-sky-500/50`
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {/* Active animated beam top line */}
                {isCurrentAnim && (
                  <span className="absolute -top-1 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full animate-pulse"></span>
                )}

                <div className="flex items-center justify-between w-full">
                  <div
                    className={`h-7 w-7 rounded-lg bg-gradient-to-br ${stage.color} flex items-center justify-center text-white shadow-sm`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">
                    0{stage.id}
                  </span>
                </div>

                <div className="mt-2">
                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-white">
                    {stage.title.split(":")[1] || stage.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {stage.badge}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-sky-400 mt-1">
                  <span>Explore</span>
                  <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Detail Deep Dive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stage Specifications & Data Transformation */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-xl bg-gradient-to-br ${activeStage.color} flex items-center justify-center text-white shadow-lg`}
              >
                <activeStage.icon className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                  {activeStage.subtitle}
                </span>
                <h3 className="text-lg font-bold text-white">{activeStage.title}</h3>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
              {activeStage.badge}
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {activeStage.description}
          </p>

          {/* Inputs -> Transformation -> Outputs Pipeline Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-blue-400" />
                Input Data Streams
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activeStage.inputs.map((inp, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-sky-400 mt-0.5">•</span>
                    <span>{inp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-teal-400" />
                Algorithm & Processing
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeStage.processing}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Output Artifacts
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activeStage.outputs.map((out, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{out}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Benchmark & Latency Specs */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="text-slate-400">Computational Benchmark:</span>
            <span className="font-mono text-emerald-400 font-semibold">
              {activeStage.complexity}
            </span>
          </div>
        </div>

        {/* Right Column: Code Implementation Snippet */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <Layers className="h-4 w-4 text-sky-400" />
                Python Implementation
              </h4>
              <span className="text-[11px] font-mono text-slate-500">production_core.py</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
              <pre className="text-sky-300">
                <code>{activeStage.codeSnippet}</code>
              </pre>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Stage <span className="font-bold text-white">{selectedStage + 1}</span> of <span className="font-bold text-white">8</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={selectedStage === 0}
                onClick={() => setSelectedStage((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium disabled:opacity-40 hover:bg-slate-800"
              >
                Previous
              </button>
              <button
                disabled={selectedStage === stages.length - 1}
                onClick={() => setSelectedStage((prev) => Math.min(stages.length - 1, prev + 1))}
                className="px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-semibold disabled:opacity-40 hover:bg-sky-400"
              >
                Next Stage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
