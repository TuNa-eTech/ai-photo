# Workflow — Backend Dev & Ops Runbook

Trạng thái: Draft  
Phiên bản: 1.0  
Cập nhật: 2025-10-20

Tài liệu này hướng dẫn chạy, migrate, seed, build, và verify backend. Áp dụng cho môi trường local Docker Compose.

---

## 1) Thành phần & biến môi trường

- Services:
  - db: Postgres 15 (container name: `imageaiwrapper-db`)
  - backend: Go service (container name: `imageaiwrapper-backend`)
- Biến quan trọng:
  - DB_HOST=db, DB_PORT=5432, DB_USER=imageai, DB_PASSWORD=imageai_pass, DB_NAME=imageai_db
  - TEMPLATE_SOURCE=db|file (db khuyến nghị)
  - (Optional) FIREBASE_SERVICE_ACCOUNT=/path/to/service-account.json

Docker Compose đã set `TEMPLATE_SOURCE=db` ở `docker/docker-compose.yml`.

---

## 2) Khởi động & dừng hệ thống

Down/Up toàn bộ với build lại:
```bash
cd docker
docker compose down --remove-orphans
docker compose up -d --build
docker compose ps
docker logs --tail 100 imageaiwrapper-backend
```

Gỡ warning “version is obsolete”: có thể xoá dòng `version: "3.8"` khỏi docker-compose (không ảnh hưởng chức năng).

---

## 3) Migrations (containerized golang-migrate)

Chạy DB:
```bash
cd docker
docker compose up -d db
```

Áp dụng migrations (map vào namespace container DB):
```bash
docker run --rm \
  -v "$(pwd)/../backend/migrations:/migrations" \
  --network container:imageaiwrapper-db \
  migrate/migrate:latest \
  -path=/migrations \
  -database "postgres://imageai:imageai_pass@localhost:5432/imageai_db?sslmode=disable" up
```

Kiểm tra bảng:
```bash
docker exec -e PGPASSWORD=imageai_pass -it imageaiwrapper-db \
  psql -U imageai -d imageai_db -c "\dt"
```

---

## 4) Seed Templates

Nguồn JSON: `backend/templates.json`

A) Seed bằng seed tool (chạy từ host):
```bash
cd backend
go build -o seed-templates ./cmd/seed-templates
DATABASE_URL="postgres://imageai:imageai_pass@127.0.0.1:5432/imageai_db?sslmode=disable" \
  ./seed-templates -file templates.json -publish=true -visibility=public
```

B) Seed nhanh bằng psql DO block:
```bash
cd docker
docker exec -i -e PGPASSWORD=imageai_pass imageaiwrapper-db psql -U imageai -d imageai_db <<'SQL'
-- (DO block import 2 templates example/cartoon, set current_version_id)
DO $$
DECLARE
  t1 uuid; v1 uuid;
  t2 uuid; v2 uuid;
BEGIN
  INSERT INTO templates (slug, name, description, status, visibility, model_provider, model_name, created_at, updated_at, published_at)
  VALUES ('example','Example Template',NULL,'published','public','gemini','gemini-1.5-pro', NOW(), NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    visibility = EXCLUDED.visibility,
    model_provider = EXCLUDED.model_provider,
    model_name = EXCLUDED.model_name,
    status = EXCLUDED.status,
    updated_at = NOW(),
    published_at = COALESCE(EXCLUDED.published_at, templates.published_at)
  RETURNING id INTO t1;

  INSERT INTO template_versions (template_id, version, prompt_template, negative_prompt, prompt_variables, model_parameters, input_requirements, output_mime, created_at)
  VALUES (t1, 1, 'Apply artistic style', NULL, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'image/png', NOW())
  ON CONFLICT (template_id, version) DO UPDATE SET
    prompt_template = EXCLUDED.prompt_template
  RETURNING id INTO v1;

  UPDATE templates SET current_version_id = v1, updated_at = NOW() WHERE id = t1;

  INSERT INTO templates (slug, name, description, status, visibility, model_provider, model_name, created_at, updated_at, published_at)
  VALUES ('cartoon','Cartoon Style',NULL,'published','public','gemini','gemini-1.5-pro', NOW(), NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    visibility = EXCLUDED.visibility,
    model_provider = EXCLUDED.model_provider,
    model_name = EXCLUDED.model_name,
    status = EXCLUDED.status,
    updated_at = NOW(),
    published_at = COALESCE(EXCLUDED.published_at, templates.published_at)
  RETURNING id INTO t2;

  INSERT INTO template_versions (template_id, version, prompt_template, negative_prompt, prompt_variables, model_parameters, input_requirements, output_mime, created_at)
  VALUES (t2, 1, 'Transform the image into a vibrant cartoon illustration', NULL, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'image/png', NOW())
  ON CONFLICT (template_id, version) DO UPDATE SET
    prompt_template = EXCLUDED.prompt_template
  RETURNING id INTO v2;

  UPDATE templates SET current_version_id = v2, updated_at = NOW() WHERE id = t2;
END $$;
SQL
```

Kiểm tra dữ liệu:
```bash
docker exec -e PGPASSWORD=imageai_pass -it imageaiwrapper-db \
  psql -U imageai -d imageai_db -c \
  "SELECT slug,name,(current_version_id IS NOT NULL) AS has_current FROM templates ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT 10;"
```

---

## 5) Build & Deploy backend container (runtime image)

Do Docker Hub có thể 503 khi pull golang, dùng runtime image `FROM scratch`:

1) Build static binary cho Linux:
```bash
cd backend
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o build/imageai-backend ./cmd/api
```

2) Build & up container runtime:
```bash
cd docker
docker compose up -d --build backend
```

3) Logs & status:
```bash
docker compose ps
docker logs --tail 100 imageaiwrapper-backend
```

---

## 6) Verify API

List templates (envelope):
```bash
curl -s http://localhost:8080/v1/templates | jq .
```

Kết quả kỳ vọng:
```json
{
  "success": true,
  "data": {
    "templates": [
      { "id": "example", "name": "Example Template" },
      { "id": "cartoon", "name": "Cartoon Style" }
    ]
  },
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

Nếu bật Firebase Admin (bảo vệ): thêm header Authorization Bearer `<idToken>`.

---

## 7) Troubleshooting nhanh

- Cannot pull golang:1.25-alpine (503):
  - Dùng `Dockerfile.runtime` + static binary như trên.
- Seed tool nhận “password authentication failed”:
  - Kiểm tra `DATABASE_URL` (127.0.0.1 vs ::1 vs localhost)
  - Hoặc seed bằng DO block psql trong DB container.
- /v1/templates trả rỗng:
  - Chưa seed DB hoặc `TEMPLATE_SOURCE` chưa là `db`.
  - Kiểm tra logs backend & SELECT từ Postgres.
