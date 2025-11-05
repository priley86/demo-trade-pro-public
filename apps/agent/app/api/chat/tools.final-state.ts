/**
 * note: if we decide to expose any tools local to the agent (instead of from mcp server),
 * as we did before, we can add them here...
 */
export const agentTools = {

} as const;


/**
 * DemoTradePro Agent Tools Configuration
 * Centralized tool definitions for the chat agent
 */

// import * as GetStockPrice from '@workspace/agent-utils/tools/get-stock-price';
// import * as SearchStocks from '@workspace/agent-utils/tools/search-stocks';
// import * as GetStockInfo from '@workspace/agent-utils/tools/get-stock-info';
// import * as GetPortfolio from '@workspace/agent-utils/tools/get-portfolio';

// import { createAPIClient } from '@workspace/agent-utils';

// import { getAccessTokenForConnection } from '@/lib/auth0';

// /**
//  * Create shared API clients
//  */
// const apiClient = createAPIClient(process.env.API_BASE_URL!, async () => {
//   const token = await getAccessTokenForConnection({ connection: 'shrek-workshop-stock-oidc' });
//   return token;
// }); // Token provider for auth

// /**
//  * Public stock market tools - no authentication required
//  */
// export const publicStockTools = {
//   getStockPrice: GetStockPrice.createAISDKTool(apiClient),
//   searchStocks: SearchStocks.createAISDKTool(apiClient),
//   getStockInfo: GetStockInfo.createAISDKTool(apiClient),
// } as const;

// /**
//  * Authenticated tools - require user session and API access
//  */
// export const authenticatedTools = {
//   getPortfolio: GetPortfolio.createAISDKTool(apiClient),
// } as const;

// /**
//  * All available tools for the agent
//  * Includes both public and authenticated tools
//  */
// export const agentTools = {
//   ...publicStockTools,
//   ...authenticatedTools,
// } as const;
