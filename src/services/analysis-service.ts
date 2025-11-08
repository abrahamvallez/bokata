import { runBokataAnalysis } from '../graph/simple-orchestrator.js';
import { jobManager } from './job-manager.js';

/**
 * Service for running Bokata analysis asynchronously
 */
export class AnalysisService {
  /**
   * Start a new analysis job
   */
  async startAnalysis(projectInput: string, projectName?: string): Promise<string> {
    const jobId = jobManager.createJob();

    // Run analysis asynchronously
    this.runAnalysis(jobId, projectInput, projectName || 'Untitled Project').catch((error) => {
      console.error(`Job ${jobId} failed:`, error);
      jobManager.failJob(jobId, error.message);
    });

    return jobId;
  }

  /**
   * Run the analysis workflow
   */
  private async runAnalysis(jobId: string, projectInput: string, projectName: string): Promise<void> {
    try {
      jobManager.updateProgress(jobId, 'Initializing analysis');

      console.log(`\n🚀 Starting analysis for job ${jobId}: ${projectName}\n`);

      const result = await runBokataAnalysis(projectInput, projectName);

      jobManager.completeJob(jobId, result);
      console.log(`\n✅ Job ${jobId} completed successfully\n`);
    } catch (error: any) {
      jobManager.failJob(jobId, error.message);
      console.error(`\n❌ Job ${jobId} failed with error:`, error);
      throw error;
    }
  }
}

// Singleton instance
export const analysisService = new AnalysisService();
