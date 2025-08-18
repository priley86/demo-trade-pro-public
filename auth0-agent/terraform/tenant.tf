# Auth0 Tenant Configuration
# Configures tenant-wide settings including dynamic client registration

resource "auth0_tenant" "main" {
  # Dynamic Client Registration
  # This allows MCP clients and other services to register themselves dynamically
  flags {
    enable_dynamic_client_registration = true
  }
  
  # Security settings
  default_audience = var.mcp_resource_identifier
  default_directory = "Username-Password-Authentication"
  
  # Session and token settings
  session_lifetime = 720  # 12 hours
  idle_session_lifetime = 72  # 72 hours
}
