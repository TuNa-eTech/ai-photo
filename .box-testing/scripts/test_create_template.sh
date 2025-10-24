#!/bin/bash

# Script test API tạo Template (metadata) cho ImageAIWraper Admin
# Đọc idToken từ .box-testing/sandbox/env.yaml

# --------- Cấu hình biến ---------
ENV_FILE=".box-testing/sandbox/env.yaml"
# Đọc API_BASE_URL từ env.yaml nếu có, không thì dùng mặc định
API_BASE_URL=$(grep '^apiBaseUrl:' "$ENV_FILE" | cut -d':' -f2- | xargs)
if [ -z "$API_BASE_URL" ]; then
  API_BASE_URL="http://localhost:8080"
fi
API_URL="$API_BASE_URL/v1/admin/templates"

# Thông tin template test (có thể sửa lại)
TEMPLATE_SLUG="test-template-$(date +%s)"
LAST_SLUG_FILE=".box-testing/scripts/last_template_slug.txt"
TEMPLATE_NAME="Test Template"
TEMPLATE_TAGS='["demo","test"]'
TEMPLATE_STATUS="draft"
TEMPLATE_VISIBILITY="private"

# --------- Đọc idToken từ env.yaml ---------
ID_TOKEN=$(grep '^idToken:' "$ENV_FILE" | cut -d':' -f2- | xargs)

if [ -z "$ID_TOKEN" ]; then
  echo "Không tìm thấy idToken trong $ENV_FILE"
  exit 1
fi

# --------- Gửi request tạo template ---------
echo "==> Gửi request tạo Template: $TEMPLATE_SLUG"
echo "$TEMPLATE_SLUG" > "$LAST_SLUG_FILE"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Authorization: $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "'"$TEMPLATE_SLUG"'",
    "name": "'"$TEMPLATE_NAME"'",
    "tags": '"$TEMPLATE_TAGS"',
    "status": "'"$TEMPLATE_STATUS"'",
    "visibility": "'"$TEMPLATE_VISIBILITY"'"
  }')

# Tách body và status code
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

echo "Status code: $HTTP_CODE"
echo "Response:"
echo "$HTTP_BODY"
