/**
 * Basic usage example for Bokata Agent
 */

import { createBokataAPI, FeatureInput } from '../src';

async function main() {
  // Create API instance (uses .env configuration)
  const api = createBokataAPI();

  // Define a feature to analyze
  const feature: FeatureInput = {
    name: 'User Resets Password',
    description: 'Users should be able to reset their password if they forget it. The system should send a reset link via email, validate the token, and allow the user to set a new password.',
    context: 'This is for a web application with user authentication',
    technicalStack: ['React', 'Node.js', 'PostgreSQL', 'Email service'],
    constraints: ['Must be secure', 'Token should expire after 24 hours']
  };

  console.log('Analyzing feature:', feature.name);
  console.log('---');

  // Analyze the feature
  const analysis = await api.analyzeFeature(feature);

  console.log('\nExecutive Summary:');
  console.log(analysis.executiveSummary);

  console.log('\n\nWalking Skeleton:');
  console.log(`Name: ${analysis.walkingSkeleton.name}`);
  console.log(`Description: ${analysis.walkingSkeleton.description}`);
  console.log(`Total Estimate: ${analysis.walkingSkeleton.totalEstimate} story points`);
  console.log('\nIncrements:');
  analysis.walkingSkeleton.increments.forEach((inc, i) => {
    console.log(`  ${i + 1}. ${inc.name} (${inc.estimatedStoryPoints} points)`);
    console.log(`     ${inc.description}`);
  });

  console.log('\n\nAll Increments:');
  analysis.allIncrements.forEach((inc, i) => {
    console.log(`\n${i + 1}. ${inc.name} (${inc.estimatedStoryPoints} points)`);
    console.log(`   ID: ${inc.id}`);
    console.log(`   Description: ${inc.description}`);
    console.log(`   User Value: ${inc.userValue}`);
    console.log(`   Strategy: ${inc.strategy}`);
    console.log(`   Requires: ${inc.dependencies.requires.join(', ') || 'None'}`);
    console.log(`   Provides: ${inc.dependencies.provides.join(', ') || 'None'}`);
  });
}

main().catch(console.error);
