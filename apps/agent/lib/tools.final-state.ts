import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * DemoTradePro Agent Tools Configuration
 * Centralized tool definitions for the chat agent
 */
import * as GetStockPrice from "@workspace/agent-utils/tools/get-stock-price";
import * as SearchStocks from "@workspace/agent-utils/tools/search-stocks";
import * as GetStockInfo from "@workspace/agent-utils/tools/get-stock-info";
import * as GetPortfolio from "@workspace/agent-utils/tools/get-portfolio";

// API client instance for accessing the trading platform API
import { createAPIClient } from "@workspace/agent-utils";

// OIDC access token helper
import { getAccessTokenForConnection } from "./auth0";

// Auth0 MCP server instance
import auth0Mcp from "./auth0-mcp";

/**
 * Input schema definitions for initial tools
 */
const greetToolInputSchema = {
  name: z.string().optional().describe("The name to greet"),
} as const;

const emptyToolInputSchema = {
  // Empty object schema for tools that take no parameters
} as const;

const apiClient = createAPIClient(process.env.API_BASE_URL!, async () => {
  const token = await getAccessTokenForConnection({
    connection: process.env.API_OIDC_CONNECTION_NAME!,
  });
  return token;
}); // Token provider for auth

/**
 * MCP tools with scope-based authorization.
 */
export function registerTools(server: McpServer) {
  // Create MCP tool definitions using the helper factories
  const mcpTools = [
    // public tools
    GetStockPrice.createMCPTool((params) =>
      GetStockPrice.getStockPriceHandler(params, apiClient)
    ),
    SearchStocks.createMCPTool((params) =>
      SearchStocks.searchStocksHandler(params, apiClient)
    ),
    GetStockInfo.createMCPTool((params) =>
      GetStockInfo.getStockInfoHandler(params, apiClient)
    ),

    // authenticated tools
    GetPortfolio.createMCPTool(apiClient), // This one takes apiClient directly
  ];

  // Register all stock market tools
  mcpTools.forEach((tool) => {
    server.registerTool(
      tool.name,
      {
        title: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: { readOnlyHint: true },
      },
      async (args: any) => {
        const result = await tool.handler(args);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      }
    );
  });

  // additional tools for testing auth0 user authentication
  server.registerTool(
    "greet",
    {
      title: "Greet Tool",
      description: "A tool that greets a user by name",
      inputSchema: greetToolInputSchema,
      annotations: { readOnlyHint: false },
    },
    auth0Mcp.requireScopes<typeof greetToolInputSchema>(
      // todo: uncomment me once tool:greet scopes added to cli / terraform scripts
      []
      // ["tool:greet"]
      ,
      async (payload, { authInfo }) => {
        const name = payload.name || "World";
        const userId = authInfo.extra.sub;
        return {
          content: [
            {
              type: "text",
              text: `Hello, ${name}! You are authenticated as: ${userId}`,
            },
          ],
        };
      }
    )
  );

  // additional tools for testing auth0 user authentication
  server.registerTool(
    "whoami",
    {
      title: "Who Am I Tool",
      description:
        "A tool that returns information about the authenticated user",
      annotations: { readOnlyHint: false },
    },
    // auth0Mcp.requireScopes(["tool:whoami"],
    // todo: uncomment me once tool:whoami scopes added to cli / terraform scripts
    auth0Mcp.requireScopes([], async (_payload, { authInfo }) => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { user: authInfo.extra, scopes: authInfo.scopes },
              null,
              2
            ),
          },
        ],
      };
    })
  );

  // This tool does not require any scopes and is provided initially
  server.registerTool(
    "get_datetime",
    {
      title: "Get DateTime",
      description: "Returns the current UTC date and time",
      inputSchema: emptyToolInputSchema,
      annotations: { readOnlyHint: true },
    },
    async () => {
      const utcDateTime = new Date().toISOString();
      return {
        content: [
          {
            type: "text",
            text: utcDateTime,
          },
        ],
      };
    }
  );
}
