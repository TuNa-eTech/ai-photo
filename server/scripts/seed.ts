/* eslint-disable no-console */
import { readFile } from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();

    // Load sample templates from legacy Go backend JSON
    const templatesPath = path.resolve(process.cwd(), 'data/templates.json');
    const raw = await readFile(templatesPath, 'utf-8');
    const items: Array<{ id: string; name: string; prompt?: string }> = JSON.parse(raw);

    console.log(`Seeding ${items.length} templates...`);
    for (const t of items) {
      // Generate slug from id (format: template-{id})
      const slug = `template-${t.id}`;
      
      await prisma.template.upsert({
        where: { id: t.id },
        create: {
          id: t.id,
          slug: slug,
          name: t.name,
          thumbnailUrl: null,
          publishedAt: null,
          usageCount: 0,
        },
        update: {
          name: t.name,
        },
      });
    }
    console.log('Seed completed.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
