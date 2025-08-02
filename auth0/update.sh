#!/usr/bin/env bash
# DemoTradePro Auth0 Update Script
# Run this to apply Terraform changes and regenerate environment files

set -euo pipefail

echo "🔄 DemoTradePro Auth0 Configuration Update"
echo "=========================================="

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "Step 1: Apply Terraform Changes..."
echo "---------------------------------"
cd terraform
terraform apply -auto-approve

echo ""
echo "Step 2: Regenerate Environment Files..."
echo "--------------------------------------"
cd ../scripts
echo "Updating Web App environment..."
./generate-web-env.sh

echo "Updating API Server environment..."
./generate-api-env.sh

echo ""
echo "✅ DemoTradePro Auth0 Configuration Updated!"
echo "==========================================="
echo ""
echo "🔄 Restart your applications to pick up any environment changes:"
echo "1. API server: cd ../apps/api-server && pnpm dev"
echo "2. Web app: cd ../apps/web && pnpm dev"
echo ""
