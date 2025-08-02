#!/usr/bin/env bash
# Generate .env for the API server using Terraform outputs

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AUTH0_DIR="$(dirname "$SCRIPT_DIR")"
API_SERVER_DIR="$AUTH0_DIR/../apps/api-server"
API_ENV_FILE="$API_SERVER_DIR/.env"

# Ensure the API server directory exists
if [ ! -d "$API_SERVER_DIR" ]; then
  echo "Error: API server directory not found at $API_SERVER_DIR"
  exit 1
fi

# Check if terraform outputs are available
if [ ! -f "$AUTH0_DIR/terraform/terraform.tfstate" ]; then
  echo "Error: terraform.tfstate not found. Please run 'terraform apply' first in the auth0/terraform directory."
  exit 1
fi

echo "Generating .env for API server from Terraform outputs..."

# Change to terraform directory to run terraform commands
cd "$AUTH0_DIR/terraform"

# Extract values from terraform output
AUTH0_DOMAIN=$(terraform output -raw auth0_domain)
AUTH0_ISSUER_BASE_URL=$(terraform output -raw auth0_issuer_base_url)
API_AUDIENCE=$(terraform output -raw api_audience)

# Write .env file for the API server
cat > "$API_ENV_FILE" <<EOF
# Auth0 Configuration for Stock Trading API Server
AUTH0_DOMAIN=$AUTH0_DOMAIN
AUTH0_ISSUER_BASE_URL=$AUTH0_ISSUER_BASE_URL
AUTH0_AUDIENCE=$API_AUDIENCE

# Database Configuration (for local development)
DATABASE_URL=postgresql://stock_user:stock_pass@localhost:5432/stock_db

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
EOF

echo ".env written to $API_ENV_FILE"
echo ""
echo "✅ Environment variables configured for Stock Trading API:"
echo "  - AUTH0_DOMAIN: $AUTH0_DOMAIN"
echo "  - AUTH0_AUDIENCE: $API_AUDIENCE" 
echo "  - DATABASE_URL: postgresql://stock_user:stock_pass@localhost:5432/stock_db"
echo "  - PORT: 3001"
echo ""
echo "🔐 JWT Validation: Configured to validate tokens from Auth0"
echo "📊 Database: PostgreSQL with Drizzle ORM"
echo "🚀 Ready to start the API server with: cd ../apps/api-server && pnpm dev"
echo ""
