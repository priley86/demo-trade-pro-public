#!/usr/bin/env bash
# AI Agent Terraform Update Script
# Run this to apply Terraform changes and regenerate agent environment file

set -euo pipefail

echo "🤖 AI Agent Auth0 Configuration Update"
echo "================================================"

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "Applying Terraform Changes..."
echo "---------------------------------"
cd terraform
terraform apply -auto-approve