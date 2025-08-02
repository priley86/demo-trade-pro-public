output "web_client_id" {
  value = auth0_client.stock_trading_web.client_id
  description = "Auth0 Client ID for the web application"
}

# Data source to retrieve the client secret
data "auth0_client" "stock_trading_web_data" {
  client_id = auth0_client.stock_trading_web.client_id
}

output "web_client_secret" {
  value = data.auth0_client.stock_trading_web_data.client_secret
  description = "Auth0 Client Secret for the web application"
  sensitive = true
}


output "api_audience" {
  value = auth0_resource_server.stock_trading_api.identifier
  description = "API audience/identifier for JWT tokens"
}

output "auth0_domain" {
  value = var.auth0_domain
  description = "Auth0 domain"
}

output "auth0_issuer_base_url" {
  value = "https://${var.auth0_domain}"
  description = "Auth0 issuer base URL"
}
