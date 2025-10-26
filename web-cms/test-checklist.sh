#!/bin/bash

# Test Checklist Script for Web CMS
# This script verifies all functionality items

set -e

echo "================================================"
echo "🧪 Web CMS - Test Checklist"
echo "================================================"
echo ""

PORT=5175
BASE_URL="http://localhost:${PORT}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() {
    echo -e "${GREEN}✓${NC} $1"
}

fail() {
    echo -e "${RED}✗${NC} $1"
}

info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Test 1: Dev server running
echo "1️⃣  Checking dev server..."
if curl -s -o /dev/null -w "%{http_code}" ${BASE_URL} | grep -q "200"; then
    pass "Dev server running at ${BASE_URL}"
else
    fail "Dev server NOT responding at ${BASE_URL}"
    exit 1
fi
echo ""

# Test 2: Index.html loads
echo "2️⃣  Checking HTML structure..."
if curl -s ${BASE_URL} | grep -q "root"; then
    pass "Index.html loads with root div"
else
    fail "Index.html structure issue"
fi

if curl -s ${BASE_URL} | grep -q "main.tsx"; then
    pass "React entry point (main.tsx) referenced"
else
    fail "main.tsx not found in HTML"
fi
echo ""

# Test 3: Static assets
echo "3️⃣  Checking static assets..."
if curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/src/main.tsx | grep -q "200"; then
    pass "main.tsx accessible"
else
    fail "main.tsx not accessible"
fi
echo ""

# Test 4: Environment check
echo "4️⃣  Checking environment configuration..."
if [ -f ".env.local" ]; then
    pass ".env.local exists"
    
    if grep -q "VITE_DEV_AUTH=1" .env.local; then
        pass "DevAuth enabled (VITE_DEV_AUTH=1)"
    else
        info "DevAuth not enabled in .env.local"
    fi
    
    if grep -q "VITE_API_BASE_URL" .env.local; then
        pass "API base URL configured"
    fi
else
    fail ".env.local not found"
fi
echo ""

# Test 5: TypeScript compilation
echo "5️⃣  Checking TypeScript compilation..."
if yarn tsc -b --dry-run 2>&1 | grep -q "error"; then
    fail "TypeScript errors found"
else
    pass "TypeScript compilation OK"
fi
echo ""

# Test 6: Build test
echo "6️⃣  Testing production build..."
info "Building for production..."
if yarn build > /tmp/build.log 2>&1; then
    pass "Production build successful"
    
    # Check dist files
    if [ -f "dist/index.html" ]; then
        pass "dist/index.html created"
    fi
    
    # Check bundle size
    if [ -d "dist/assets" ]; then
        BUNDLE_SIZE=$(du -sh dist/assets | cut -f1)
        info "Bundle size: ${BUNDLE_SIZE}"
    fi
else
    fail "Production build failed"
    cat /tmp/build.log
fi
echo ""

# Test 7: Source structure
echo "7️⃣  Checking source code structure..."
REQUIRED_FILES=(
    "src/main.tsx"
    "src/App.tsx"
    "src/types/index.ts"
    "src/api/client.ts"
    "src/api/templates.ts"
    "src/auth/useAuth.ts"
    "src/auth/ProtectedRoute.tsx"
    "src/pages/Login/LoginPage.tsx"
    "src/pages/Templates/TemplatesListPage.tsx"
    "src/router/routes.tsx"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        pass "$file exists"
    else
        fail "$file missing"
    fi
done
echo ""

# Test 8: Dependencies
echo "8️⃣  Checking key dependencies..."
REQUIRED_DEPS=(
    "react"
    "react-dom"
    "react-router-dom"
    "@tanstack/react-query"
    "axios"
    "@mui/material"
    "firebase"
)

for dep in "${REQUIRED_DEPS[@]}"; do
    if grep -q "\"${dep}\"" package.json; then
        pass "$dep installed"
    else
        fail "$dep not found in package.json"
    fi
done
echo ""

# Summary
echo "================================================"
echo "✅ Test Checklist Complete!"
echo "================================================"
echo ""
echo "📝 Manual Testing Required:"
echo "   1. Open ${BASE_URL} in browser"
echo "   2. Verify login page shows DevAuth mode"
echo "   3. Click 'Sign in (DevAuth)'"
echo "   4. Check redirect to /templates"
echo "   5. Verify email (dev@example.com) shows"
echo "   6. Test logout functionality"
echo "   7. Check browser console for errors"
echo ""
echo "🌐 Dev Server: ${BASE_URL}"
echo "📦 Build Output: ./dist/"
echo ""

