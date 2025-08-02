#!/usr/bin/env bash
# DemoTradePro Auth0 Initial Setup Script
# Run this once to set up Auth0 configuration from scratch

set -euo pipefail

echo "🚀 DemoTradePro Auth0 Initial Setup"
echo "=================================="

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "Step 1: Generate Auth0 Management Client..."
echo "-------------------------------------------"
cd scripts
./generate-auth-management-client.sh

echo ""
echo "Step 2: Initialize Terraform..."
echo "------------------------------"
cd ../terraform
terraform init

echo ""
echo "Step 3: Apply Terraform Configuration..."
echo "---------------------------------------"
terraform apply -auto-approve

echo ""
echo "Step 4: Generate Environment Files..."
echo "------------------------------------"
cd ../scripts
echo "Generating Web App environment..."
./generate-web-env.sh

echo "Generating API Server environment..."
./generate-api-env.sh

echo ""
echo "✅ DemoTradePro Auth0 Setup Complete!"
echo "===================================="
echo ""
echo "Next Steps:"
echo "1. Start the API server: cd ../apps/api-server && pnpm dev"
echo "2. Start the web app: cd ../apps/web && pnpm dev"
echo "3. Visit http://localhost:3000 to test authentication"
echo ""
echo "📝 To make changes to Auth0 config, edit the .tf files and run:"
echo "   ./update.sh"
echo ""
