#!/usr/bin/env bash
# Simple smoke tests for Fake Stock API
set -euo pipefail
BASE_URL=${BASE_URL:-http://localhost:3000/api}

function log() { printf "\033[1;34m[TEST]\033[0m %s\n" "$1"; }

log "Checking /api/ping"
RESP=$(curl -s "$BASE_URL/ping")
echo "$RESP" | jq . || echo "Response: $RESP"

log "Listing stocks"
RESP=$(curl -s "$BASE_URL/stocks")
echo "$RESP" | jq . || echo "Response: $RESP"

SYM="WAYNE"
log "Fetching price for $SYM"
RESP=$(curl -s "$BASE_URL/stocks/$SYM")
echo "$RESP" | jq . || echo "Response: $RESP"

log "Creating BUY order for $SYM"
ORDER=$(curl -s -X POST "$BASE_URL/orders" -H 'Content-Type: application/json' \
  -d '{"symbol":"'$SYM'","side":"BUY","quantity":10,"price":105}' || echo "{}")
echo "Order response: $ORDER"
ORDER_ID=$(echo "$ORDER" | jq -r .id 2>/dev/null || echo "no-id")

if [ "$ORDER_ID" != "no-id" ] && [ "$ORDER_ID" != "null" ]; then
  log "Getting order $ORDER_ID"
  RESP=$(curl -s "$BASE_URL/orders/$ORDER_ID")
  echo "$RESP" | jq . || echo "Response: $RESP"
else
  log "Skipping order lookup (no valid order ID)"
fi

log "Test completed"
