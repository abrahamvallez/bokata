/**
 * Complete workflow example: Feature analysis + Paths + Matrix
 */

import { createBokataAPI, FeatureInput } from '../src';

async function main() {
  const api = createBokataAPI();

  const feature: FeatureInput = {
    name: 'Coach Records Audio',
    description: 'Coaches should be able to record audio sessions with their clients, store them securely, and play them back later. The system should support recording, pausing, stopping, and playback.',
    technicalStack: ['React Native', 'Node.js', 'S3', 'WebRTC'],
    constraints: ['Audio quality must be good', 'Storage costs should be minimized']
  };

  console.log('Running complete workflow for:', feature.name);
  console.log('='.repeat(60));

  // Run complete workflow
  const result = await api.runCompleteWorkflow(feature);

  // Display analysis
  console.log('\n1. FEATURE ANALYSIS');
  console.log('-'.repeat(60));
  console.log(result.analysis.executiveSummary);

  console.log('\n\nWalking Skeleton:');
  result.analysis.walkingSkeleton.increments.forEach((inc, i) => {
    console.log(`  ${i + 1}. ${inc.name}`);
  });

  console.log(`\nTotal increments: ${result.analysis.allIncrements.length}`);

  // Display implementation paths
  console.log('\n\n2. IMPLEMENTATION PATHS');
  console.log('-'.repeat(60));
  result.paths.forEach((path, i) => {
    console.log(`\n${i + 1}. ${path.name}`);
    console.log(`   ${path.description}`);
    console.log(`   Timeline: ${path.estimatedWeeks} weeks (${path.estimatedStoryPoints} points)`);
    console.log(`   Benefits:`);
    path.benefits.forEach(b => console.log(`     - ${b}`));
    console.log(`   Risks:`);
    path.risks.forEach(r => console.log(`     - ${r}`));
    console.log(`   Increments: ${path.increments.join(' → ')}`);
  });

  // Display compatibility matrix
  console.log('\n\n3. COMPATIBILITY MATRIX');
  console.log('-'.repeat(60));
  console.log(`Increments: ${result.matrix.increments.length}`);
  console.log('\nSample compatibility relationships:');

  const sampleIncrements = result.matrix.increments.slice(0, 3);
  sampleIncrements.forEach(inc => {
    console.log(`\n${inc}:`);
    const compat = result.matrix.matrix[inc];
    if (compat) {
      Object.entries(compat).slice(0, 3).forEach(([other, status]) => {
        console.log(`  - ${other}: ${status}`);
      });
    }
  });

  console.log('\n\n' + '='.repeat(60));
  console.log('Workflow completed successfully!');
}

main().catch(console.error);
