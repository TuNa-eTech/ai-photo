# Template Import Scripts - Summary

## 📋 Overview

Đã tạo hệ thống scripts để import templates từ file JSON vào backend database.

## 🎯 Scripts Created

### 1. **API-based Import** (Future use)
Các script này gọi API `/v1/admin/templates` - sẽ hoạt động khi admin endpoints được implement.

#### Bash Script
- **File:** `.box-testing/scripts/import_templates.sh`
- **Usage:** `./import_templates.sh [json_file]`
- **Features:**
  - ✅ Đơn giản, chỉ cần jq
  - ✅ Colored output
  - ✅ Error reporting
  - ⚠️ Sequential (không concurrent)

#### TypeScript Script (Advanced)
- **File:** `.box-testing/scripts/import_templates.ts`
- **Usage:** `npx ts-node import_templates.ts [options]`
- **Features:**
  - ✅ Batch import với concurrency
  - ✅ Auto retry với backoff
  - ✅ Dry-run mode
  - ✅ Progress tracking
  - ✅ Smart error handling

**Status:** ⏳ Chờ backend implement `/v1/admin/templates` POST endpoint

### 2. **Direct DB Import** (Current workaround)
Script import trực tiếp vào database qua Prisma.

#### TypeScript Script
- **File:** `server/scripts/import-from-json.ts`
- **Usage:** `cd server && yarn db:import:json [json_file]`
- **Features:**
  - ✅ Import trực tiếp vào DB
  - ✅ Upsert logic (create hoặc update)
  - ✅ Colored output
  - ✅ Error handling
  - ✅ Hoạt động ngay lập tức

**Status:** ✅ Sẵn sàng sử dụng

## 📄 Sample Data

**File:** `.box-testing/json/templates-sample.json`

5 templates mẫu:
1. Professional Headshot
2. Vintage Film Photography
3. Neon Cyberpunk Portrait
4. Watercolor Artist Style
5. Fantasy Character Design

## 🚀 Quick Start

### Import Templates Now (Direct DB)

```bash
cd server

# Import from default sample file
yarn db:import:json

# Import from custom file
npx ts-node scripts/import-from-json.ts ../path/to/your-templates.json
```

### Test API Scripts (When endpoints are ready)

```bash
# Bash
.box-testing/scripts/import_templates.sh

# TypeScript with dry-run
npx ts-node .box-testing/scripts/import_templates.ts --dry-run
```

## 📊 JSON Format

```json
[
  {
    "id": "unique-slug",
    "name": "Template Name",
    "thumbnailUrl": "http://localhost:8080/public/thumbnails/image.png",
    "publishedAt": "2024-01-15T00:00:00Z",
    "usageCount": 450
  }
]
```

**Required:** `id`, `name`  
**Optional:** `thumbnailUrl`, `publishedAt`, `usageCount`

## ⚙️ Configuration

Edit `.box-testing/sandbox/env.yaml`:

```yaml
idToken: Bearer dev-secret-token-123
apiBaseUrl: http://localhost:8080
```

## ✅ Test Results

### Direct DB Import Test (Success ✓)
```bash
$ cd server && yarn db:import:json

=== Import Templates from JSON ===

JSON File: /path/to/templates-sample.json
Templates to import: 5

✓ Connected to database

[1/5] Professional Headshot                    ✓
[2/5] Vintage Film Photography                 ✓
[3/5] Neon Cyberpunk Portrait                  ✓
[4/5] Watercolor Artist Style                  ✓
[5/5] Fantasy Character Design                 ✓

=== Import Summary ===

✓ Success: 5
✗ Failed: 0
Total: 5

✓ All templates imported successfully!
```

### API Import Test (404 - Expected)
```bash
$ .box-testing/scripts/import_templates.sh

=== Template Import Script ===
JSON File: .box-testing/json/templates-sample.json
API URL: http://localhost:8080/v1/admin/templates

Found 5 templates to import

[1/5] Importing: Professional Headshot (ID: professional-headshot)
  ✗ Failed (HTTP 404)
  Response: Cannot POST /v1/admin/templates

...

=== Import Summary ===
Success: 0
Failed: 5
Total: 5
```

**Note:** Lỗi 404 là expected vì admin endpoints chưa được implement.

## 📁 Files Created

```
.box-testing/
├── json/
│   └── templates-sample.json              # Sample data (5 templates)
├── scripts/
│   ├── import_templates.sh                # Bash API import
│   ├── import_templates.ts                # TypeScript API import (advanced)
│   └── README-IMPORT.md                   # Documentation
└── IMPORT-SUMMARY.md                      # This file

server/
├── scripts/
│   └── import-from-json.ts                # Direct DB import (working)
└── package.json                           # Added: db:import:json script
```

## 🎯 Recommendations

### For Development (Now)
Use direct DB import:
```bash
cd server
yarn db:import:json path/to/templates.json
```

### For Production (Future)
When admin API endpoints are ready:
```bash
npx ts-node .box-testing/scripts/import_templates.ts \
  --file production-templates.json \
  --batch-size 5 \
  --retry 3
```

## 🔮 Future Enhancements

- [ ] Implement `/v1/admin/templates` POST endpoint
- [ ] Add thumbnail upload support
- [ ] JSON schema validation
- [ ] Export templates to JSON
- [ ] Bulk update support
- [ ] Template assets import
- [ ] Progress persistence (resume failed imports)
- [ ] Web UI for import/export

## 📚 Documentation

Full documentation: `.box-testing/scripts/README-IMPORT.md`

## 🔗 Related

- `seed-demo.ts` - Seed 10 demo templates
- `test_create_template.sh` - Test single template creation
- Backend: `server/README-DEMO-TEMPLATES.md`

