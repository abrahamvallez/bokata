import express from 'express';
import multer from 'multer';
import { readFileSync } from 'fs';
import { analysisService } from '../services/analysis-service.js';
import { jobManager } from '../services/job-manager.js';
import type { AnalyzeRequest } from '../types/index.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/markdown' || file.originalname.endsWith('.md')) {
      cb(null, true);
    } else {
      cb(new Error('Only .md files are allowed'));
    }
  },
});

/**
 * POST /api/analyze
 * Start a new analysis job with text input
 *
 * Body:
 * {
 *   "projectInput": "Your project description...",
 *   "projectName": "Optional project name"
 * }
 *
 * Returns:
 * {
 *   "jobId": "uuid",
 *   "message": "Analysis started"
 * }
 */
router.post('/analyze', async (req, res) => {
  try {
    const { projectInput, projectName }: AnalyzeRequest = req.body;

    if (!projectInput) {
      return res.status(400).json({
        error: 'projectInput is required',
      });
    }

    const jobId = await analysisService.startAnalysis(projectInput, projectName);

    res.json({
      jobId,
      message: 'Analysis started successfully',
    });
  } catch (error: any) {
    console.error('Error starting analysis:', error);
    res.status(500).json({
      error: error.message || 'Failed to start analysis',
    });
  }
});

/**
 * POST /api/analyze/file
 * Start a new analysis job with .md file upload
 *
 * Form data:
 * - file: .md file
 * - projectName: Optional project name
 *
 * Returns:
 * {
 *   "jobId": "uuid",
 *   "message": "Analysis started"
 * }
 */
router.post('/analyze/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'File is required',
      });
    }

    // Read the uploaded file
    const projectInput = readFileSync(req.file.path, 'utf-8');
    const projectName = req.body.projectName || req.file.originalname.replace('.md', '');

    const jobId = await analysisService.startAnalysis(projectInput, projectName);

    res.json({
      jobId,
      message: 'Analysis started successfully',
      fileName: req.file.originalname,
    });
  } catch (error: any) {
    console.error('Error starting analysis from file:', error);
    res.status(500).json({
      error: error.message || 'Failed to start analysis',
    });
  }
});

/**
 * GET /api/jobs/:jobId
 * Get the status of an analysis job
 *
 * Returns:
 * {
 *   "jobId": "uuid",
 *   "status": "pending" | "processing" | "completed" | "failed",
 *   "progress": {
 *     "currentPhase": "...",
 *     "currentFeature": 1,
 *     "totalFeatures": 3
 *   },
 *   "startedAt": "ISO date",
 *   "completedAt": "ISO date" (if completed)
 * }
 */
router.get('/jobs/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;

    const status = jobManager.getJobStatus(jobId);

    if (!status) {
      return res.status(404).json({
        error: `Job ${jobId} not found`,
      });
    }

    res.json(status);
  } catch (error: any) {
    console.error('Error getting job status:', error);
    res.status(500).json({
      error: error.message || 'Failed to get job status',
    });
  }
});

/**
 * GET /api/jobs/:jobId/result
 * Get the result of a completed analysis job (JSON format)
 *
 * Returns:
 * {
 *   "jobId": "uuid",
 *   "status": "completed",
 *   "result": { ... analysis result ... }
 * }
 */
