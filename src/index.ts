import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './api/routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'bokata-agent',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', apiRoutes);

app.get('/', (_req, res) => {
  res.json({
    name: 'Bokata Agent API',
    version: '2.0.0',
    description: 'Vertical Slicing with LangChain + Express',
    endpoints: {
      analyze: { method: 'POST', path: '/api/analyze' },
      analyzeFile: { method: 'POST', path: '/api/analyze/file' },
      jobStatus: { method: 'GET', path: '/api/jobs/:jobId' },
      jobResult: { method: 'GET', path: '/api/jobs/:jobId/result' },
      jobMarkdown: { method: 'GET', path: '/api/jobs/:jobId/markdown' },
      allJobs: { method: 'GET', path: '/api/jobs' },
    },
  });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Bokata Agent API - http://localhost:${PORT}\n`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  WARNING: ANTHROPIC_API_KEY not set\n');
  }
});

export default app;
