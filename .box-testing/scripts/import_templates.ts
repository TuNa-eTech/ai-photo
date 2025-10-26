#!/usr/bin/env ts-node

/**
 * Template Import Script (TypeScript)
 * 
 * Import templates from JSON file to backend via API
 * 
 * Features:
 * - Batch import with concurrent requests
 * - Progress bar
 * - Detailed error reporting
 * - Retry failed requests
 * - Dry-run mode
 * 
 * Usage:
 *   ts-node import_templates.ts [options]
 * 
 * Options:
 *   --file <path>      Path to JSON file (default: .box-testing/json/templates-sample.json)
 *   --env <path>       Path to env.yaml (default: .box-testing/sandbox/env.yaml)
 *   --dry-run          Preview without actually importing
 *   --batch-size <n>   Number of concurrent requests (default: 3)
 *   --retry <n>        Number of retry attempts (default: 2)
 *   --help             Show this help message
 */

import fs from 'fs';
import path from 'path';
import axios, { AxiosError } from 'axios';
import yaml from 'yaml';

// ============================================================================
// Types
// ============================================================================

interface Template {
  id: string;
  name: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  usageCount?: number;
}

interface EnvConfig {
  idToken: string;
  apiBaseUrl: string;
}

interface ImportOptions {
  jsonFile: string;
  envFile: string;
  dryRun: boolean;
  batchSize: number;
  retryAttempts: number;
}

interface ImportResult {
  template: Template;
  success: boolean;
  error?: string;
  statusCode?: number;
  attempts: number;
}

// ============================================================================
// Colors
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

// ============================================================================
// Helpers
// ============================================================================

function parseArgs(): ImportOptions {
  const args = process.argv.slice(2);
  const options: ImportOptions = {
    jsonFile: '.box-testing/json/templates-sample.json',
    envFile: '.box-testing/sandbox/env.yaml',
    dryRun: false,
    batchSize: 3,
    retryAttempts: 2,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--file':
        options.jsonFile = args[++i];
        break;
      case '--env':
        options.envFile = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--batch-size':
        options.batchSize = parseInt(args[++i], 10);
        break;
      case '--retry':
        options.retryAttempts = parseInt(args[++i], 10);
        break;
      case '--help':
        console.log(`
Template Import Script

Usage: ts-node import_templates.ts [options]

Options:
  --file <path>      Path to JSON file (default: .box-testing/json/templates-sample.json)
  --env <path>       Path to env.yaml (default: .box-testing/sandbox/env.yaml)
  --dry-run          Preview without actually importing
  --batch-size <n>   Number of concurrent requests (default: 3)
  --retry <n>        Number of retry attempts (default: 2)
  --help             Show this help message
        `);
        process.exit(0);
      default:
        console.error(colorize(`Unknown option: ${args[i]}`, 'red'));
        process.exit(1);
    }
  }

  return options;
}

function loadEnvConfig(envFile: string): EnvConfig {
  try {
    const content = fs.readFileSync(envFile, 'utf-8');
    const config = yaml.parse(content);
    
    if (!config.idToken) {
      throw new Error('idToken not found in env file');
    }
    if (!config.apiBaseUrl) {
      throw new Error('apiBaseUrl not found in env file');
    }

    return {
      idToken: config.idToken,
      apiBaseUrl: config.apiBaseUrl,
    };
  } catch (error) {
    console.error(colorize(`Failed to load env config: ${error}`, 'red'));
    process.exit(1);
  }
}

function loadTemplates(jsonFile: string): Template[] {
  try {
    const content = fs.readFileSync(jsonFile, 'utf-8');
    const templates = JSON.parse(content);

    if (!Array.isArray(templates)) {
      throw new Error('JSON file must contain an array of templates');
    }

    return templates;
  } catch (error) {
    console.error(colorize(`Failed to load templates: ${error}`, 'red'));
    process.exit(1);
  }
}

// ============================================================================
// Import Logic
// ============================================================================

