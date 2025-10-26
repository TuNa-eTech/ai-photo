# Box Testing - Sample Data & Test Scripts

This directory contains sample data and test utilities for the ImageAIWraper project.

## Directory Structure

```
.box-testing/
├── json/
│   ├── templates-sample.json       # 13 diverse sample templates
│   └── test-custom.json            # Custom test data
└── README.md                        # This file
```

## Sample Data

### templates-sample.json

Contains 13 realistic template examples with diverse characteristics:

**Published Templates (10)**:
- Anime Portrait Style
- Cyberpunk Neon City
- Watercolor Fantasy Art
- Hyper-Realistic Portrait Pro
- Classic Oil Painting
- Retro Pixel Art
- Epic Fantasy Landscape
- Minimalist Modern Art
- Steampunk Vintage Style
- Abstract Colorful Expression

**Draft Templates (2)**:
- Comic Book Hero Style
- Gothic Dark Art (private visibility)

**Archived Templates (1)**:
- Impressionist Painting

**Features**:
- ✅ Varied status (draft, published, archived)
- ✅ Different visibility (public, private)
- ✅ Rich tags and descriptions
- ✅ Usage count distribution
- ✅ Some with thumbnails, some without
- ✅ Realistic data for UI testing

## Import Sample Data

### Prerequisites

1. Database running (Docker or local)
2. Server dependencies installed

### Import Command

```bash
cd server

# Import sample templates
yarn ts-node scripts/import-from-box-testing.ts
```

**Output**:
```
📦 Found 13 templates to import

✅ Created: Anime Portrait Style
✅ Created: Cyberpunk Neon City
...

📊 Summary:
   Created: 13
   Updated: 0
   Errors: 0
   Total: 13
```

### Clear Data First (Optional)

If you want to start fresh:

```bash
cd server

# Clear all existing templates
yarn ts-node scripts/clear-data.ts

# Then import sample data
yarn ts-node scripts/import-from-box-testing.ts
```

## Use Cases

### 1. Development Testing

Import diverse data to test:
- List view with multiple templates
- Filtering by status/visibility
- Sorting by various fields
- Search functionality
- Pagination with realistic data volume

### 2. UI/UX Testing

Test UI components with:
- Long vs short names
- Templates with/without thumbnails
- Different status badges
- Various tag combinations
- Edge cases (empty descriptions, etc.)

### 3. Demo & Screenshots

Populate database with professional-looking data for:
- Product demos
- Documentation screenshots
- Stakeholder presentations
- Marketing materials

### 4. Integration Testing

Use as baseline data for:
- E2E tests
- API testing
- Performance testing
- Frontend integration tests

## Customization

### Modify Sample Data

Edit `json/templates-sample.json` to:
- Add more templates
- Change field values
- Add/remove tags
- Adjust usage counts
- Update descriptions

Format:
```json
{
  "templates": [
    {
      "slug": "unique-slug",
      "name": "Template Name",
      "description": "Optional description",
      "status": "draft|published|archived",
      "visibility": "public|private",
      "tags": ["tag1", "tag2"],
      "thumbnailUrl": "http://localhost:8080/public/thumbnails/...",
      "usageCount": 0
    }
  ]
}
```

### Re-import After Changes

The import script uses **upsert** logic:
- Existing templates (by slug) are **updated**
- New templates are **created**

```bash
cd server
yarn ts-node scripts/import-from-box-testing.ts
```

## Integration with Workflow

### Local Development Flow

1. **Start fresh**:
   ```bash
   cd docker && docker-compose up -d db
   cd ../server && yarn ts-node scripts/clear-data.ts
   ```

2. **Import sample data**:
   ```bash
   cd server && yarn ts-node scripts/import-from-box-testing.ts
   ```

3. **Start services**:
   ```bash
   # Terminal 1
   cd server && yarn start:dev
   
   # Terminal 2
   cd web-cms && yarn dev
   ```

4. **Access**:
   - Web CMS: http://localhost:5173
   - API: http://localhost:8080

### Testing Workflow

```bash
# Clear and reimport for consistent test state
cd server
yarn ts-node scripts/clear-data.ts
yarn ts-node scripts/import-from-box-testing.ts

# Run tests
yarn test:e2e
```

## Notes

- **Thumbnail URLs**: Sample data includes placeholder URLs. Files don't exist unless you upload them via UI.
- **Usage Count**: Random realistic values for testing sorting.
- **Tags**: Categorized appropriately for each template style.
- **Descriptions**: Realistic marketing copy for demo purposes.

## Adding New Sample Files

To add new test data files:

1. Create JSON file in `.box-testing/json/`
2. Follow existing format
3. Create import script in `server/scripts/` if needed
4. Document in this README

## Troubleshooting

### Import Fails with "Cannot find module"

Make sure you're running from `server/` directory:
```bash
cd /path/to/ImageAIWraper/server
yarn ts-node scripts/import-from-box-testing.ts
```

### Templates Not Showing in UI

1. Check import output for errors
2. Verify database connection
3. Check server logs
4. Refresh web-cms page

### Prisma Client Error

Regenerate Prisma client:
```bash
cd server
npx prisma generate
```

## Related Documentation

- API Documentation: `.documents/api/admin-templates-api.md`
- Implementation Summary: `.documents/implementation-summary-admin-templates.md`
- Memory Bank: `.memory-bank/file-upload-system.md`
- Import Script: `server/scripts/import-from-box-testing.ts`
