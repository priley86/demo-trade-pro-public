resource "auth0_resource_server" "stock_trading_api" {
  name         = "${var.project_name} API"
  identifier   = var.api_identifier
  signing_alg  = "RS256"

  # Enable RBAC to use scopes
  allow_offline_access = true
  token_lifetime       = 86400
  skip_consent_for_verifiable_first_party_clients = true
}

# Define individual scopes using separate resources
resource "auth0_resource_server_scope" "trade_read" {
  resource_server_identifier = auth0_resource_server.stock_trading_api.identifier
  scope                      = "trade:read"
  description               = "View orders and trading information"
}

resource "auth0_resource_server_scope" "trade_write" {
  resource_server_identifier = auth0_resource_server.stock_trading_api.identifier
  scope                      = "trade:write"
  description               = "Create and manage orders"
}

resource "auth0_resource_server_scope" "portfolio_read" {
  resource_server_identifier = auth0_resource_server.stock_trading_api.identifier
  scope                      = "portfolio:read"
  description               = "View portfolio information"
}


