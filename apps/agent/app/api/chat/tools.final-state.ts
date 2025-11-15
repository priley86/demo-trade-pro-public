/**
 * DemoTradePro Agent Tools Configuration
 * Centralized tool definitions for the chat agent
 */

import * as GetStockPrice from "@workspace/agent-utils/tools/get-stock-price";
import * as GetPortfolio from "@workspace/agent-utils/tools/get-portfolio";

import { createAPIClient } from "@workspace/agent-utils";

import { getAccessTokenForConnection } from "@/lib/auth0";

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
} as const;

/**
 * All available tools for the agent
 * Includes both public and authenticated tools
 */
export const agentTools = {
  ...publicStockTools,
  ...authenticatedTools,
} as const;
