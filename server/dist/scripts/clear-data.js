"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function main() {
    const prisma = new client_1.PrismaClient();
    try {
        await prisma.$connect();
        console.log('🗑️  Deleting all templates...');
        const result = await prisma.template.deleteMany({});
        console.log(`✅ Deleted ${result.count} templates`);
        console.log('✨ Database is now clean!');
    }
    catch (error) {
        console.error('❌ Failed to clear data:', error);
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
//# sourceMappingURL=clear-data.js.map