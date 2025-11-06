import { Auth0Client } from "@auth0/nextjs-auth0/server";

import { ApiClient } from "@auth0/auth0-api-js";

import {
  AUTH0_AUDIENCE,
  AUTH0_DOMAIN,
  MCP_SERVER_CUSTOM_API_CLIENT_ID,
  MCP_SERVER_CUSTOM_API_CLIENT_SECRET,
} from "./config";

// Server-side agent Auth0 client instance
export const auth0 = new Auth0Client({
  logoutStrategy: "oidc",
  authorizationParameters: {
    audience: AUTH0_AUDIENCE,
    scope: process.env.API_DEFAULT_SCOPES,
    prompt: "login",
    connection: process.env.API_OIDC_CONNECTION_NAME,
  },
});

// MCP Server Auth0 Custom API client instance
export const auth0CustomApiClient = new ApiClient({
  domain: AUTH0_DOMAIN,
  audience: AUTH0_AUDIENCE,
  clientId: MCP_SERVER_CUSTOM_API_CLIENT_ID,
  clientSecret: MCP_SERVER_CUSTOM_API_CLIENT_SECRET,
});
