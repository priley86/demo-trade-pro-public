/**
 * OAuth 2.0 Protected Resource Metadata endpoint
 */
import {
  generateProtectedResourceMetadata,
  metadataCorsOptionsRequestHandler,
} from "mcp-handler";

import { AUTH0_DOMAIN, corsHeaders } from "../../../lib/config";

// Define supported scopes for this MCP server
const SUPPORTED_SCOPES = [
  // OIDC scopes
  "openid",
  "profile",
  "email",
  // tool scopes
  "tool:greet",
  "tool:whoami",
];

/** 
  Create custom handler with scopes support
  based on protectedResourceHandler mcp-handler helper:
  https://github.com/vercel/mcp-handler/blob/main/src/auth/auth-metadata.ts#L22
 */
const handler = (req: Request) => {
  const resourceUrl = new URL(req.url);

  // Remove the .well-known path to get the resource identifier
  resourceUrl.pathname = resourceUrl.pathname.replace(
    /^\/\.well-known\/[^\/]+/,
    ""
  );

  const resource =
    resourceUrl.pathname === "/"
      ? resourceUrl.toString().replace(/\/$/, "")
      : resourceUrl.toString();

  const metadata = generateProtectedResourceMetadata({
    authServerUrls: [`https://${AUTH0_DOMAIN}/`],
    resourceUrl: `${resource}/mcp`,
    additionalMetadata: {
      scopes_supported: SUPPORTED_SCOPES,
      // Optional: add other metadata fields
      jwks_uri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
    },
  });

  return new Response(JSON.stringify(metadata), {
    headers: corsHeaders,
  });
};

// Use the built-in CORS handler
const optionsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, optionsHandler as OPTIONS };
