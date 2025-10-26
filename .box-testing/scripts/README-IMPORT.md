# Template Import Scripts

Scripts để import templates từ file JSON vào backend qua API.

## Files

1. **`import_templates.sh`** - Bash script (đơn giản, không cần dependencies)
2. **`import_templates.ts`** - TypeScript script (nâng cao, nhiều features)
3. **`templates-sample.json`** - File JSON mẫu với 5 templates

## Setup

### Bash Script (Recommended for quick use)

```bash
# Cài đặt jq (nếu chưa có)
brew install jq

# Chạy script
cd /path/to/ImageAIWraper
.box-testing/scripts/import_templates.sh
```

### TypeScript Script (Recommended for advanced usage)

```bash
# Cài đặt dependencies
npm install -g ts-node typescript
npm install axios yaml

# Hoặc dùng project dependencies
cd /path/to/ImageAIWraper
# (nếu chưa có package.json trong root, tạo một cái)
```

## Usage

### 1. Bash Script

**Basic usage:**
```bash
# Import từ file mặc định (templates-sample.json)
.box-testing/scripts/import_templates.sh

# Import từ file khác
.box-testing/scripts/import_templates.sh path/to/your/templates.json
```

**Features:**
- ✅ Đơn giản, không cần dependencies (chỉ cần jq)
- ✅ Colored output
- ✅ Success/Error counting
- ✅ HTTP status code reporting
- ⚠️  Sequential import (không có concurrency)

### 2. TypeScript Script

**Basic usage:**
```bash
# Import từ file mặc định
npx ts-node .box-testing/scripts/import_templates.ts

# Dry run (xem preview mà không import)
npx ts-node .box-testing/scripts/import_templates.ts --dry-run

# Import từ file khác
npx ts-node .box-testing/scripts/import_templates.ts --file path/to/templates.json

# Import với 5 concurrent requests
npx ts-node .box-testing/scripts/import_templates.ts --batch-size 5

# Import với 3 retry attempts
npx ts-node .box-testing/scripts/import_templates.ts --retry 3
```

**Full options:**
```bash
npx ts-node .box-testing/scripts/import_templates.ts \
  --file .box-testing/json/my-templates.json \
  --env .box-testing/sandbox/env.yaml \
  --batch-size 5 \
  --retry 3 \
  --dry-run
```

**Features:**
- ✅ Batch import với concurrency
- ✅ Automatic retry với exponential backoff
- ✅ Progress bar
- ✅ Detailed error reporting
- ✅ Dry-run mode
- ✅ Smart retry logic (không retry 4xx errors trừ 429)
- ✅ Colored output với emojis

## JSON Format

File JSON phải là array của templates:

```json
[
  {
    "id": "template-slug",
    "name": "Template Name",
    "thumbnailUrl": "http://localhost:8080/public/thumbnails/image.png",
    "publishedAt": "2024-01-15T00:00:00Z",
    "usageCount": 450
  },
  ...
]
```

**Required fields:**
- `id` - Unique slug/ID của template
- `name` - Tên hiển thị

**Optional fields:**
- `thumbnailUrl` - URL của thumbnail
- `publishedAt` - ISO 8601 datetime
- `usageCount` - Số lượt sử dụng (số nguyên)

## Configuration

Script đọc config từ `.box-testing/sandbox/env.yaml`:

```yaml
idToken: Bearer dev-secret-token-123
apiBaseUrl: http://localhost:8080
```

**Notes:**
- `idToken` phải bao gồm "Bearer " prefix
- Backend phải đang chạy trên `apiBaseUrl`
- DevAuth phải được enable (`DEV_AUTH_ENABLED=1` trong backend)

## Examples

### Example 1: Import sample templates

```bash
# Bash
.box-testing/scripts/import_templates.sh

# TypeScript
npx ts-node .box-testing/scripts/import_templates.ts
```

### Example 2: Dry run to preview

```bash
npx ts-node .box-testing/scripts/import_templates.ts --dry-run
```

Output:
```
=== Template Import Script ===

JSON File: .box-testing/json/templates-sample.json
API URL: http://localhost:8080/v1/admin/templates
Templates: 5
Dry Run: YES

📋 Dry run mode - Templates to import:
  1. Professional Headshot (professional-headshot)
  2. Vintage Film Photography (vintage-film)
  3. Neon Cyberpunk Portrait (neon-cyberpunk)
  4. Watercolor Artist Style (watercolor-artist)
  5. Fantasy Character Design (fantasy-character)

✓ Dry run completed
```

### Example 3: Fast batch import

```bash
npx ts-node .box-testing/scripts/import_templates.ts \
  --batch-size 10 \
  --retry 1
```

### Example 4: Import với custom file

```bash
# Tạo file JSON của bạn
cat > my-templates.json <<EOF
[
  {
    "id": "my-style-1",
    "name": "My Custom Style"
  },
  {
    "id": "my-style-2",
    "name": "Another Style"
  }
]
EOF

# Import
.box-testing/scripts/import_templates.sh my-templates.json
```

## Troubleshooting

### Error: jq not found (Bash)
```bash
brew install jq
```

### Error: ts-node not found (TypeScript)
```bash
npm install -g ts-node typescript
```

### Error: Cannot find module 'axios'
```bash
# Trong project root hoặc script folder
npm install axios yaml
# hoặc
yarn add axios yaml
```

### Error: 401 Unauthorized
- Check `idToken` trong `env.yaml`
- Đảm bảo backend đang chạy với DevAuth enabled
- Token phải có "Bearer " prefix

### Error: 404 Not Found
- Backend endpoint `/v1/admin/templates` chưa được implement
- Hiện tại backend chỉ có `/v1/templates` (read-only)
- Cần implement admin CRUD endpoints trước

### Error: Connection refused
- Backend chưa chạy hoặc chạy trên port khác
- Check `apiBaseUrl` trong `env.yaml`
- Chạy backend: `cd server && yarn start:dev`

## Backend Requirements

⚠️ **IMPORTANT:** Hiện tại backend chưa có endpoint `/v1/admin/templates` POST.

### Workaround: Direct Database Import

Sử dụng script `import-from-json.ts` để import trực tiếp vào database:

```bash
cd server

# Import từ file mặc định
yarn db:import:json

# Import từ file khác
npx ts-node scripts/import-from-json.ts path/to/templates.json
```

**Hoặc sử dụng demo seed:**
```bash
cd server
yarn db:seed:demo
```

## Future Improvements

- [ ] Support cho upload thumbnails cùng lúc
- [ ] Validate JSON schema trước khi import
- [ ] Export templates từ backend ra JSON
- [ ] Update existing templates (upsert logic)
- [ ] Import template versions, tags, assets
- [ ] Parallel uploads cho thumbnails
- [ ] Resume failed imports

## Related Scripts

- `test_create_template.sh` - Test tạo 1 template
- `test_upload_template_asset.sh` - Test upload asset
- `seed-demo.ts` (trong server/scripts/) - Seed trực tiếp vào DB

## Notes

- Scripts sử dụng POST API, không phải direct DB access
- Phù hợp cho testing và data migration
- Nên test với `--dry-run` trước khi import thật
- Có thể chạy nhiều lần (idempotent nếu backend hỗ trợ upsert)

