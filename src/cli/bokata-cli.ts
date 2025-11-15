#!/usr/bin/env node

import { createBokataCommands } from '../api/bokata-commands';
import { program } from 'commander';
import fs from 'fs';
import path from 'path';

/**
 * Bokata CLI
 * Command-line interface for bokata commands
 */

const commands = createBokataCommands();

// Main program
program
  .name('bokata')
  .description('Bokata Agent - Feature decomposition using the Hamburger Method')
  .version('1.0.0');

// /bokata command
program
  .command('project <input>')
  .alias('bokata')
  .description('Analyze a multi-feature project')
  .option('-f, --file', 'Input is a file path')
  .option('-o, --output <path>', 'Output directory for results')
  .option('--format <format>', 'Output format: markdown or json (default: markdown)')
  .action(async (input, options) => {
    try {
      let projectInput = input;

      if (options.file) {
        const filePath = path.resolve(input);
        if (!fs.existsSync(filePath)) {
          console.error(`Error: File not found: ${filePath}`);
          process.exit(1);
        }
        projectInput = fs.readFileSync(filePath, 'utf-8');
      }

      console.log('🚀 Analyzing project...\n');

      const result = await commands.bokata(projectInput, options.format);

      console.log('\n✅ Project analysis completed!\n');
      console.log(result.output);

      if (options.output) {
        const outputPath = path.resolve(options.output);
        fs.mkdirSync(outputPath, { recursive: true });
        const ext = options.format === 'json' ? 'json' : 'md';
        const filename = `project-analysis-${new Date().toISOString().split('T')[0]}.${ext}`;
        const fullPath = path.join(outputPath, filename);
        fs.writeFileSync(fullPath, result.output);
        console.log(`\n📄 Saved to: ${fullPath}`);
      }
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// /bokata-feature command
program
  .command('feature <input>')
  .alias('bokata-feature')
  .description('Analyze a single feature')
  .option('-f, --file', 'Input is a file path')
  .option('-o, --output <path>', 'Output directory for results')
  .option('--format <format>', 'Output format: markdown or json (default: markdown)')
  .action(async (input, options) => {
    try {
      let featureInput = input;

      if (options.file) {
        const filePath = path.resolve(input);
        if (!fs.existsSync(filePath)) {
          console.error(`Error: File not found: ${filePath}`);
          process.exit(1);
        }
        featureInput = fs.readFileSync(filePath, 'utf-8');
      }

      console.log('🔍 Analyzing feature...\n');

      const result = await commands.bokataFeature(featureInput, options.format);

      console.log('\n✅ Feature analysis completed!\n');
      console.log(result.output);

      if (options.output) {
        const outputPath = path.resolve(options.output);
        fs.mkdirSync(outputPath, { recursive: true });
        const ext = options.format === 'json' ? 'json' : 'md';
        const filename = `feature-analysis-${new Date().toISOString().split('T')[0]}.${ext}`;
        const fullPath = path.join(outputPath, filename);
        fs.writeFileSync(fullPath, result.output);
        console.log(`\n📄 Saved to: ${fullPath}`);
      }
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// /bokata-iterations-paths command
program
  .command('paths <input>')
  .alias('bokata-iterations-paths')
  .description('Generate implementation paths from analysis')
  .option('-f, --file', 'Input is a file path')
  .option('-o, --output <path>', 'Output directory for results')
  .option('--format <format>', 'Output format: markdown or json (default: markdown)')
  .action(async (input, options) => {
    try {
      let analysisInput = input;

      if (options.file) {
        const filePath = path.resolve(input);
        if (!fs.existsSync(filePath)) {
          console.error(`Error: File not found: ${filePath}`);
          process.exit(1);
        }
        analysisInput = fs.readFileSync(filePath, 'utf-8');
      }

      console.log('🛤️  Generating implementation paths...\n');

      const result = await commands.bokataIterationsPaths(analysisInput, options.format);

      console.log('\n✅ Implementation paths generated!\n');
      console.log(result.output);

      if (options.output) {
        const outputPath = path.resolve(options.output);
        fs.mkdirSync(outputPath, { recursive: true });
        const ext = options.format === 'json' ? 'json' : 'md';
        const filename = `paths-${new Date().toISOString().split('T')[0]}.${ext}`;
        const fullPath = path.join(outputPath, filename);
        fs.writeFileSync(fullPath, result.output);
        console.log(`\n📄 Saved to: ${fullPath}`);
      }
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// /bokata-matrix command
program
  .command('matrix <input>')
  .alias('bokata-matrix')
  .description('Generate selection matrix from analysis')
  .option('-f, --file', 'Input is a file path')
  .option('-o, --output <path>', 'Output directory for results')
  .option('--format <format>', 'Output format: markdown or json (default: markdown)')
  .action(async (input, options) => {
    try {
      let analysisInput = input;

      if (options.file) {
        const filePath = path.resolve(input);
        if (!fs.existsSync(filePath)) {
          console.error(`Error: File not found: ${filePath}`);
          process.exit(1);
        }
        analysisInput = fs.readFileSync(filePath, 'utf-8');
      }

      console.log('📊 Generating selection matrix...\n');

      const result = await commands.bokataMatrix(analysisInput, options.format);

      console.log('\n✅ Selection matrix generated!\n');
      console.log(result.output);

      if (options.output) {
        const outputPath = path.resolve(options.output);
        fs.mkdirSync(outputPath, { recursive: true });
        const ext = options.format === 'json' ? 'json' : 'md';
        const filename = `matrix-${new Date().toISOString().split('T')[0]}.${ext}`;
        const fullPath = path.join(outputPath, filename);
        fs.writeFileSync(fullPath, result.output);
        console.log(`\n📄 Saved to: ${fullPath}`);
      }
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// List available commands
program
  .command('list')
  .description('List all available commands and specialists')
  .action(() => {
    console.log('📋 Available Commands:');
    const commandsList = commands.getAvailableCommands();
    commandsList.forEach(cmd => {
      const metadata = commands.getCommandMetadata(cmd);
      console.log(`  - ${cmd}: ${metadata.description || 'No description'}`);
    });

    console.log('\n🔧 Available Specialists:');
    const specialists = commands.getAvailableSpecialists();
    specialists.forEach(spec => {
      const metadata = commands.getSpecialistMetadata(spec);
      console.log(`  - ${spec}: ${metadata.description || 'No description'}`);
    });
  });

// Parse arguments
program.parse();
