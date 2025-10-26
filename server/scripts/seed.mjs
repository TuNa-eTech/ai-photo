import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();

    const templatesPath = path.resolve(process.cwd(), 'data/templates.json');
    const raw = await readFile(templatesPath, 'utf-8');
    const items = JSON.parse(raw);

    console.log(`Seeding ${items.length} templates...`);
    for (const t of items) {
      await prisma.template.upsert({
        where: { id: t.id },
        create: {
          id: t.id,
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
