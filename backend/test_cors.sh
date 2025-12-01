#!/bin/bash

echo "=========================================="
echo "Testing CORS Configuration"
echo "=========================================="
echo ""

# Test 1: Health check
echo "Test 1: Health Check (GET /health)"
curl -s http://localhost:5000/health | python3 -m json.tool
echo ""

# Test 2: OPTIONS preflight for login
echo "Test 2: OPTIONS Preflight for /api/auth/login"
echo "Request:"
echo "  Origin: http://localhost:3000"
echo "  Method: OPTIONS"
echo ""
echo "Response Headers:"
curl -s -X OPTIONS http://localhost:5000/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v 2>&1 | grep -i "< access-control"
echo ""

# Test 3: Actual POST to login (will fail with 400 but we can see CORS headers)
echo "Test 3: POST to /api/auth/login (checking CORS headers)"
echo "Response Headers:"
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -v 2>&1 | grep -i "< access-control"
echo ""

echo "=========================================="
echo "If you see Access-Control-* headers above,"
echo "CORS is working correctly!"
echo "=========================================="
