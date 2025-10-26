"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const DEMO_TEMPLATES = [
    {
        id: 'anime-portrait-v1',
        slug: 'anime-portrait-v1',
        name: 'Anime Portrait Style',
        thumbnailUrl: 'http://localhost:8080/public/thumbnails/test_img.png',
        publishedAt: new Date('2024-01-15'),
        usageCount: 1250,
    },
    {
        id: 'cyberpunk-neon',
        slug: 'cyberpunk-neon',
        name: 'Cyberpunk Neon City',
        thumbnailUrl: 'http://localhost:8080/public/thumbnails/test_img.png',
        publishedAt: new Date('2024-02-20'),
        usageCount: 890,
    },
    {
        id: 'watercolor-fantasy',
        slug: 'watercolor-fantasy',
        name: 'Watercolor Fantasy Art',
        thumbnailUrl: 'http://localhost:8080/public/thumbnails/test_img.png',
        publishedAt: new Date('2024-03-10'),
        usageCount: 2340,
    },
    {
        id: 'realistic-portrait',
        slug: 'realistic-portrait',
        name: 'Hyper-Realistic Portrait',
        thumbnailUrl: 'http://localhost:8080/public/thumbnails/test_img.png',
        publishedAt: new Date('2024-04-05'),
        usageCount: 3120,
    },
    {
        id: 'oil-painting-classic',
        slug: 'oil-painting-classic',
        name: 'Classic Oil Painting',
        thumbnailUrl: 'http://localhost:8080/public/thumbnails/test_img.png',
        publishedAt: new Date('2024-05-12'),
        usageCount: 670,
    },
    {
        id: 'pixel-art-retro',
        slug: 'pixel-art-retro',
        name: 'Retro Pixel Art',
        thumbnailUrl: 'http://localhost:8080/public/thumbnails/test_img.png',
        publishedAt: new Date('2024-06-08'),
        usageCount: 1560,
    },
    {
        id: 'fantasy-landscape',
        slug: 'fantasy-landscape',
        name: 'Epic Fantasy Landscape',
        thumbnailUrl: 'http://localhost:8080/public/thumbnails/test_img.png',
        publishedAt: new Date('2024-07-22'),
        usageCount: 980,
    },
    {
        id: 'minimalist-modern',
        slug: 'minimalist-modern',
        name: 'Minimalist Modern Art',
        thumbnailUrl: 'http://localhost:8080/public/thumbnails/test_img.png',
        publishedAt: new Date('2024-08-15'),
        usageCount: 540,
    },
    {
        id: 'steampunk-vintage',
        slug: 'steampunk-vintage',
        name: 'Steampunk Vintage Style',
        thumbnailUrl: 'http://localhost:8080/public/thumbnails/test_img.png',
        publishedAt: new Date('2024-09-03'),
        usageCount: 2100,
    },
    {
        id: 'abstract-colorful',
        slug: 'abstract-colorful',
        name: 'Abstract Colorful Expression',
        thumbnailUrl: 'http://localhost:8080/public/thumbnails/test_img.png',
        publishedAt: new Date('2024-10-18'),
        usageCount: 1830,
    },
];
async function main() {
    const prisma = new client_1.PrismaClient();
    try {
        await prisma.$connect();
        console.log(`🌱 Seeding ${DEMO_TEMPLATES.length} demo templates...`);
        for (const template of DEMO_TEMPLATES) {
            await prisma.template.upsert({
                where: { id: template.id },
                create: template,
                update: template,
            });
            console.log(`  ✓ Created/Updated: ${template.name}`);
        }
        console.log('\n✅ Seed completed successfully!');
        console.log(`📊 Total templates: ${DEMO_TEMPLATES.length}`);
    }
    catch (error) {
        console.error('❌ Seed failed:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed-demo.js.map