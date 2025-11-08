/**
 * Example: Using Bokata Commands API
 * This shows how to use the commands that replicate the original bokata-slicer-cc behavior
 */

import { createBokataCommands } from '../src';

async function main() {
  // Create commands API instance (uses .env configuration)
  const commands = createBokataCommands();

  console.log('='.repeat(60));
  console.log('Bokata Commands Example');
  console.log('='.repeat(60));

  // List available commands
  console.log('\nAvailable Commands:');
  commands.getAvailableCommands().forEach(cmd => {
    const metadata = commands.getCommandMetadata(cmd);
    console.log(`  - ${cmd}: ${metadata.description || 'No description'}`);
  });

  console.log('\nAvailable Specialists:');
  commands.getAvailableSpecialists().forEach(spec => {
    const metadata = commands.getSpecialistMetadata(spec);
    console.log(`  - ${spec}: ${metadata.description || 'No description'}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('Example 1: Feature Analysis');
  console.log('='.repeat(60));

  // Example 1: Analyze a single feature
  const featureInput = `
Feature: User Resets Password

Description: Users should be able to reset their password if they forget it.
The system should send a reset link via email, validate the token, and allow
the user to set a new password.

Context: SaaS application, security is critical
Tech Stack: React, Node.js, PostgreSQL, SendGrid for email
`;

  console.log('\nAnalyzing feature: User Resets Password...\n');

  const featureResult = await commands.bokataFeature(featureInput);

  console.log('Feature Analysis Result:');
  console.log('Command Used:', featureResult.commandUsed);
  console.log('Specialists Available:', featureResult.specialistsAvailable);
  console.log('\nOutput Preview (first 500 chars):');
  console.log(featureResult.output.substring(0, 500) + '...\n');

  console.log('\n' + '='.repeat(60));
  console.log('Example 2: Project Analysis');
  console.log('='.repeat(60));

  // Example 2: Analyze a multi-feature project
  const projectInput = `
Project: Task Management Platform

Description: A platform for teams to manage projects and tasks collaboratively.

Features:
- User Creates Project
- User Adds Task to Project
- User Assigns Task to Team Member
- User Updates Task Status
- User Tracks Project Progress
- User Receives Notifications

Tech Stack: React, Node.js, PostgreSQL, WebSockets
Timeline: 3 months to MVP
Priorities: Early user feedback, real-time collaboration
`;

  console.log('\nAnalyzing project: Task Management Platform...\n');

  const projectResult = await commands.bokata(projectInput);

  console.log('Project Analysis Result:');
  console.log('Command Used:', projectResult.commandUsed);
  console.log('Specialists Available:', projectResult.specialistsAvailable);
  console.log('\nOutput Preview (first 500 chars):');
  console.log(projectResult.output.substring(0, 500) + '...\n');

  console.log('\n' + '='.repeat(60));
  console.log('All examples completed!');
  console.log('='.repeat(60));
}

main().catch(console.error);
