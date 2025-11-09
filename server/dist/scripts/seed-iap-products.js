"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const iapProducts = [
    {
        productId: 'com.aiimagestylist.credits.starter',
        name: '10 Credits',
        description: 'Buy 10 credits',
        credits: 10,
        price: null,
        currency: null,
        isActive: true,
        displayOrder: 1,
    },
    {
        productId: 'com.aiimagestylist.credits.popular',
        name: '50 Credits',
        description: 'Buy 50 credits',
        credits: 50,
        price: null,
        currency: null,
        isActive: true,
        displayOrder: 2,
    },
    {
        productId: 'com.aiimagestylist.credits.bestvalue',
        name: '100 Credits',
        description: 'Buy 100 credits',
        credits: 100,
        price: null,
        currency: null,
        isActive: true,
        displayOrder: 3,
    },
];
async function main() {
    console.log('🌱 Seeding IAP products...');
    for (const product of iapProducts) {
        const existing = await prisma.iAPProduct.findUnique({
            where: { productId: product.productId },
        });
        if (existing) {
            console.log(`✓ Product ${product.productId} already exists, skipping...`);
            continue;
        }
        await prisma.iAPProduct.create({
            data: product,
        });
        console.log(`✓ Created product: ${product.productId} (${product.name})`);
    }
    console.log('✅ IAP products seeded successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Error seeding IAP products:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-iap-products.js.map