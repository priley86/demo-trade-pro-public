import { Auth0Client } from "@auth0/nextjs-auth0/server";

import { ApiClient } from "@auth0/auth0-api-js";

import {
  AUTH0_AUDIENCE,
  AUTH0_DOMAIN,
  API_AUDIENCE,
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
  enableConnectAccountEndpoint: true,
});

// MCP Server Auth0 Custom API client instance
export const auth0CustomApiClient = new ApiClient({
  domain: AUTH0_DOMAIN,
  audience: API_AUDIENCE,
  clientId: MCP_SERVER_CUSTOM_API_CLIENT_ID,
  clientSecret: MCP_SERVER_CUSTOM_API_CLIENT_SECRET,
});

/**
 * Helper to get delegated access token for the API
 * Uses the OIDC connection to get a token for the stock trading API
 * Note: this can only be used by the agent running running with a Next.js Auth0 session
 */
export async function getAccessTokenForConnection({
  connection,
}: {
  connection: string;
}): Promise<string | undefined> {
  try {
    if (!auth0.getSession()) {
      return undefined;
    }

    /**
     * important: the token returned will have the default API audience for the upstream OIDC connection, e.g "https://api.stocktrade.example"
     * If a separate audience is needed, configure the OIDC connection in Auth0 accordingly or construct a different ApiClient with the desired audience.
     */
    const token = await auth0.getAccessTokenForConnection({ connection });

    if (!token.token) {
      throw new Error("Access token is not available in Auth0 Token Vault");
    }

    return token.token;
  } catch (error) {
    console.error("Failed to get stored access token:", error);
    throw error;
  }
}

import { AuthorizationDetails } from "@auth0/nextjs-auth0/types";

export async function getTokenByBackchannelAuth({
  bindingMessage,
  authorizationDetails,
}: {
  bindingMessage: string;
  authorizationDetails?: AuthorizationDetails[];
}) {
  const session = await auth0.getSession();
  if (!session) {
    return undefined;
  }

  try {
    const token = await auth0.getTokenByBackchannelAuth({
      bindingMessage,
      authorizationDetails,
      loginHint: {
        sub: session.user.sub,
      },
    });
    if (!token.tokenSet) {
      throw new Error("The user didn't authorize the request");
    }
    return token.tokenSet.accessToken;
  } catch (error) {
    console.error("Failed to get token by backchannel auth:", error);
    throw error;
  }
}
