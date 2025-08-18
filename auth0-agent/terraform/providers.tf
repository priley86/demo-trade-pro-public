terraform {
  required_providers {
    auth0 = {
      source  = "auth0/auth0"
      version = "~> 1.25.0"
    }
    restapi = {
      source  = "Mastercard/restapi"
      version = "~> 2.0.1"
    }
  }

  required_version = ">= 1.0.0"
}

provider "auth0" {
  domain        = var.auth0_domain
  client_id     = var.auth0_client_id
  client_secret = var.auth0_client_secret
}

# Configure restapi provider for Auth0 Management API compatibility layer
# this allows terraform to use the full Management API.
provider "restapi" {

  # Configure rate limiting
  rate_limit = 1

  uri = "https://${var.auth0_domain}/api/v2/"
  write_returns_object = true
  
  # Use OAuth client credentials flow with existing Auth0 M2M credentials
  oauth_client_credentials {
    oauth_client_id      = var.auth0_client_id
    oauth_client_secret  = var.auth0_client_secret
    oauth_token_endpoint = "https://${var.auth0_domain}/oauth/token"
    endpoint_params      = {
      audience = "https://${var.auth0_domain}/api/v2/"
    }
    oauth_scopes         = []
  }
  
  headers = {
    Content-Type = "application/json"
  }
}