async function importTemplate(
  template: Template,
  config: EnvConfig,
  retryAttempts: number
): Promise<ImportResult> {
  const url = `${config.apiBaseUrl}/v1/admin/templates`;
  let lastError: string | undefined;
  let lastStatusCode: number | undefined;

  for (let attempt = 1; attempt <= retryAttempts + 1; attempt++) {
    try {
      const response = await axios.post(url, template, {
        headers: {
          Authorization: config.idToken,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      return {
        template,
        success: true,
        statusCode: response.status,
        attempts: attempt,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      lastStatusCode = axiosError.response?.status;
      
      if (axiosError.response?.data) {
        const data = axiosError.response.data as any;
        lastError = data.error?.message || data.message || axiosError.message;
      } else {
        lastError = axiosError.message;
      }

      // Don't retry on client errors (4xx except 429)
      if (lastStatusCode && lastStatusCode >= 400 && lastStatusCode < 500 && lastStatusCode !== 429) {
        break;
      }

      // Wait before retry
      if (attempt < retryAttempts + 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  return {
    template,
    success: false,
    error: lastError,
    statusCode: lastStatusCode,
    attempts: retryAttempts + 1,
  };
}

async function importTemplatesInBatches(
  templates: Template[],
  config: EnvConfig,
  options: ImportOptions
): Promise<ImportResult[]> {
  const results: ImportResult[] = [];
  
  for (let i = 0; i < templates.length; i += options.batchSize) {
    const batch = templates.slice(i, Math.min(i + options.batchSize, templates.length));
    
    console.log(
      colorize(
        `\nProcessing batch ${Math.floor(i / options.batchSize) + 1}/${Math.ceil(templates.length / options.batchSize)}`,
        'cyan'
      )
    );

    const batchResults = await Promise.all(
      batch.map((template) => importTemplate(template, config, options.retryAttempts))
    );

    results.push(...batchResults);

    // Progress
    for (const result of batchResults) {
      const progress = `[${results.length}/${templates.length}]`;
      const name = result.template.name.padEnd(40);
      
      if (result.success) {
        console.log(
          `  ${colorize(progress, 'blue')} ${name} ${colorize('✓', 'green')} (${result.statusCode}, ${result.attempts} attempts)`
        );
      } else {
        console.log(
          `  ${colorize(progress, 'blue')} ${name} ${colorize('✗', 'red')} (${result.statusCode || 'N/A'}, ${result.attempts} attempts)`
        );
        if (result.error) {
          console.log(`    ${colorize(`Error: ${result.error}`, 'red')}`);
        }
      }
    }
  }

  return results;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log(colorize('\n=== Template Import Script ===\n', 'magenta'));

  const options = parseArgs();
  const config = loadEnvConfig(options.envFile);
  const templates = loadTemplates(options.jsonFile);

  console.log(`JSON File: ${options.jsonFile}`);
  console.log(`API URL: ${config.apiBaseUrl}/v1/admin/templates`);
  console.log(`Templates: ${templates.length}`);
  console.log(`Batch Size: ${options.batchSize}`);
  console.log(`Retry Attempts: ${options.retryAttempts}`);
  console.log(`Dry Run: ${options.dryRun ? colorize('YES', 'yellow') : 'NO'}`);

  if (options.dryRun) {
    console.log(colorize('\n📋 Dry run mode - Templates to import:', 'yellow'));
    templates.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.name} (${t.id})`);
    });
    console.log(colorize('\n✓ Dry run completed\n', 'green'));
    return;
  }

  const results = await importTemplatesInBatches(templates, config, options);

  // Summary
  const successCount = results.filter((r) => r.success).length;
  const errorCount = results.filter((r) => !r.success).length;

  console.log(colorize('\n=== Import Summary ===\n', 'magenta'));
  console.log(`${colorize('✓', 'green')} Success: ${successCount}`);
  console.log(`${colorize('✗', 'red')} Failed: ${errorCount}`);
  console.log(`Total: ${templates.length}`);

  if (errorCount > 0) {
    console.log(colorize('\nFailed templates:', 'yellow'));
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.template.name} (${r.template.id}): ${r.error}`);
      });
  }

  if (errorCount === 0) {
    console.log(colorize('\n✓ All templates imported successfully!\n', 'green'));
    process.exit(0);
  } else {
    console.log(colorize('\n⚠ Some templates failed to import.\n', 'yellow'));
    process.exit(1);
  }
}

// Run
if (require.main === module) {
  main().catch((error) => {
    console.error(colorize(`Fatal error: ${error}`, 'red'));
    process.exit(1);
  });
}

