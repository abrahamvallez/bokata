/**
 * Example: How to integrate Bokata Agent with a web application
 *
 * This shows how to create an Express.js API endpoint that uses Bokata Agent
 */

import express from 'express';
import { createBokataAPI, FeatureInput, ProjectInput } from '../src';

// NOTE: This is a conceptual example. You'll need to install express:
// npm install express @types/express

const app = express();
app.use(express.json());

// Create Bokata API instance
const bokataAPI = createBokataAPI();

/**
 * POST /api/analyze/feature
 * Analyze a single feature
 */
app.post('/api/analyze/feature', async (req, res) => {
  try {
    const feature: FeatureInput = req.body;

    // Validate input
    if (!feature.name || !feature.description) {
      return res.status(400).json({
        error: 'Feature name and description are required'
      });
    }

    // Analyze feature
    const analysis = await bokataAPI.analyzeFeature(feature);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Feature analysis failed:', error);
    res.status(500).json({
      error: 'Feature analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/analyze/project
 * Analyze a project with multiple features
 */
app.post('/api/analyze/project', async (req, res) => {
  try {
    const project: ProjectInput = req.body;

    if (!project.name || !project.features || project.features.length === 0) {
      return res.status(400).json({
        error: 'Project name and at least one feature are required'
      });
    }

    const analysis = await bokataAPI.analyzeProject(project);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Project analysis failed:', error);
    res.status(500).json({
      error: 'Project analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/workflow/complete
 * Run complete workflow for a feature
 */
app.post('/api/workflow/complete', async (req, res) => {
  try {
    const feature: FeatureInput = req.body;

    if (!feature.name || !feature.description) {
      return res.status(400).json({
        error: 'Feature name and description are required'
      });
    }

    const result = await bokataAPI.runCompleteWorkflow(feature);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Workflow failed:', error);
    res.status(500).json({
      error: 'Workflow failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'bokata-agent',
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Bokata Agent API running on port ${PORT}`);
  console.log(`
Available endpoints:
  POST /api/analyze/feature     - Analyze a single feature
  POST /api/analyze/project     - Analyze a project with multiple features
  POST /api/workflow/complete   - Run complete workflow
  GET  /api/health             - Health check
  `);
});

export default app;
