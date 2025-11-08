/**
 * Simple example of using Bokata Agent API
 *
 * This example shows how to:
 * 1. Start an analysis job
 * 2. Poll for completion
 * 3. Get the result
 *
 * Run with: npm run dev (in another terminal), then tsx examples/simple-example.ts
 */

const API_BASE = 'http://localhost:3000/api';

interface JobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: {
    currentPhase: string;
    currentFeature?: number;
    totalFeatures?: number;
  };
}

interface JobResult {
  jobId: string;
  status: 'completed' | 'failed';
  result?: {
    projectName: string;
    executiveSummary: {
      totalFeatures: number;
      totalSteps: number;
      totalIncrements: number;
      walkingSkeletonSize: number;
    };
  };
  error?: string;
}

async function analyzeProject(projectInput: string, projectName: string): Promise<string> {
  console.log(`\n🚀 Starting analysis: ${projectName}\n`);

  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectInput,
      projectName,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to start analysis: ${response.statusText}`);
  }

  const data = await response.json();
  return data.jobId;
}

async function pollJobStatus(jobId: string): Promise<JobResult> {
  console.log(`📊 Polling job status: ${jobId}\n`);

  while (true) {
    const response = await fetch(`${API_BASE}/jobs/${jobId}`);
    const status: JobStatus = await response.json();

    console.log(`Status: ${status.status} | Phase: ${status.progress.currentPhase}`);

    if (status.status === 'completed' || status.status === 'failed') {
      console.log('\n✅ Job completed!\n');

      const resultResponse = await fetch(`${API_BASE}/jobs/${jobId}/result`);
      return await resultResponse.json();
    }

    // Wait 2 seconds before polling again
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

async function main() {
  try {
    // Example project description
    const projectInput = `
Build a simple blogging platform for writers.

Users should be able to:
- Create blog posts with title and content
- Publish posts to make them public
- View published posts in a feed
- Edit and delete their own posts

Tech stack: Next.js + Supabase
Timeline: 4 weeks to MVP
Priority: Speed to market, need early validation
    `.trim();

    // Start analysis
    const jobId = await analyzeProject(projectInput, 'Simple Blog Platform');

    // Poll for completion
    const result = await pollJobStatus(jobId);

    // Display results
    if (result.status === 'completed' && result.result) {
      console.log('📋 Analysis Results:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Project: ${result.result.projectName}`);
      console.log(`Features: ${result.result.executiveSummary.totalFeatures}`);
      console.log(`Steps: ${result.result.executiveSummary.totalSteps}`);
      console.log(`Increments: ${result.result.executiveSummary.totalIncrements}`);
      console.log(`Walking Skeleton: ${result.result.executiveSummary.walkingSkeletonSize} increments`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      console.log(`💾 Download full result:`);
      console.log(`   JSON: ${API_BASE}/jobs/${jobId}/result`);
      console.log(`   Markdown: ${API_BASE}/jobs/${jobId}/markdown\n`);
    } else {
      console.error('❌ Analysis failed:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the example
main();
