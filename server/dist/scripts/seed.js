"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
async function main() {
    const prisma = new client_1.PrismaClient();
    try {
        await prisma.$connect();
        const templatesPath = path_1.default.resolve(process.cwd(), 'data/templates.json');
        const raw = await (0, promises_1.readFile)(templatesPath, 'utf-8');
        const items = JSON.parse(raw);
        console.log(`Seeding ${items.length} templates...`);
        for (const t of items) {
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
    }
    finally {
        await prisma.$disconnect();
    }
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map