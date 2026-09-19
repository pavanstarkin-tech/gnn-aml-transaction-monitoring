import React, { useState, useEffect } from 'react';
import { 
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
  Terminal,
  Layers
} from 'lucide-react';

export function ArchitecturePipeline({ onNavigateToSimulator }) {
  const [selectedStage, setSelectedStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStepAnim, setActiveStepAnim] = useState(0);

  const stages = [
    {
      id: "01",
      title: "INGESTION GATEWAY",
      subtitle: "Multi-Rail Financial Stream",
      icon: Database,
      badge: "STREAMING INGESTION",
      accentBg: "bg-[#FFD400]",
      description: "Ingests raw financial events across NEFT, RTGS, IMPS, UPI, and Wire Transfers with schema validation and sub-millisecond throughput in Indian Rupees (INR).",
      inputs: ["Transaction ID & Millisecond Timestamp", "Sender & Receiver Account IDs", "Monetary Amount in INR", "Channel (UPI, IMPS, NEFT, RTGS) & Device Metadata"],
      processing: "Apache Kafka event queue with distributed schema validator, null mitigation, and sliding de-duplication window.",
      outputs: ["Validated Ingestion Payload Stream", "Kafka Partition Offsets"],
      complexity: "O(1) Streaming Latency < 2ms",
      codeSnippet: `def ingest_event(payload: dict) -> TransactionEvent:
    validated = schema.validate(payload)
    return stream_publisher.publish("aml_raw_events", validated)`
    },
    {
      id: "02",
      title: "FEATURE ENGINEERING",
      subtitle: "Velocity & Topological Profiling",
      icon: Cpu,
      badge: "TEMPORAL PROFILING",
      accentBg: "bg-[#00C2D7]",
      description: "Computes 1-hour and 24-hour temporal velocity, fan-in/fan-out ratios, structuring threshold proximity, and sudden behavioral volume spikes.",
      inputs: ["Validated Ingestion Stream", "Historical Account State (30-Day Window)"],
      processing: "Sliding window accumulators calculate fan_out_ratio, burst_velocity_1h, amount_log_norm, and account retention balance.",
      outputs: ["16-Dimensional Dense Feature Vector per Node/Transaction"],
      complexity: "O(k) where k = active window events",
      codeSnippet: `def extract_temporal_features(acc_id: str, window_hours=24):
    txns = redis_cache.get_window(acc_id, hours=window_hours)
    return compute_velocity_ratios(txns)`
    },
    {
      id: "03",
      title: "GRAPH CONSTRUCTION",
      subtitle: "Dynamic MultiGraph Network",
      icon: Network,
      badge: "PYTORCH GEOMETRIC",
      accentBg: "bg-[#36C96F]",
      description: "Transforms isolated transactions into a dynamic graph where Accounts are Nodes and Transactions form Directed Weighted Edges.",
      inputs: ["Node Feature Vectors", "Source-Target Edge Index Tuples", "Edge Attributes (INR Amount, Channel, Timestamps)"],
      processing: "PyTorch Geometric Data object construction with dynamic adjacency matrix updates and cycle detection.",
      outputs: ["PyG Data(x=[N, 16], edge_index=[2, E], edge_attr=[E, 4])"],
      complexity: "Sparse CSR Graph Representation",
      codeSnippet: `data = Data(
    x=torch.tensor(node_features, dtype=torch.float),
    edge_index=torch.tensor(edge_indices, dtype=torch.long),
    edge_attr=torch.tensor(edge_weights, dtype=torch.float)
)`
    },
    {
      id: "04",
      title: "GRAPHSAGE CONVOLUTION",
      subtitle: "Relational Neighborhood Aggregation",
      icon: GitBranch,
      badge: "INDUCTIVE GNN",
      accentBg: "bg-[#4D7CFE]",
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
      id: "05",
      title: "RISK SCORING ENGINE",
      subtitle: "Calibrated Probability Output",
      icon: Zap,
      badge: "INFERENCE < 3.4MS",
      accentBg: "bg-[#FF7A00]",
      description: "Calculates calibrated risk probability score P(Laundering) between 0.000 and 1.000 along with confidence intervals and explainability impacts.",
      inputs: ["GraphSAGE Node Embeddings", "Transaction Risk Classifiers"],
      processing: "Sigmoidal classifier projection with Integrated Gradients for feature attribution breakdown.",
      outputs: ["Calibrated Risk Score (0.0 - 1.0)", "Top-3 Feature Impact Weights"],
      complexity: "AUC-ROC: 0.978 | Precision@K: 0.942",
      codeSnippet: `risk_prob = model.predict_proba(graph_batch)
explanations = integrated_gradients.attribute(model, inputs=graph_batch)`
    },
    {
      id: "06",
      title: "POLICY RULE GATE",
      subtitle: "Compliance Tier Routing",
      icon: ShieldAlert,
      badge: "REGULATORY GATE",
      accentBg: "bg-[#FF3B30]",
      description: "Maps calculated risk score against strict regulatory thresholds: Auto-Pass (<0.40), Human Review (0.40-0.69), SAR Investigation (0.70-0.84), Auto-Block (>=0.85).",
      inputs: ["Calibrated Risk Probability", "Custom Enterprise Policy Rules"],
      processing: "Zero False-Negative Policy Gate mapping scores to automated execution webhooks.",
      outputs: ["Compliance Triage Directive", "Automated Webhook / API Dispatch"],
      complexity: "Zero False-Negative Safety Guardrails",
      codeSnippet: `if risk_score >= 0.85:
    action = ComplianceAction.AUTO_BLOCK
elif risk_score >= 0.70:
    action = ComplianceAction.SAR_INVESTIGATION`
    },
    {
      id: "07",
      title: "SAR GENERATION",
      subtitle: "FIU STR / SAR Document Filing",
      icon: FileText,
      badge: "FIU-IND COMPLIANT",
      accentBg: "bg-[#FF4FA3]",
      description: "Automatically compiles complete audit dossiers containing transaction chains, topological subgraphs, account KYC flags, and legal narrative.",
      inputs: ["Triaged High-Risk Alert", "Sub-Graph Topology Trace", "Account KYC Profiles"],
      processing: "Automated SAR Compiler formats regulatory filing JSON and printable STR dossier conforming to FIU standards.",
      outputs: ["Official SAR Audit Dossier", "Sub-Graph Evidence Snapshot"],
      complexity: "Complete Chain of Custody Audit Trail",
      codeSnippet: `def generate_sar_report(alert: Alert) -> SARDossier:
    return SARDossier(
        ref_id=f"FIU-STR-{uuid4()}",
        topology_nodes=alert.get_subgraph(),
        narrative=generate_llm_compliance_narrative(alert)
    )`
    },
    {
      id: "08",
      title: "MLOPS DRIFT MONITOR",
      subtitle: "Continuous KS & PSI Monitoring",
      icon: Activity,
      badge: "ACTIVE DEFENSE",
      accentBg: "bg-[#8B5CF6]",
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
      {/* Header & Controls Card */}
      <div className="brutal-card-lg bg-[#FFFDF5] p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-[3px] border-[#111111] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#FFD400] border-2 border-[#111111]"></span>
              <h2 className="text-2xl font-black text-[#111111] tracking-tight uppercase">
                8-STAGE AML INTELLIGENCE PIPELINE
              </h2>
            </div>
            <p className="text-xs text-[#5B5B55] font-bold uppercase tracking-wider mt-1">
              FROM RAW TRANSACTION STREAMS TO REGULATORY ACTION
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`brutal-btn px-4 py-2.5 text-xs ${
                isPlaying ? 'bg-[#FF3B30] text-white' : 'bg-[#FFD400]'
              }`}
            >
              {isPlaying ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-1.5 animate-spin" />
                  <span>PAUSE STREAM FLOW</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1.5 fill-current" />
                  <span>AUTO-SIMULATE PIPELINE</span>
                </>
              )}
            </button>

            <button
              onClick={onNavigateToSimulator}
              className="brutal-btn-alt px-4 py-2.5 text-xs flex items-center gap-1.5"
            >
              <Zap className="h-4 w-4 text-[#FF7A00]" />
              <span>OPEN BATCH SIMULATOR →</span>
            </button>
          </div>
        </div>

        {/* 8-Stage Numbered Blocks Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
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
                className={`relative text-left p-3 border-[3px] border-[#111111] rounded-[6px] transition-all flex flex-col justify-between h-36 ${
                  isSelected
                    ? `${stage.accentBg} text-[#111111] shadow-[5px_5px_0_#111111] translate-x-[-2px] translate-y-[-2px]`
                    : 'bg-[#FFFDF5] text-[#111111] hover:bg-[#EAE5D8] shadow-[3px_3px_0_#111111]'
                }`}
              >
                {isCurrentAnim && (
                  <span className="absolute -top-1.5 left-0 right-0 h-1.5 bg-[#FF3B30] border-t-2 border-[#111111] animate-pulse"></span>
                )}

                <div className="flex items-center justify-between w-full">
                  <div className="h-7 w-7 bg-[#111111] text-white rounded-[4px] flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-xs font-black">
                    {stage.id}
                  </span>
                </div>

                <div className="my-1">
                  <h4 className="text-[11px] font-black leading-tight uppercase">
                    {stage.title}
                  </h4>
                  <span className="text-[9px] font-bold text-[#5B5B55] uppercase block mt-0.5">
                    {stage.badge}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-black font-mono">
                  <span>INSPECT</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Specification Deep Dive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input -> Algorithm -> Output (7 Cols) */}
        <div className="lg:col-span-7 brutal-card-lg bg-[#FFFDF5] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#111111] pb-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 ${activeStage.accentBg} border-2 border-[#111111] shadow-[3px_3px_0_#111111] rounded-[5px] flex items-center justify-center`}>
                <activeStage.icon className="h-5 w-5 text-[#111111]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-black text-[#5B5B55] uppercase tracking-wider">
                  STAGE {activeStage.id} // {activeStage.subtitle}
                </span>
                <h3 className="text-lg font-black text-[#111111] uppercase">{activeStage.title}</h3>
              </div>
            </div>

            <span className="brutal-badge bg-[#FFD400] text-[#111111]">
              {activeStage.badge}
            </span>
          </div>

          <p className="text-xs text-[#111111] font-semibold leading-relaxed">
            {activeStage.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Input Streams */}
            <div className="p-3 bg-[#EAE5D8] border-2 border-[#111111] rounded-[5px] space-y-1.5">
              <h5 className="text-[10px] font-black uppercase text-[#111111] flex items-center gap-1">
                <Database className="h-3 w-3 text-[#4D7CFE]" />
                INPUT STREAMS
              </h5>
              <ul className="space-y-1 text-[11px] font-medium text-[#111111]">
                {activeStage.inputs.map((inp, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="font-bold">•</span>
                    <span>{inp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Algorithm & Processing */}
            <div className="p-3 bg-[#EAE5D8] border-2 border-[#111111] rounded-[5px] space-y-1.5">
              <h5 className="text-[10px] font-black uppercase text-[#111111] flex items-center gap-1">
                <Cpu className="h-3 w-3 text-[#00C2D7]" />
                PROCESSING CORE
              </h5>
              <p className="text-[11px] font-medium text-[#111111] leading-relaxed">
                {activeStage.processing}
              </p>
            </div>

            {/* Output Artifacts */}
            <div className="p-3 bg-[#EAE5D8] border-2 border-[#111111] rounded-[5px] space-y-1.5">
              <h5 className="text-[10px] font-black uppercase text-[#111111] flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-[#36C96F]" />
                OUTPUT ARTIFACTS
              </h5>
              <ul className="space-y-1 text-[11px] font-medium text-[#111111]">
                {activeStage.outputs.map((out, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="font-bold text-[#36C96F]">•</span>
                    <span>{out}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#111111] text-[#FFFDF5] border-2 border-[#111111] rounded-[5px] text-xs font-mono">
            <span className="text-[#EAE5D8]">BENCHMARK COMPLEXITY:</span>
            <span className="text-[#FFD400] font-black">{activeStage.complexity}</span>
          </div>
        </div>

        {/* Right Column: Code Implementation Terminal (5 Cols) */}
        <div className="lg:col-span-5 brutal-card-lg bg-[#111111] text-[#FFFDF5] p-6 flex flex-col justify-between border-[3px] border-[#111111] shadow-[8px_8px_0_#111111]">
          <div>
            <div className="flex items-center justify-between border-b-2 border-[#333333] pb-3 mb-3">
              <h4 className="text-xs font-black uppercase font-mono text-[#FFD400] flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                PRODUCTION IMPLEMENTATION
              </h4>
              <span className="text-[10px] font-mono text-[#EAE5D8]">pipeline_core.py</span>
            </div>

            <div className="p-3 bg-[#0A0A0A] border-2 border-[#333333] rounded text-[11px] font-mono text-[#36C96F] overflow-x-auto leading-relaxed">
              <pre>
                <code>{activeStage.codeSnippet}</code>
              </pre>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-[#333333] flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#EAE5D8]">
              STAGE {selectedStage + 1} OF {stages.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={selectedStage === 0}
                onClick={() => setSelectedStage((prev) => Math.max(0, prev - 1))}
                className="brutal-btn-alt px-3 py-1.5 text-xs bg-[#FFFDF5] text-[#111111] disabled:opacity-40"
              >
                PREVIOUS
              </button>
              <button
                disabled={selectedStage === stages.length - 1}
                onClick={() => setSelectedStage((prev) => Math.min(stages.length - 1, prev + 1))}
                className="brutal-btn px-3 py-1.5 text-xs bg-[#FFD400] text-[#111111] disabled:opacity-40"
              >
                NEXT STAGE →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
