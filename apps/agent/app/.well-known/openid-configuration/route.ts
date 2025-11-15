/**
 * OpenID Connect Discovery endpoint
 *
 * This endpoint provides OpenID Connect metadata for clients that expect
 * the standard OIDC discovery endpoint at /.well-known/openid-configuration
 *
 * Many OAuth/OIDC clients (including ChatGPT) will try this endpoint first
 * before falling back to /.well-known/oauth-authorization-server
 */
import { discoverAuthorizationServerMetadata } from "@modelcontextprotocol/sdk/client/auth.js";

import { AUTH0_DOMAIN, corsHeaders } from "../../../lib/config";

// Define supported scopes for this MCP server
const SUPPORTED_SCOPES = [
  // tool scopes
  "trade:read",
  "portfolio:read",
];

const handler: (req: Request) => Promise<Response> = async () => {
  // Fetch OAuth metadata from Auth0
  // Auth0's authorization server metadata includes all required OpenID Connect fields
  const oauthMetadata = await discoverAuthorizationServerMetadata(
    new URL(`https://${AUTH0_DOMAIN}`).toString()
  );

  // Enhance the metadata with our supported scopes
  const enhancedMetadata = {
    ...oauthMetadata,
    scopes_supported: SUPPORTED_SCOPES,
  };

  return new Response(JSON.stringify(enhancedMetadata), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
};

// Create the OPTIONS handler for CORS preflight requests
// This allows browsers to make cross-origin requests to this endpoint
const optionsHandler = () => {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
};

// Export the handlers using Next.js App router naming convention
// GET: Returns the OpenID Connect Discovery metadata JSON
// OPTIONS: Handles CORS preflight requests
export { handler as GET, optionsHandler as OPTIONS };
