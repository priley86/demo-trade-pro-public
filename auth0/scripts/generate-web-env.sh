#!/usr/bin/env bash
# Generate .env for the web app using Terraform outputs

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AUTH0_DIR="$(dirname "$SCRIPT_DIR")"
WEB_APP_DIR="$AUTH0_DIR/../apps/web"
WEB_ENV_FILE="$WEB_APP_DIR/.env"

# Ensure the web app directory exists
if [ ! -d "$WEB_APP_DIR" ]; then
  echo "Error: Web app directory not found at $WEB_APP_DIR"
  exit 1
fi

# Check if terraform outputs are available
if [ ! -f "$AUTH0_DIR/terraform/terraform.tfstate" ]; then
  echo "Error: terraform.tfstate not found. Please run 'terraform apply' first in the auth0/terraform directory."
  exit 1
fi

echo "Generating .env for web app from Terraform outputs..."

# Change to terraform directory to run terraform commands
cd "$AUTH0_DIR/terraform"

# Generate a random AUTH0_SECRET if not provided
AUTH0_SECRET=$(openssl rand -hex 32)

# Extract values from terraform output
WEB_CLIENT_ID=$(terraform output -raw web_client_id)
WEB_CLIENT_SECRET=$(terraform output -raw web_client_secret)
AUTH0_DOMAIN=$(terraform output -raw auth0_domain)
AUTH0_ISSUER_BASE_URL=$(terraform output -raw auth0_issuer_base_url)
API_AUDIENCE=$(terraform output -raw api_audience)

# For the stock trading workshop, we'll use the standard client secret approach
# Remove JWE complexity for now

# Write .env file for the web app
cat > "$WEB_ENV_FILE" <<EOF
# Auth0 Configuration for Stock Trading Next.js App
AUTH0_DOMAIN=$AUTH0_DOMAIN
AUTH0_CLIENT_ID=$WEB_CLIENT_ID
AUTH0_CLIENT_SECRET=$WEB_CLIENT_SECRET
AUTH0_SECRET=$AUTH0_SECRET
APP_BASE_URL=http://localhost:3000
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=$AUTH0_ISSUER_BASE_URL
AUTH0_AUDIENCE=$API_AUDIENCE

# API Server Configuration
API_BASE_URL=http://localhost:3001

# Stock Trading API Scopes (for reference)
API_DEFAULT_SCOPES="openid profile email offline_access trade:read trade:write portfolio:read"
EOF

echo ".env written to $WEB_ENV_FILE"
echo ""
echo "✅ Environment variables configured for Stock Trading App:"
echo "  - AUTH0_DOMAIN: $AUTH0_DOMAIN"
echo "  - AUTH0_CLIENT_ID: $WEB_CLIENT_ID"
echo "  - AUTH0_BASE_URL: http://localhost:3000"
echo "  - AUTH0_AUDIENCE: $API_AUDIENCE"
echo ""
echo "🔐 Authentication Method: Standard client_secret (Auth0 Next.js SDK v4.9+)"
echo "📋 API Access: JWT tokens with trading scopes (trade:read, trade:write, portfolio:read)"
echo "🚀 Ready to start the web app with: cd ../apps/web && pnpm dev"
echo ""
