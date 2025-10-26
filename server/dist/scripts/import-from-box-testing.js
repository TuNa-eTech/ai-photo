"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function main() {
    const prisma = new client_1.PrismaClient();
    try {
        const jsonPath = path.join(process.cwd(), '..', '.box-testing', 'json', 'templates-sample.json');
        if (!fs.existsSync(jsonPath)) {
            console.error(`❌ File not found: ${jsonPath}`);
            process.exit(1);
        }
        const rawData = fs.readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(rawData);
        console.log(`📦 Found ${data.templates.length} templates to import\n`);
        let created = 0;
        let updated = 0;
        let errors = 0;
        for (const template of data.templates) {
            try {
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
                    status: template.status,
                    visibility: template.visibility,
                    tags: template.tags || [],
                    thumbnailUrl: template.thumbnailUrl || null,
                    usageCount: template.usageCount || 0,
                };
                if (existing) {
                    await prisma.template.update({
                        where: { slug: template.slug },
                        data: templateData,
                    });
                    console.log(`✏️  Updated: ${template.name}`);
                    updated++;
                }
                else {
                    await prisma.template.create({
                        data: templateData,
                    });
                    console.log(`✅ Created: ${template.name}`);
                    created++;
                }
            }
            catch (error) {
                console.error(`❌ Error processing ${template.name}:`, error);
                errors++;
            }
        }
        console.log(`\n📊 Summary:`);
        console.log(`   Created: ${created}`);
        console.log(`   Updated: ${updated}`);
        console.log(`   Errors: ${errors}`);
        console.log(`   Total: ${data.templates.length}`);
    }
    catch (error) {
        console.error('❌ Import failed:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=import-from-box-testing.js.map