/**
 * Defines the tools for the DemoTradePro MCP server.
 * Uses shared tools from @workspace/agent-utils with MCP adapter layer.
 */
import { z } from 'zod';
import type { AppContext } from './types.js';
import type { Auth } from '@auth0/auth0-mcp-js';
import { createAPIClient } from '@workspace/agent-utils';

// Import shared tools
import * as GetPortfolio from '@workspace/agent-utils/tools/get-portfolio';
import * as GetStockPrice from '@workspace/agent-utils/tools/get-stock-price';
import * as SearchStocks from '@workspace/agent-utils/tools/search-stocks';
import * as GetStockInfo from '@workspace/agent-utils/tools/get-stock-info';
import * as CreateOrder from '@workspace/agent-utils/tools/create-order';

/**
 * Create API client for shared tools
 * Note: MCP server will need to handle token forwarding from client
 */
function createMCPAPIClient() {
  // For MCP server, we'll need to handle token forwarding differently
  // This is a placeholder - actual implementation depends on how tokens are passed
  return createAPIClient(
    process.env.API_BASE_URL || 'http://localhost:3001/api',
    async () => {
      // Token will be provided by MCP client via JWT forwarding
      // This is handled at the transport level
      return undefined;
    }
  );
}

const apiClient = createMCPAPIClient();

/**
 * Helper function to adapt MCP tools to the expected format
 */
function adaptMCPTool(
  mcpTool: ReturnType<typeof GetPortfolio.createMCPTool>,
  requiredScopes: string[]
) {
  return {
    name: mcpTool.name,
    description: mcpTool.description,
    requiredScopes,
    inputSchema: mcpTool.inputSchema,
    handler: async (c: AppContext, extra: { authInfo: Auth; arguments: Record<string, unknown> }) => {
      const { authInfo, arguments: args } = extra;
      const logger = c.get('logger');
      
      try {
        // Call the MCP tool handler
        const result = await mcpTool.handler(args);
        
        logger.info(`🔧 ${mcpTool.name} tool completed`, { user: authInfo.extra.sub });
        
        return {
          content: [{ 
            type: 'text' as const, 
            text: JSON.stringify(result, null, 2)
          }],
        };
      } catch (error) {
        logger.error(`Tool ${mcpTool.name} failed:`, error);
        throw error;
      }
    },
  };
}

/**
 * Array of tool definitions for DemoTradePro MCP server.
 * Each tool uses the shared tools from @workspace/agent-utils via createMCPTool factories.
 */
export const tools = [
  // Portfolio tools
  adaptMCPTool(GetPortfolio.createMCPTool(apiClient), ['tool:portfolio']),
  
  // Stock market tools
  adaptMCPTool(GetStockPrice.createMCPTool(apiClient), ['tool:stocks']),
  adaptMCPTool(SearchStocks.createMCPTool(apiClient), ['tool:stocks']),
  adaptMCPTool(GetStockInfo.createMCPTool(apiClient), ['tool:stocks']),
  
  // Trading tools
  adaptMCPTool(CreateOrder.createMCPTool(apiClient), ['tool:orders']),
];
