/**
 * Project analysis example with multiple features
 */

import { createBokataAPI, ProjectInput } from '../src';

async function main() {
  const api = createBokataAPI();

  const project: ProjectInput = {
    name: 'Coaching Platform MVP',
    description: 'A platform connecting coaches with clients, supporting audio sessions, scheduling, and payments',
    technicalStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'S3'],
    features: [
      {
        name: 'User Registers Account',
        description: 'Users can create an account with email and password'
      },
      {
        name: 'Coach Records Audio',
        description: 'Coaches can record and save audio sessions'
      },
      {
        name: 'Client Books Session',
        description: 'Clients can book coaching sessions with available coaches'
      },
      {
        name: 'User Makes Payment',
        description: 'Users can pay for coaching sessions via credit card'
      }
    ]
  };

  console.log('Analyzing project:', project.name);
  console.log('Features:', project.features.length);
  console.log('='.repeat(60));

  const analysis = await api.analyzeProject(project);

  // Executive summary
  console.log('\nEXECUTIVE SUMMARY');
  console.log('-'.repeat(60));
  console.log(analysis.executiveSummary);

  // Multi-functional walking skeleton
  console.log('\n\nMULTI-FUNCTIONAL WALKING SKELETON');
  console.log('-'.repeat(60));
  console.log(`Name: ${analysis.multiFunctionalWalkingSkeleton.name}`);
  console.log(`Description: ${analysis.multiFunctionalWalkingSkeleton.description}`);
  console.log(`Estimated: ${analysis.multiFunctionalWalkingSkeleton.totalEstimate} points`);
  console.log('\nIncrements:');
  analysis.multiFunctionalWalkingSkeleton.increments.forEach((inc, i) => {
    console.log(`  ${i + 1}. ${inc.name} (${inc.estimatedStoryPoints} points)`);
  });

  // Cross-feature dependencies
  console.log('\n\nCROSS-FEATURE DEPENDENCIES');
  console.log('-'.repeat(60));
  Object.entries(analysis.crossFeatureDependencies).forEach(([feature, deps]) => {
    console.log(`\n${feature}:`);
    deps.forEach(dep => console.log(`  - Depends on: ${dep}`));
  });

  // Recommended implementation order
  console.log('\n\nRECOMMENDED IMPLEMENTATION ORDER');
  console.log('-'.repeat(60));
  analysis.recommendedImplementationOrder.forEach((feature, i) => {
    console.log(`${i + 1}. ${feature}`);
  });

  // Feature summaries
  console.log('\n\nFEATURE DETAILS');
  console.log('-'.repeat(60));
  analysis.featureAnalyses.forEach(fa => {
    console.log(`\n${fa.feature.name}:`);
    console.log(`  - Total increments: ${fa.allIncrements.length}`);
    console.log(`  - Walking skeleton: ${fa.walkingSkeleton.increments.length} increments`);
    console.log(`  - Total estimate: ${fa.allIncrements.reduce((sum, inc) => sum + inc.estimatedStoryPoints, 0)} points`);
  });

  console.log('\n\n' + '='.repeat(60));
  console.log('Project analysis completed!');
}

main().catch(console.error);
