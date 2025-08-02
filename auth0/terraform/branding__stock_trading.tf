# Auth0 Universal Login Branding Configuration
# Matches the DemoTradePro app design system with neutral colors and professional look

resource "auth0_branding" "stock_trading_branding" {
  # Colors matching the UI design system (neutral theme)
  colors {
    # Primary brand color - matches --primary: oklch(0.205 0 0) (dark gray/black)
    primary = "#333333"
    
    # Page background - matches --background: oklch(1 0 0) (white)
    page_background = "#ffffff"
  }

  # Logo configuration (you can add a logo URL here later if needed)
  # logo_url = "https://your-cdn.com/stocktrade-logo.png"

  # Favicon (optional)
  # favicon_url = "https://your-cdn.com/stocktrade-favicon.ico"

  # Font configuration (using Inter font to match your design system)
  font {
    url = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
  }
}

# Note: Custom login templates are not supported via Terraform in the current Auth0 provider
# For custom templates, you'll need to use the Auth0 Management API directly or the dashboard
