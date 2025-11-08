import { v4 as uuidv4 } from 'uuid';
import type { JobStatus, JobResult, AnalysisResult } from '../types/index.js';

/**
 * In-memory job manager for tracking analysis jobs
 * In production, this should be replaced with a proper database
 */
class JobManager {
  private jobs = new Map<string, JobStatus>();
  private results = new Map<string, AnalysisResult>();

  /**
   * Create a new job
   */
  createJob(): string {
    const jobId = uuidv4();

    const status: JobStatus = {
      jobId,
      status: 'pending',
      progress: {
        currentPhase: 'Initializing',
      },
      startedAt: new Date(),
    };

    this.jobs.set(jobId, status);

    return jobId;
  }

  /**
   * Update job status
   */
  updateJobStatus(jobId: string, updates: Partial<JobStatus>): void {
    const job = this.jobs.get(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    this.jobs.set(jobId, {
      ...job,
      ...updates,
    });
  }

  /**
   * Update job progress
   */
  updateProgress(
    jobId: string,
    phase: string,
    details?: {
      currentFeature?: number;
      totalFeatures?: number;
      currentStep?: number;
      totalSteps?: number;
    }
  ): void {
    const job = this.jobs.get(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    this.jobs.set(jobId, {
      ...job,
      status: 'processing',
      progress: {
        currentPhase: phase,
        ...details,
      },
    });
  }

  /**
   * Mark job as completed
   */
  completeJob(jobId: string, result: AnalysisResult): void {
    const job = this.jobs.get(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    this.jobs.set(jobId, {
      ...job,
      status: 'completed',
      completedAt: new Date(),
    });

    this.results.set(jobId, result);
  }

  /**
   * Mark job as failed
   */
  failJob(jobId: string, error: string): void {
    const job = this.jobs.get(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    this.jobs.set(jobId, {
      ...job,
      status: 'failed',
      error,
      completedAt: new Date(),
    });
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): JobStatus | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get job result
   */
  getJobResult(jobId: string): JobResult {
    const job = this.jobs.get(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status === 'completed') {
      return {
        jobId,
        status: 'completed',
        result: this.results.get(jobId),
      };
    } else if (job.status === 'failed') {
      return {
        jobId,
        status: 'failed',
        error: job.error,
      };
    } else {
      throw new Error(`Job ${jobId} is not yet completed (status: ${job.status})`);
    }
  }

  /**
   * Get all jobs
   */
  getAllJobs(): JobStatus[] {
    return Array.from(this.jobs.values());
  }
}

// Singleton instance
export const jobManager = new JobManager();
