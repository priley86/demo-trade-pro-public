#!/usr/bin/env bash
# Clean up Auth0 tenant before Terraform takeover
# WARNING: This will delete resources! Use with caution.

set -e

echo "🧹 Auth0 Tenant Cleanup"
echo "======================"
echo "⚠️  WARNING: This will delete Auth0 resources!"
echo ""

# Confirm with user
read -p "Are you sure you want to clean up the tenant? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Cleanup cancelled."
    exit 0
fi

echo ""
echo "Step 1: Delete all Applications"
echo "------------------------------------------------"
# Get all applications except the default one
auth0 apps list --json | jq -r '.[] | .client_id' | while read -r client_id; do
    echo "Deleting application: $client_id"
    auth0 apps delete "$client_id" --force
done

echo ""
echo "Step 2: Delete APIs and Resource Servers (except Auth0 Management API)..."
echo "---------------------------------------------------"
# Get all APIs except the management API
auth0 apis list --json | jq -r '.[] | select(.name != "Auth0 Management API") | .id' | while read -r api_id; do
    echo "Deleting API: $api_id"
    auth0 apis delete "$api_id" --force
done


echo ""
echo "Step 3: Delete all Actions"
echo "----------------------"
# Delete all actions
auth0 actions list --json | jq -r '.[].id' | while read -r action_id; do
    echo "Deleting action: $action_id"
    auth0 actions delete "$action_id" --force
done

echo ""
echo "✅ Tenant cleanup complete!"
echo "========================="
echo "Now you can run: terraform apply"
