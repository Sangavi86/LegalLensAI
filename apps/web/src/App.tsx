import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Server,
  Cpu,
  RefreshCw,
  Scale,
  FileText,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen
} from 'lucide-react';
import { checkGatewayHealth, checkAIEngineHealth, ServiceHealth } from './services/api.js';

export default function App() {
  const [gatewayHealth, setGatewayHealth] = useState<ServiceHealth>({
    status: 'checking',
    service: 'api-gateway',
  });
  const [aiEngineHealth, setAiEngineHealth] = useState<ServiceHealth>({
    status: 'checking',
    service: 'ai-engine',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');

  const fetchHealth = async () => {
    setIsRefreshing(true);
    const [gw, ai] = await Promise.all([checkGatewayHealth(), checkAIEngineHealth()]);
    setGatewayHealth(gw);
    setAiEngineHealth(ai);
    setLastChecked(new Date().toLocaleTimeString());
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const agents = [
    { id: 1, name: 'Document Understanding', status: 'Phase 2 Target', role: 'PyMuPDF + Tesseract 5 OCR + AST' },
    { id: 2, name: 'Legal Research', status: 'Phase 2 Target', role: 'Hybrid GraphRAG (India Code + DigiSCR)' },
    { id: 3, name: 'Legal Risk Assessment', status: 'Phase 2 Target', role: 'Structured ML + TreeSHAP + IRAC' },
    { id: 4, name: 'Evidence Verification', status: 'Phase 2 Target', role: 'Calibrated NLI + Treatment Check' },
    { id: 5, name: 'Scenario Simulation', status: 'Phase 3 Target', role: 'Counterfactual Permutations' },
    { id: 6, name: 'Legal Report Generation', status: 'Phase 3 Target', role: 'IRAC Memorandum & Redline Markup' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                LegalLens <span className="text-amber-400">AI</span>
              </span>
              <span className="text-xs text-slate-400 block -mt-1 font-mono">
                Jurisdiction: Republic of India (IN)
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Phase 1: Engineering Foundation
            </span>
            <button
              onClick={fetchHealth}
              disabled={isRefreshing}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Welcome Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Enterprise Multi-Agent Legal Intelligence Platform
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Phase 1 Engineering Foundation active. Dual microservices (Node.js Express Gateway &amp; Python FastAPI AI Engine) initialized with shared schema validation and model abstraction.
              </p>
            </div>
            <div className="flex items-center text-xs text-slate-400 space-x-2 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800/80">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Last checked: {lastChecked || 'Initializing...'}</span>
            </div>
          </div>
        </div>

        {/* Dual-Service Live Health Monitor */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-amber-400" />
            Core Services Telemetry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Express API Gateway Card */}
            <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Express API Gateway</h3>
                      <p className="text-xs text-slate-400 font-mono">Port 5000 | Node.js 24 LTS</p>
                    </div>
                  </div>
                  <div>
                    {gatewayHealth.status === 'healthy' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Online ({gatewayHealth.latencyMs}ms)
                      </span>
                    ) : gatewayHealth.status === 'checking' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Checking...
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Offline
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service:</span>
                    <span>{gatewayHealth.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Uptime:</span>
                    <span>{gatewayHealth.uptime !== undefined ? `${gatewayHealth.uptime}s` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Environment:</span>
                    <span>{gatewayHealth.environment || 'development'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Route:</span>
                    <span>GET /api/v1/health</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>TypeScript Strict Mode Active</span>
                <span className="text-emerald-400 font-medium">Zod Validated</span>
              </div>
            </div>

            {/* FastAPI AI Engine Card */}
            <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">FastAPI AI Intelligence Engine</h3>
                      <p className="text-xs text-slate-400 font-mono">Port 8000 | Python 3.12</p>
                    </div>
                  </div>
                  <div>
                    {aiEngineHealth.status === 'healthy' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Online ({aiEngineHealth.latencyMs}ms)
                      </span>
                    ) : aiEngineHealth.status === 'checking' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Checking...
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Offline
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service:</span>
                    <span>{aiEngineHealth.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Provider:</span>
                    <span>{aiEngineHealth.environment ? 'Configurable (Gemini / Mock)' : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Uptime:</span>
                    <span>{aiEngineHealth.uptime !== undefined ? `${aiEngineHealth.uptime}s` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Route:</span>
                    <span>GET /health &amp; GET /api/v1/health</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Model Abstraction Active</span>
                <span className="text-purple-400 font-medium">Pydantic v2 Contract</span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Agent Swarm Readiness (Phase 2 Preview) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-amber-400" />
              6-Agent Cognitive Architecture (Phase 2 Readiness)
            </h2>
            <span className="text-xs text-slate-500">Orchestrator: LangGraph Cyclical State Machine</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Agent {agent.id}
                  </span>
                  <span className="text-xs text-amber-400 font-medium">
                    {agent.status}
                  </span>
                </div>
                <h4 className="font-semibold text-white text-sm">{agent.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{agent.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Documentation & Knowledge Base Quick Access */}
        <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center">
            <BookOpen className="w-4 h-4 mr-2 text-amber-400" />
            Approved Architecture Specifications
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-slate-300">
              <span className="font-semibold block text-white">ARCHITECTURE.md</span>
              <span className="text-slate-500">3-Tier System Design</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-slate-300">
              <span className="font-semibold block text-white">AI_AGENT_DESIGN.md</span>
              <span className="text-slate-500">LangGraph State Machine</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-slate-300">
              <span className="font-semibold block text-white">DATABASE_DESIGN.md</span>
              <span className="text-slate-500">MongoDB + Neo4j Graph</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-slate-300">
              <span className="font-semibold block text-white">SECURITY_DESIGN.md</span>
              <span className="text-slate-500">DPDP 2023 &amp; Chained Audit</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        LegalLens AI &copy; 2026. Designed for the Republic of India jurisdiction. Research-grade legal intelligence platform.
      </footer>
    </div>
  );
}
