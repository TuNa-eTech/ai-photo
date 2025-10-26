/* eslint-disable no-console */
/**
 * Import templates from JSON file to database
 * 
 * Usage:
 *   npx ts-node scripts/import-from-json.ts [path-to-json]
 *   
 * Default: ../.box-testing/json/templates-sample.json
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

interface TemplateInput {
  id: string;
  name: string;
  thumbnailUrl?: string | null;
  publishedAt?: string | null;
  usageCount?: number;
}

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

async function main() {
  const args = process.argv.slice(2);
  const jsonFile = args[0] || '../.box-testing/json/templates-sample.json';
  
  const jsonPath = path.resolve(process.cwd(), jsonFile);

  console.log(colorize('\n=== Import Templates from JSON ===\n', 'magenta'));
  console.log(`JSON File: ${jsonPath}`);

  // Load JSON
  if (!fs.existsSync(jsonPath)) {
    console.error(colorize(`Error: File not found: ${jsonPath}`, 'red'));
    process.exit(1);
  }

  let templates: TemplateInput[];
  try {
    const content = fs.readFileSync(jsonPath, 'utf-8');
    templates = JSON.parse(content);

    if (!Array.isArray(templates)) {
      throw new Error('JSON must be an array of templates');
    }
  } catch (error) {
    console.error(colorize(`Error loading JSON: ${error}`, 'red'));
    process.exit(1);
  }

  console.log(`Templates to import: ${templates.length}\n`);

  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log(colorize('✓ Connected to database\n', 'green'));

    let successCount = 0;
    let errorCount = 0;

    for (const [index, template] of templates.entries()) {
      try {
        const slug = `template-${template.id}`;
        const data = {
          id: template.id,
          slug: slug,
          name: template.name,
          thumbnailUrl: template.thumbnailUrl || null,
          publishedAt: template.publishedAt ? new Date(template.publishedAt) : null,
          usageCount: template.usageCount || 0,
        };

        await prisma.template.upsert({
          where: { id: template.id },
          create: data,
          update: data,
        });

        console.log(
          colorize(`[${index + 1}/${templates.length}]`, 'blue'),
          template.name.padEnd(40),
          colorize('✓', 'green')
        );
        successCount++;
      } catch (error) {
        console.log(
          colorize(`[${index + 1}/${templates.length}]`, 'blue'),
          template.name.padEnd(40),
          colorize('✗', 'red'),
          error instanceof Error ? error.message : String(error)
        );
        errorCount++;
      }
    }

    console.log(colorize('\n=== Import Summary ===\n', 'magenta'));
    console.log(colorize('✓', 'green'), `Success: ${successCount}`);
    console.log(colorize('✗', 'red'), `Failed: ${errorCount}`);
    console.log(`Total: ${templates.length}`);

    if (errorCount === 0) {
      console.log(colorize('\n✓ All templates imported successfully!\n', 'green'));
    } else {
      console.log(colorize('\n⚠ Some templates failed to import.\n', 'yellow'));
    }
  } catch (error) {
    console.error(colorize(`\nDatabase error: ${error}\n`, 'red'));
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

