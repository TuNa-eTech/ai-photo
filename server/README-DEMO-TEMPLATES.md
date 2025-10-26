# Demo Templates Setup Guide

## Overview
This document describes how to seed the database with 10 demo templates with thumbnails for development and testing.

## What Was Done

### 1. Static Files Serving
- Added `@nestjs/serve-static` package to serve static files
- Created `public/thumbnails/` directory for template thumbnails
- Copied demo image from `.box-testing/images/test_img.png` to `public/thumbnails/`
- Configured `ServeStaticModule` in `app.module.ts` to serve files from `/public` path

### 2. Demo Seed Script
Created `scripts/seed-demo.ts` with 10 diverse template samples:

1. **Anime Portrait Style** - 1,250 usages
2. **Cyberpunk Neon City** - 890 usages
3. **Watercolor Fantasy Art** - 2,340 usages
4. **Hyper-Realistic Portrait** - 3,120 usages
5. **Classic Oil Painting** - 670 usages
6. **Retro Pixel Art** - 1,560 usages
7. **Epic Fantasy Landscape** - 980 usages
8. **Minimalist Modern Art** - 540 usages
9. **Steampunk Vintage Style** - 2,100 usages
10. **Abstract Colorful Expression** - 1,830 usages

Each template includes:
- Unique ID (slug)
- Descriptive name
- Thumbnail URL (`http://localhost:8080/public/thumbnails/test_img.png`)
- Published date (various dates from Jan-Oct 2024)
- Usage count (realistic numbers for testing sorting)

### 3. Build Process Enhancement
Updated `package.json` scripts:
- `build`: Now automatically copies `public/` folder to `dist/` after build
- `copy:public`: New script to copy static assets
- `db:seed:demo`: New script to run demo seed (`npx ts-node scripts/seed-demo.ts`)

### 4. Web CMS Temporary Fix
Modified `web-cms/src/api/templates.ts`:
- Temporarily redirected `/v1/admin/templates` calls to `/v1/templates`
- This is a temporary workaround until admin-specific endpoints are implemented

## How to Use

### Seed Demo Templates
```bash
cd server
yarn db:seed:demo
```

Or using npm:
```bash
cd server
npm run db:seed:demo
```

Or directly:
```bash
cd server
npx ts-node scripts/seed-demo.ts
```

### Build and Run
```bash
cd server
yarn build      # Build and copy static files
yarn start:dev  # Run in development mode
# or
yarn start:prod # Run in production mode
```

### Access Thumbnails
Thumbnails are served at:
```
http://localhost:8080/public/thumbnails/test_img.png
```

### View in Web CMS
1. Start the backend: `cd server && yarn start:dev`
2. Start web-cms: `cd web-cms && yarn dev`
3. Open http://localhost:5173
4. Login with DevAuth (dev@example.com)
5. View the templates list with thumbnails

## Database Schema
Current Template model (from `prisma/schema.prisma`):
```prisma
model Template {
  id           String   @id
  name         String
  thumbnailUrl String?
  publishedAt  DateTime?
  usageCount   Int      @default(0)

  @@map("templates")
}
```

## Future Improvements
1. Create dedicated `/v1/admin/templates` endpoints with proper DTO validation
2. Add multiple thumbnail images for variety
3. Implement asset upload endpoints
4. Add template versions, tags, and relationships
5. Create proper asset storage with S3 or local filesystem management

## Notes
- All templates use the same demo image currently - this is intentional for quick demo setup
- Published dates are set to 2024 for realistic sorting/filtering demos
- Usage counts vary to demonstrate sorting by popularity
- Static files must be in `dist/public/` when running production build

## Troubleshooting

### Thumbnails Not Loading (404)
Make sure the `public/` folder is copied to `dist/`:
```bash
cd server
cp -r public dist/
```

### Templates Not Showing in Web CMS
Check that:
1. Backend is running: http://localhost:8080
2. DevAuth is enabled: `DEV_AUTH_ENABLED=1` in `.env`
3. CORS allows localhost:5173
4. Database has templates: `yarn db:seed:demo`

### Old Templates Exist
The seed script uses `upsert`, so it will update existing templates with matching IDs. To start fresh:
```bash
cd server
npx prisma migrate reset  # WARNING: Deletes all data
yarn db:seed:demo
```

