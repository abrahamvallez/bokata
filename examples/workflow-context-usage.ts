import { createBokataAPI } from '../src/api';
import { ContextManager } from '../src/utils/context-manager';
import { OutputFormat } from '../src/types';

/**
 * Example: Using Workflow Context
 *
 * Demonstrates how to use workflow context to:
 * - Track agent execution
 * - Share data between agents
 * - Debug workflows
 * - Export context for persistence
 */

async function workflowContextExample() {
  console.log('=== Workflow Context Example ===\n');

  // Create API with JSON output format
  const api = createBokataAPI({
    outputFormat: OutputFormat.JSON
  });

  // Example feature input
  const featureInput = {
    name: 'User Resets Password',
    description: 'Users can reset their password via email link',
    context: 'Security-critical feature for SaaS application',
    technicalStack: ['React', 'Node.js', 'PostgreSQL', 'SendGrid'],
    constraints: ['Must comply with GDPR', 'Token expires in 1 hour']
  };

  try {
    console.log('Running complete workflow...\n');

    // Run complete workflow which internally uses ContextManager
    const result = await api.orchestrator.runCompleteWorkflow(featureInput);

    // Access the workflow context
    if (result.context) {
      console.log('=== Workflow Context ===');
      console.log(`Workflow ID: ${result.context.workflowId}`);
      console.log(`Workflow Type: ${result.context.workflowType}`);
      console.log(`Current Phase: ${result.context.currentPhase}`);
      console.log(`Agents Executed: ${result.context.agentResults.length}\n`);

      // Show agent execution details
      console.log('=== Agent Execution Results ===');
      result.context.agentResults.forEach((agentResult, index) => {
        console.log(`\n${index + 1}. ${agentResult.agentName}`);
        console.log(`   Type: ${agentResult.agentType}`);
        console.log(`   Success: ${agentResult.success}`);
        console.log(`   Duration: ${agentResult.durationMs}ms`);
        console.log(`   Start: ${agentResult.startTime.toISOString()}`);
        console.log(`   End: ${agentResult.endTime.toISOString()}`);

        if (agentResult.error) {
          console.log(`   Error: ${agentResult.error}`);
        }
      });

      // Show shared data
      console.log('\n=== Shared Data ===');
      console.log(JSON.stringify(result.context.sharedData, null, 2));

      // Export context for debugging/persistence
      console.log('\n=== Context Export ===');
      const contextExport = api.orchestrator.exportWorkflowContext(result.context);
      console.log('Context exported to JSON (first 500 chars):');
      console.log(contextExport.substring(0, 500) + '...\n');
    }

    // Show final results
    console.log('\n=== Final Results ===');
    console.log(`Analysis: ${result.analysis ? 'Generated' : 'N/A'}`);
    console.log(`Paths: ${result.paths ? result.paths.length + ' paths' : 'N/A'}`);
    console.log(`Matrix: ${result.matrix ? 'Generated' : 'N/A'}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example: Manual Context Manager Usage
 *
 * Shows how to use ContextManager directly for custom workflows
 */
async function manualContextExample() {
  console.log('\n\n=== Manual Context Manager Example ===\n');

  // Create a context manager
  const contextManager = new ContextManager('feature', {
    name: 'User Login',
    description: 'User authentication feature'
  }, {
    author: 'Development Team',
    project: 'SaaS Platform'
  });

  console.log('Created workflow context:');
  console.log(`- Workflow ID: ${contextManager.getContext().workflowId}`);
  console.log(`- Workflow Type: ${contextManager.getContext().workflowType}\n`);

  // Simulate agent execution
  contextManager.setPhase('analysis');

  // Execute mock agent 1
  await contextManager.executeAgent(
    'AnalyzerAgent',
    'analyzer',
    { input: 'feature data' },
    async () => {
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100));
      return { result: 'analysis complete', increments: 10 };
    }
  );

  console.log('Agent 1 executed');

  // Share data between agents
  contextManager.setSharedData('incrementCount', 10);
  contextManager.setSharedData('complexity', 'medium');

  // Execute mock agent 2
  contextManager.setPhase('generation');
  await contextManager.executeAgent(
    'PathGeneratorAgent',
    'generator',
    { incrementCount: contextManager.getSharedData('incrementCount') },
    async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return { paths: ['path1', 'path2', 'path3'] };
    }
  );

  console.log('Agent 2 executed');

  // Get summary
  const summary = contextManager.getSummary();
  console.log('\n=== Workflow Summary ===');
  console.log(JSON.stringify(summary, null, 2));

  // Get last agent result
  const lastResult = contextManager.getLastAgentResult();
  console.log('\n=== Last Agent Result ===');
  console.log(`Agent: ${lastResult?.agentName}`);
  console.log(`Output: ${JSON.stringify(lastResult?.output)}`);

  // Export context as JSON
  console.log('\n=== Context Export ===');
  const exported = contextManager.export();
  console.log('Full context exported successfully');
  console.log(`Size: ${exported.length} characters\n`);
}

// Run examples
async function main() {
  console.log('Starting Workflow Context Examples...\n');
  console.log('This demonstrates how agents can share context and data\n');
  console.log('=' .repeat(60) + '\n');

  // Comment out the first example if you don't have API key configured
  // await workflowContextExample();

  // This example doesn't need API key
  await manualContextExample();

  console.log('\n' + '='.repeat(60));
  console.log('Examples completed!');
  console.log('\nKey Benefits of Workflow Context:');
  console.log('1. ✅ Track execution flow and timing');
  console.log('2. ✅ Share data between agents');
  console.log('3. ✅ Debug complex workflows');
  console.log('4. ✅ Export/import for persistence');
  console.log('5. ✅ Better error handling and recovery');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { workflowContextExample, manualContextExample };
