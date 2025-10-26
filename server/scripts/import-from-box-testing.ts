/**
 * Script to import templates from .box-testing JSON file into database
 * 
 * Usage:
 *   cd server
 *   yarn ts-node scripts/import-from-box-testing.ts
 */

import { PrismaClient, TemplateStatus, TemplateVisibility } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface TemplateData {
  slug: string;
  name: string;
  description?: string;
  prompt?: string;
  negativePrompt?: string;
  modelProvider?: string;
  modelName?: string;
  status: string;
  visibility: string;
  tags?: string[];
  thumbnailUrl?: string | null;
  usageCount?: number;
}

async function main() {
  const prisma = new PrismaClient();

  try {
    // Read JSON file from .box-testing directory
    const jsonPath = path.join(process.cwd(), '..', '.box-testing', 'json', 'templates-sample.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ File not found: ${jsonPath}`);
      process.exit(1);
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const data: { templates: TemplateData[] } = JSON.parse(rawData);

    console.log(`📦 Found ${data.templates.length} templates to import\n`);

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const template of data.templates) {
      try {
        // Check if template exists
        const existing = await prisma.template.findUnique({
          where: { slug: template.slug },
        });

        const templateData = {
          slug: template.slug,
          name: template.name,
          description: template.description || null,
          prompt: template.prompt || null,
          negativePrompt: template.negativePrompt || null,
          modelProvider: template.modelProvider || 'gemini',
          modelName: template.modelName || 'gemini-1.5-pro',
          status: template.status as TemplateStatus,
          visibility: template.visibility as TemplateVisibility,
          tags: template.tags || [],
          thumbnailUrl: template.thumbnailUrl || null,
          usageCount: template.usageCount || 0,
        };

        if (existing) {
          // Update existing template
          await prisma.template.update({
            where: { slug: template.slug },
            data: templateData,
          });
          console.log(`✏️  Updated: ${template.name}`);
          updated++;
        } else {
          // Create new template
          await prisma.template.create({
            data: templateData,
          });
          console.log(`✅ Created: ${template.name}`);
          created++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${template.name}:`, error);
        errors++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total: ${data.templates.length}`);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