router.get('/jobs/:jobId/result', (req, res) => {
  try {
    const { jobId } = req.params;

    const result = jobManager.getJobResult(jobId);

    res.json(result);
  } catch (error: any) {
    console.error('Error getting job result:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }

    if (error.message.includes('not yet completed')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({
      error: error.message || 'Failed to get job result',
    });
  }
});

/**
 * GET /api/jobs/:jobId/markdown
 * Get the result as markdown document
 *
 * Returns: Markdown string
 */
router.get('/jobs/:jobId/markdown', (req, res) => {
  try {
    const { jobId } = req.params;

    const jobResult = jobManager.getJobResult(jobId);

    if (!jobResult.result) {
      return res.status(404).json({
        error: 'Result not found',
      });
    }

    const markdown = convertToMarkdown(jobResult.result);

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${jobResult.result.projectName}-analysis.md"`);
    res.send(markdown);
  } catch (error: any) {
    console.error('Error converting to markdown:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }

    if (error.message.includes('not yet completed')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({
      error: error.message || 'Failed to convert to markdown',
    });
  }
});

/**
 * GET /api/jobs
 * Get all jobs
 */
router.get('/jobs', (_req, res) => {
  try {
    const jobs = jobManager.getAllJobs();
    res.json(jobs);
  } catch (error: any) {
    console.error('Error getting all jobs:', error);
    res.status(500).json({
      error: error.message || 'Failed to get jobs',
    });
  }
});

/**
 * Convert AnalysisResult to Markdown
 */
function convertToMarkdown(result: any): string {
  const { projectName, analysisDate, executiveSummary, features, walkingSkeleton } = result;

  let md = `# Vertical Slicing Analysis: ${projectName}\n\n`;

  // Executive Summary
  md += `## 1. Executive Summary\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| **Project Type** | ${executiveSummary.projectType} |\n`;
  md += `| **Total Features** | ${executiveSummary.totalFeatures} |\n`;
  md += `| **Total Steps** | ${executiveSummary.totalSteps} |\n`;
  md += `| **Total Increments Generated** | ${executiveSummary.totalIncrements} |\n`;
  md += `| **Walking Skeleton Size** | ${executiveSummary.walkingSkeletonSize} |\n`;
  md += `| **Analysis Date** | ${new Date(analysisDate).toLocaleDateString()} |\n\n`;
  md += `---\n\n`;

  // Feature Backbone Overview
  md += `## 2. Feature Backbone Overview\n\n`;
  md += `| # | Feature | User Value | Dependencies |\n`;
  md += `|---|---------|------------|--------------||\n`;

  features.forEach((feature: any, idx: number) => {
    const deps = feature.dependencies.length > 0 ? feature.dependencies.join(', ') : 'None';
    md += `| ${idx + 1} | **${feature.name}** | ${feature.userValue} | ${deps} |\n`;
  });

  md += `\n**Note:** Features follow Actor+Action naming convention\n\n`;
  md += `---\n\n`;

  // Feature Breakdown
  md += `## 3. Feature Breakdown - Complete Analysis\n\n`;

  features.forEach((feature: any) => {
    md += `### Feature ${feature.id}: ${feature.name}\n\n`;
    md += `**User Value:** ${feature.userValue}\n\n`;

    feature.steps.forEach((step: any) => {
      md += `#### Step ${step.id}: ${step.name}\n\n`;
      md += `**Purpose:** ${step.purpose || step.description}\n\n`;
      md += `**Increments:**\n\n`;
      md += `| # | Name | Requires | Provides | Compatible With | Notes |\n`;
      md += `|---|------|----------|----------|-----------------|-------|\n`;

      step.increments.forEach((inc: any) => {
        const marker = inc.isSimplest ? ' ⭐' : '';
        md += `| ${inc.id} | ${inc.name} | ${inc.requires} | ${inc.provides} | ${inc.compatibleWith} | ${inc.description}${marker} |\n`;
      });

      md += `\n`;
    });

    md += `---\n\n`;
  });

  // Walking Skeleton
  md += `## 4. Walking Skeleton\n\n`;
  md += `**Purpose:** Minimum viable implementation that demonstrates end-to-end functionality.\n\n`;
  md += `**Philosophy:** This represents what you could ship if the deadline was tomorrow.\n\n`;
  md += `**Composition:**\n\n`;
  md += `| Feature | Step | Increment | Requires | Provides |\n`;
  md += `|---------|------|-----------|----------|----------|\n`;

  walkingSkeleton.selectedIncrements.forEach((inc: any) => {
    md += `| ${inc.featureName} | ${inc.stepName} | ⭐ ${inc.incrementName} | ${inc.requires} | ${inc.provides} |\n`;
  });

  md += `\n**Dependency Analysis:**\n`;
  md += `- ${walkingSkeleton.dependencyAnalysis.allRequiresSatisfied ? '✅' : '❌'} All REQUIRES are satisfied\n`;
  md += `- ${walkingSkeleton.dependencyAnalysis.allCompatible ? '✅' : '❌'} All increments are mutually compatible\n`;
  md += `- ${walkingSkeleton.dependencyAnalysis.noCircularDependencies ? '✅' : '❌'} No circular dependencies\n\n`;

  md += `**What You Get:**\n`;
  walkingSkeleton.observableOutcomes.forEach((outcome: string, idx: number) => {
    md += `${idx + 1}. ${outcome}\n`;
  });

  md += `\n**Capabilities Enabled:**\n`;
  walkingSkeleton.capabilitiesEnabled.forEach((cap: string) => {
    md += `- ${cap}\n`;
  });

  md += `\n---\n`;

  return md;
}

export default router;
