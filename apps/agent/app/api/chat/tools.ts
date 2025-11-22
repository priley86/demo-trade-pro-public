/**
 * DemoTradePro Agent Tools Configuration
 * Centralized tool definitions for the chat agent
 */

import * as GetStockPrice from "@workspace/agent-utils/tools/get-stock-price";
import * as GetPortfolio from "@workspace/agent-utils/tools/get-portfolio";
import * as CreateOrder from "@workspace/agent-utils/tools/create-order";
import { createAPIClient } from "@workspace/agent-utils";

import { AuthorizationDetails } from "@auth0/nextjs-auth0/types";

import {
  getTokenByBackchannelAuth,
  auth0CustomApiClient,
  getAccessTokenForConnection,
} from "@/lib/auth0";

/**
 * Create shared API clients
 */
const apiClient = createAPIClient(process.env.API_BASE_URL!, async () => {
  const token = await getAccessTokenForConnection({
    connection: process.env.API_OIDC_CONNECTION_NAME!,
  });
  return token;
}); // Token provider for auth

/**
 * Create a client which relies on async auth prior to token exchange execution
 */
const apiClientWithAsyncAuth = createAPIClient(
  process.env.API_BASE_URL!,
  async ({ authParams }) => {
    if (authParams && authParams.bindingMessage) {
      const asyncAuthToken = await getTokenByBackchannelAuth({
        bindingMessage: authParams.bindingMessage,
        authorizationDetails:
          authParams.authorizationDetails as AuthorizationDetails[],
      });

      /**
       * Exchange the async auth token for a federated access token in the Token Vault
       * Note: for simplicity, we use the existing Custom API Client in Auth0 linked
       * with the MCP Server API to logically represent the Stock API client used by
       * the Agent & the MCP Server. However, you could create a separate API / API Client
       * to model with the Agent alone to provide more fine-grained controls.
       */
      const token = await auth0CustomApiClient.getAccessTokenForConnection({
        connection: process.env.API_OIDC_CONNECTION_NAME!,
        accessToken: asyncAuthToken!,
      });

      if (!token.accessToken) {
        throw new Error("Access token is not available in Auth0 Token Vault");
      }

      return token.accessToken;
    }
    return undefined;
  }
);

/**
 * Public stock market tools - no authentication required
 */
export const publicStockTools = {
  getStockPrice: GetStockPrice.createAISDKTool(apiClient),
} as const;

/**
 * Authenticated tools - require user session and API access
 */
export const authenticatedTools = {
  getPortfolio: GetPortfolio.createAISDKTool(apiClient),
  createOrder: CreateOrder.createAISDKTool(apiClientWithAsyncAuth),
} as const;

/**
 * All available tools for the agent
 * Includes both public and authenticated tools
 */
export const agentTools = {
  ...publicStockTools,
  ...authenticatedTools,
} as const;
