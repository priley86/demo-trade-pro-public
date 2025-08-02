resource "auth0_client" "stock_trading_web" {
  name            = "${var.project_name} Web App"
  app_type        = "regular_web"
  is_first_party  = true

  callbacks       = [var.web_callback_url]
  allowed_logout_urls = [var.web_base_url]
  web_origins     = [var.web_base_url]
  allowed_origins = [var.web_base_url]
  
  oidc_conformant = true

  jwt_configuration {
    alg = "RS256"
  }

  grant_types = [
    "authorization_code", 
    "refresh_token",
    "client_credentials"
  ]
}

# Grant the web app access to the stock trading API
resource "auth0_client_grant" "stock_web_api_grant" {
  client_id = auth0_client.stock_trading_web.client_id
  audience  = auth0_resource_server.stock_trading_api.identifier

  scopes = [
    "trade:read",
    "trade:write",
    "portfolio:read"
  ]
}

# Grant the web app access to Auth0 Management API for workshop client creation
resource "auth0_client_grant" "stock_web_management_grant" {
  client_id = auth0_client.stock_trading_web.client_id
  audience  = "https://${var.auth0_domain}/api/v2/"

  scopes = [
    "create:clients",
    "read:clients",
    "update:clients"
  ]
}
