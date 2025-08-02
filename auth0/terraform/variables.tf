variable "auth0_domain" {}
variable "auth0_client_id" {}
variable "auth0_client_secret" {
    sensitive = true
}

variable "project_name" {
  default = "StockTrade"
}

# Web Application URLs
variable "web_base_url" {
  default = "https://workshop.auth101.dev"
}

variable "web_callback_url" {
  default = "https://workshop.auth101.dev/auth/callback"
}

# API Server URLs  
variable "api_base_url" {
  default = "https://workshop-stock-api.auth101.dev"
}

variable "api_identifier" {
  default = "https://api.stocktrade.example"
  description = "API identifier/audience for JWT tokens"
}