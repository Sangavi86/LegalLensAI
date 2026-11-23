import { Router, Request, Response } from 'express';
import axios from 'axios';
import { config } from '../config/index.js';

const router = Router();
const startTime = Date.now();

router.get('/health', async (req: Request, res: Response) => {
  const uptimeSeconds = (Date.now() - startTime) / 1000;

  let aiEngineStatus: 'healthy' | 'unreachable' | 'unknown' = 'unknown';
  let aiEngineDetails: Record<string, unknown> | null = null;

  try {
    const aiRes = await axios.get(`${config.AI_ENGINE_URL}/health`, { timeout: 1500 });
    if (aiRes.status === 200) {
      aiEngineStatus = 'healthy';
      aiEngineDetails = aiRes.data;
    }
  } catch {
    aiEngineStatus = 'unreachable';
  }

  res.status(200).json({
    status: 'healthy',
    service: 'api-gateway',
    version: '1.0.0',
    uptime: Math.round(uptimeSeconds * 100) / 100,
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    dependencies: {
      aiEngine: {
        status: aiEngineStatus,
        url: config.AI_ENGINE_URL,
        details: aiEngineDetails,
      },
      nodeVersion: process.version,
    },
  });
});

export default router;
