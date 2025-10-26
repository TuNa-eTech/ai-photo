# Template Import Examples

## Example 1: Import Sample Templates

**Goal:** Import 5 sample templates to test the system

**Steps:**
```bash
cd server
yarn db:import:json
```

**Result:**
```
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

**Verify:**
- Web CMS: http://localhost:5173 shows 5 new templates
- API: `curl http://localhost:8080/v1/templates -H "Authorization: Bearer dev"`

---

## Example 2: Import Custom Templates

**Goal:** Import your own templates

**Step 1:** Create JSON file
```bash
cat > my-templates.json <<'EOF'
[
  {
    "id": "anime-style-v2",
    "name": "Anime Style V2",
    "thumbnailUrl": "http://localhost:8080/public/thumbnails/anime.png",
    "publishedAt": "2024-10-26T00:00:00Z",
    "usageCount": 50
  },
  {
    "id": "realistic-photo",
    "name": "Realistic Photo Enhancement",
    "usageCount": 120
  }
]
EOF
```

**Step 2:** Import
```bash
cd server
npx ts-node scripts/import-from-json.ts ../my-templates.json
```

**Result:**
```
=== Import Templates from JSON ===

JSON File: /path/to/my-templates.json
Templates to import: 2

✓ Connected to database

[1/2] Anime Style V2                           ✓
[2/2] Realistic Photo Enhancement              ✓

=== Import Summary ===

✓ Success: 2
✗ Failed: 0
Total: 2

✓ All templates imported successfully!
```

---

## Example 3: Update Existing Templates

**Goal:** Update usage counts and other fields

**Scenario:** Template "anime-style-v2" now has 500 usages

**Step 1:** Update JSON
```json
[
  {
    "id": "anime-style-v2",
    "name": "Anime Style V2 (Updated)",
    "usageCount": 500
  }
]
```

**Step 2:** Import (upsert)
```bash
cd server
npx ts-node scripts/import-from-json.ts ../update-templates.json
```

**Result:** Template is updated, not duplicated (thanks to upsert logic)

---

## Example 4: Batch Import 100 Templates

**Goal:** Import many templates at once

**Step 1:** Generate or prepare large JSON
```bash
# Example: 100 templates
cat > large-batch.json <<'EOF'
[
  {"id": "style-001", "name": "Style 001", "usageCount": 10},
  {"id": "style-002", "name": "Style 002", "usageCount": 20},
  ... (98 more)
]
EOF
```

**Step 2:** Import
```bash
cd server
npx ts-node scripts/import-from-json.ts ../large-batch.json
```

**Performance:** ~200ms per template, sequential

---

## Example 5: Dry Run Before Import (API Script)

**Goal:** Preview what will be imported without actually importing

**Command:**
```bash
npx ts-node .box-testing/scripts/import_templates.ts \
  --file .box-testing/json/templates-sample.json \
  --dry-run
```

**Result:**
```
=== Template Import Script ===

JSON File: .box-testing/json/templates-sample.json
API URL: http://localhost:8080/v1/admin/templates
Templates: 5
Batch Size: 3
Retry Attempts: 2
Dry Run: YES

📋 Dry run mode - Templates to import:
  1. Professional Headshot (professional-headshot)
  2. Vintage Film Photography (vintage-film)
  3. Neon Cyberpunk Portrait (neon-cyberpunk)
  4. Watercolor Artist Style (watercolor-artist)
  5. Fantasy Character Design (fantasy-character)

✓ Dry run completed
```

---

## Example 6: Import with Bash Script

**Goal:** Use simple bash script for quick imports

**Command:**
```bash
.box-testing/scripts/import_templates.sh path/to/templates.json
```

**Note:** Currently returns 404 because `/v1/admin/templates` POST is not implemented

**Expected when endpoint is ready:**
```
=== Template Import Script ===
JSON File: templates.json
API URL: http://localhost:8080/v1/admin/templates

Found 5 templates to import

[1/5] Importing: Professional Headshot (ID: professional-headshot)
  ✓ Success (HTTP 201)
[2/5] Importing: Vintage Film Photography (ID: vintage-film)
  ✓ Success (HTTP 201)
...

=== Import Summary ===
Success: 5
Failed: 0
Total: 5
```

---

## Example 7: Verify Import via API

**Check templates exist:**
```bash
# Get all templates
curl http://localhost:8080/v1/templates \
  -H "Authorization: Bearer dev" | jq

# Search by name
curl 'http://localhost:8080/v1/templates?q=Anime' \
  -H "Authorization: Bearer dev" | jq

# Sort by popularity
curl 'http://localhost:8080/v1/templates?sort=popular' \
  -H "Authorization: Bearer dev" | jq
```

---

## Example 8: Import Then Verify in Web CMS

**Full workflow:**
```bash
# 1. Import
cd server
yarn db:import:json

# 2. Start backend (if not running)
yarn start:dev

# 3. Start web-cms (in new terminal)
cd ../web-cms
yarn dev

# 4. Open browser
# http://localhost:5173

# 5. Login with DevAuth
# Email: dev@example.com

# 6. See templates in list
```

---

## Example 9: Reset and Re-import

**Goal:** Start fresh with new data

**Commands:**
```bash
cd server

# WARNING: This deletes ALL data
npx prisma migrate reset

# Import demo templates
yarn db:seed:demo

# Or import from JSON
yarn db:import:json
```

---

## Example 10: Import Validation

**Goal:** Handle invalid JSON gracefully

**Bad JSON:**
```json
[
  {
    "name": "No ID Template"
  }
]
```

**Result:**
```
[1/1] No ID Template                           ✗
  Error: Unique constraint failed on the fields: (`id`)
```

**Fix:** Always include `id` field (required)

---

## Common Patterns

### Pattern 1: Development Data
```bash
# Small set for testing
cd server
yarn db:import:json ../.box-testing/json/templates-sample.json
```

### Pattern 2: Production Migration
```bash
# Export from old system to JSON
# Then import to new system
cd server
npx ts-node scripts/import-from-json.ts ../prod-templates.json
```

### Pattern 3: Staging Data
```bash
# Create staging-specific templates
cd server
npx ts-node scripts/import-from-json.ts ../staging-templates.json
```

---

## Tips

1. **Always backup before import**
   ```bash
   pg_dump imageai_db > backup.sql
   ```

2. **Use upsert for idempotent imports**
   - Script uses `upsert` so safe to run multiple times
   - Updates existing templates instead of creating duplicates

3. **Validate JSON before import**
   ```bash
   jq empty templates.json && echo "Valid JSON"
   ```

4. **Test with small dataset first**
   ```bash
   # Test with 1-2 templates
   # Then scale up
   ```

5. **Monitor import progress**
   - Scripts show real-time progress
   - Check for errors immediately

