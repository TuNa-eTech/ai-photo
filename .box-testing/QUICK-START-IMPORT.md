# Quick Start: Import Templates

## 🚀 Import Now (Recommended)

```bash
# Step 1: Go to server directory
cd server

# Step 2: Import templates from sample JSON
yarn db:import:json

# Done! Check web-cms at http://localhost:5173
```

## 📝 Import Your Own Templates

### 1. Create JSON file

Create `my-templates.json`:
```json
[
  {
    "id": "my-style",
    "name": "My Amazing Style",
    "thumbnailUrl": "http://localhost:8080/public/thumbnails/my-image.png",
    "publishedAt": "2024-01-15T00:00:00Z",
    "usageCount": 100
  }
]
```

### 2. Import

```bash
cd server
npx ts-node scripts/import-from-json.ts ../path/to/my-templates.json
```

## 🎯 Common Use Cases

### Import 100 templates at once
```bash
cd server
yarn db:import:json ../big-template-list.json
```

### Re-import to update existing templates
```bash
# Script uses upsert - safe to run multiple times
cd server
yarn db:import:json
```

### Seed demo templates (10 templates)
```bash
cd server
yarn db:seed:demo
```

## 📊 Verify Import

### Check in Web CMS
1. Open http://localhost:5173
2. Login (DevAuth: dev@example.com)
3. See templates list

### Check in Database
```bash
cd server
npx prisma studio
# Opens browser UI to view database
```

### Check via API
```bash
curl http://localhost:8080/v1/templates \
  -H "Authorization: Bearer dev" | jq
```

## 🔧 Troubleshooting

### Templates not showing?
```bash
# Restart backend
cd server
yarn start:dev
```

### Want to start fresh?
```bash
cd server
# WARNING: Deletes all data
npx prisma migrate reset
yarn db:seed:demo
```

## 📚 Need More Help?

- Full docs: `.box-testing/scripts/README-IMPORT.md`
- Summary: `.box-testing/IMPORT-SUMMARY.md`
- Demo templates: `server/README-DEMO-TEMPLATES.md`

