#!/bin/bash

# Script import Templates từ file JSON qua API
# Usage: ./import_templates.sh [json_file]
# Default: .box-testing/json/templates-sample.json

set -e  # Exit on error

# --------- Colors for output ---------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# --------- Configuration ---------
ENV_FILE=".box-testing/sandbox/env.yaml"
JSON_FILE="${1:-.box-testing/json/templates-sample.json}"

# Check if JSON file exists
if [ ! -f "$JSON_FILE" ]; then
  echo -e "${RED}Error: JSON file not found: $JSON_FILE${NC}"
  echo "Usage: $0 [json_file]"
  exit 1
fi

# --------- Read config from env.yaml ---------
API_BASE_URL=$(grep '^apiBaseUrl:' "$ENV_FILE" | cut -d':' -f2- | xargs)
if [ -z "$API_BASE_URL" ]; then
  API_BASE_URL="http://localhost:8080"
fi

ID_TOKEN=$(grep '^idToken:' "$ENV_FILE" | cut -d':' -f2- | xargs)
if [ -z "$ID_TOKEN" ]; then
  echo -e "${RED}Error: idToken not found in $ENV_FILE${NC}"
  exit 1
fi

API_URL="$API_BASE_URL/v1/admin/templates"

echo -e "${BLUE}=== Template Import Script ===${NC}"
echo "JSON File: $JSON_FILE"
echo "API URL: $API_URL"
echo ""

# --------- Check if jq is installed ---------
if ! command -v jq &> /dev/null; then
  echo -e "${RED}Error: jq is not installed${NC}"
  echo "Install with: brew install jq"
  exit 1
fi

# --------- Read and validate JSON ---------
if ! jq empty "$JSON_FILE" 2>/dev/null; then
  echo -e "${RED}Error: Invalid JSON format in $JSON_FILE${NC}"
  exit 1
fi

TEMPLATES=$(cat "$JSON_FILE")
TEMPLATE_COUNT=$(echo "$TEMPLATES" | jq 'length')

echo -e "${BLUE}Found $TEMPLATE_COUNT templates to import${NC}"
echo ""

# --------- Import each template ---------
SUCCESS_COUNT=0
ERROR_COUNT=0

for i in $(seq 0 $(($TEMPLATE_COUNT - 1))); do
  TEMPLATE=$(echo "$TEMPLATES" | jq ".[$i]")
  
  TEMPLATE_ID=$(echo "$TEMPLATE" | jq -r '.id')
  TEMPLATE_NAME=$(echo "$TEMPLATE" | jq -r '.name')
  
  echo -e "${YELLOW}[$((i+1))/$TEMPLATE_COUNT]${NC} Importing: $TEMPLATE_NAME (ID: $TEMPLATE_ID)"
  
  # Send POST request
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
    -H "Authorization: $ID_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$TEMPLATE")
  
  # Parse response
  HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  
  if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo -e "  ${GREEN}✓ Success (HTTP $HTTP_CODE)${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo -e "  ${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
    echo "  Response: $HTTP_BODY"
    ERROR_COUNT=$((ERROR_COUNT + 1))
  fi
  
  # Small delay to avoid rate limiting
  sleep 0.2
done

echo ""
echo -e "${BLUE}=== Import Summary ===${NC}"
echo -e "${GREEN}Success: $SUCCESS_COUNT${NC}"
echo -e "${RED}Failed: $ERROR_COUNT${NC}"
echo -e "Total: $TEMPLATE_COUNT"

if [ $ERROR_COUNT -eq 0 ]; then
  echo -e "${GREEN}All templates imported successfully!${NC}"
  exit 0
else
  echo -e "${YELLOW}Some templates failed to import. Check the errors above.${NC}"
  exit 1
fi

