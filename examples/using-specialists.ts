/**
 * Example: Using Specialist Agents Directly
 * This shows how to call individual specialist agents
 */

import { createBokataCommands } from '../src';

async function main() {
  const commands = createBokataCommands();

  console.log('='.repeat(60));
  console.log('Specialist Agents Example');
  console.log('='.repeat(60));

  // Example 1: Call step-analyzer-specialist directly
  console.log('\nExample 1: Using step-analyzer-specialist\n');

  const featureForSteps = `
Feature: Product Search

Users need to search for products using keywords and filters (category, price range, rating).
The system should return relevant results quickly and allow sorting.

Context: E-commerce platform, 10,000+ products, React + Node.js + Elasticsearch
`;

  const stepsResult = await commands.executeSpecialist(
    'step-analyzer-specialist',
    featureForSteps
  );

  console.log('Steps Analysis Result:');
  console.log('Prompt Used:', stepsResult.promptUsed);
  console.log('\nOutput Preview (first 400 chars):');
  console.log(stepsResult.rawOutput.substring(0, 400) + '...\n');

  // Example 2: Call increment-generator-specialist directly
  console.log('\n' + '='.repeat(60));
  console.log('Example 2: Using increment-generator-specialist\n');

  const stepForIncrements = `
Step: Capture User Search Input

Description: The UI needs to capture what the user wants to search for.
This includes the search keyword and any filters they want to apply.

Quality Attributes:
- Responsive: Input should feel instant
- Accessible: Keyboard navigation, screen readers
- Mobile-friendly: Touch-optimized on mobile devices

Context: React app, mobile-first design
`;

  const incrementsResult = await commands.executeSpecialist(
    'increment-generator-specialist',
    stepForIncrements
  );

  console.log('Increments Generation Result:');
  console.log('Prompt Used:', incrementsResult.promptUsed);
  console.log('\nOutput Preview (first 400 chars):');
  console.log(incrementsResult.rawOutput.substring(0, 400) + '...\n');

  // Example 3: Call path-composer-specialist directly
  console.log('\n' + '='.repeat(60));
  console.log('Example 3: Using path-composer-specialist\n');

  const dataForSkeleton = `
Feature: User Authentication

Steps and Increments:
1. Capture Credentials
   - ⭐ Hardcoded email/password form (REQUIRES: None)
   - Single field validation (REQUIRES: Form)
   - Multiple field validation (REQUIRES: Form)

2. Validate User
   - ⭐ Hardcoded user check (REQUIRES: Form)
   - Database lookup (REQUIRES: Form, DB)
   - Password hashing validation (REQUIRES: DB lookup)

3. Create Session
   - ⭐ In-memory session (REQUIRES: User validated)
   - JWT token generation (REQUIRES: User validated)
   - Redis session store (REQUIRES: JWT)

Context: Need the absolute minimum to demonstrate login working end-to-end
`;

  const skeletonResult = await commands.executeSpecialist(
    'path-composer-specialist',
    dataForSkeleton
  );

  console.log('Walking Skeleton Composition Result:');
  console.log('Prompt Used:', skeletonResult.promptUsed);
  console.log('\nOutput Preview (first 400 chars):');
  console.log(skeletonResult.rawOutput.substring(0, 400) + '...\n');

  console.log('\n' + '='.repeat(60));
  console.log('All specialist examples completed!');
  console.log('='.repeat(60));
}

main().catch(console.error);
