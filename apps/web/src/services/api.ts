import axios from 'axios';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5000';
const AI_ENGINE_URL = import.meta.env.VITE_AI_ENGINE_URL || 'http://localhost:8000';

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'offline' | 'checking';
  service: string;
  version?: string;
  uptime?: number;
  timestamp?: string;
  environment?: string;
  details?: Record<string, any>;
  latencyMs?: number;
}

export const apiGatewayClient = axios.create({
  baseURL: API_GATEWAY_URL,
  timeout: 3000,
});

export const aiEngineClient = axios.create({
  baseURL: AI_ENGINE_URL,
  timeout: 3000,
});

export async function checkGatewayHealth(): Promise<ServiceHealth> {
  const start = performance.now();
  try {
    const res = await apiGatewayClient.get('/api/v1/health');
    const latencyMs = Math.round(performance.now() - start);
    return {
      status: res.data.status || 'healthy',
      service: res.data.service || 'api-gateway',
      version: res.data.version,
      uptime: res.data.uptime,
      timestamp: res.data.timestamp,
      environment: res.data.environment,
      details: res.data.dependencies,
      latencyMs,
    };
  } catch (err: any) {
    return {
      status: 'offline',
      service: 'api-gateway',
      details: { error: err.message },
      latencyMs: Math.round(performance.now() - start),
    };
  }
}

export async function checkAIEngineHealth(): Promise<ServiceHealth> {
  const start = performance.now();
  try {
    const res = await aiEngineClient.get('/health');
    const latencyMs = Math.round(performance.now() - start);
    return {
      status: res.data.status || 'healthy',
      service: res.data.service || 'ai-engine',
      version: res.data.version,
      uptime: res.data.uptime,
      timestamp: res.data.timestamp,
      environment: res.data.environment,
      details: res.data.configured_models,
      latencyMs,
    };
  } catch (err: any) {
    return {
      status: 'offline',
      service: 'ai-engine',
      details: { error: err.message },
      latencyMs: Math.round(performance.now() - start),
    };
  }
}
