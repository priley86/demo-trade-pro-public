/**
 * Defines the tools for the DemoTradePro MCP server.
 * Uses shared tools from @workspace/agent-utils directly via createMCPTool factories.
 * Uses AsyncLocalStorage to provide auth context to tools.
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import { createAPIClient } from '@workspace/agent-utils';
// Import MCP tool factories directly
import * as GetPortfolio from '@workspace/agent-utils/tools/get-portfolio';
import * as GetStockPrice from '@workspace/agent-utils/tools/get-stock-price';
import * as SearchStocks from '@workspace/agent-utils/tools/search-stocks';
import * as GetStockInfo from '@workspace/agent-utils/tools/get-stock-info';
import * as CreateOrder from '@workspace/agent-utils/tools/create-order';
import type { Auth0MCP, Auth } from '@auth0/auth0-mcp-hono';

// AsyncLocalStorage for getAccessTokenForConnection function
export const authContext = new AsyncLocalStorage<{
  auth0: Auth0MCP,
  context: Auth,
}>();

/**
 * Create API client that uses AsyncLocalStorage for auth context
 */
function createMCPAPIClient() {
  return createAPIClient(
    process.env.API_BASE_URL || 'http://localhost:3001/api/',
    async () => {
      // Get getAccessTokenForConnection function from AsyncLocalStorage
      const context = authContext.getStore();
      if (!context) {
        console.warn('No getAccessTokenForConnection function available in AsyncLocalStorage');
        return undefined;
      }
      
      try {
        // Call the function to get the access token
        const token = await context.auth0.getAccessTokenForConnection({ 
          connection: 'demotradepro-oidc' 
        }, context.context);
        return token;
      } catch (error) {
        console.error('Failed to get access token:', error);
        return undefined;
      }
    }
  );
}

// Create API client instance
const apiClient = createMCPAPIClient();

/**
 * Array of MCP tools that use AsyncLocalStorage for auth context.
 * These can be created once and reused.
 */
export const mcpTools = [
  GetPortfolio.createMCPTool(apiClient),
  GetStockPrice.createMCPTool(apiClient),
  SearchStocks.createMCPTool(apiClient),
  GetStockInfo.createMCPTool(apiClient),
  CreateOrder.createMCPTool(apiClient),
];
