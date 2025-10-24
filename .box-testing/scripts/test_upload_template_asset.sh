#!/bin/bash

# Script test API upload file ảnh cho Template (ImageAIWraper Admin)
# Đọc idToken từ .box-testing/sandbox/env.yaml

# --------- Cấu hình biến ---------
ENV_FILE=".box-testing/sandbox/env.yaml"
# Đọc API_BASE_URL từ env.yaml nếu có, không thì dùng mặc định
API_BASE_URL=$(grep '^apiBaseUrl:' "$ENV_FILE" | cut -d':' -f2- | xargs)
if [ -z "$API_BASE_URL" ]; then
  API_BASE_URL="http://localhost:8080"
fi

# Thông tin test (có thể sửa lại)
LAST_SLUG_FILE=".box-testing/scripts/last_template_slug.txt"
if [ -f "$LAST_SLUG_FILE" ]; then
  TEMPLATE_SLUG=$(cat "$LAST_SLUG_FILE")
else
  TEMPLATE_SLUG="test-template-upload"   # fallback nếu chưa có file slug
fi
IMAGE_PATH=".box-testing/images/test_img.png"   # Đường dẫn file ảnh test (PNG/JPG)
ASSET_KIND="thumbnail"                 # thumbnail | preview

# --------- Đọc idToken từ env.yaml ---------
ID_TOKEN=$(grep '^idToken:' "$ENV_FILE" | cut -d':' -f2- | xargs)

if [ -z "$ID_TOKEN" ]; then
  echo "Không tìm thấy idToken trong $ENV_FILE"
  exit 1
fi

if [ ! -f "$IMAGE_PATH" ]; then
  echo "Không tìm thấy file ảnh: $IMAGE_PATH"
  exit 1
fi

API_URL="$API_BASE_URL/v1/admin/templates/$TEMPLATE_SLUG/assets"

echo "==> Upload file ảnh ($IMAGE_PATH) cho Template: $TEMPLATE_SLUG"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Authorization: $ID_TOKEN" \
  -F "file=@$IMAGE_PATH" \
  -F "kind=$ASSET_KIND")

# Tách body và status code
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

echo "Status code: $HTTP_CODE"
echo "Response:"
echo "$HTTP_BODY"
