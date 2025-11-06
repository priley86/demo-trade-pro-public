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

// // OIDC access token helper
// import { getAccessTokenForConnection } from "./auth0";

import { auth0CustomApiClient } from "./auth0";

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

const createDemoTradeProApiClient = (accessToken: string) => {
  return createAPIClient(process.env.API_BASE_URL!, async () => {
    try {
      const token = await auth0CustomApiClient.getAccessTokenForConnection({
        connection: process.env.API_OIDC_CONNECTION_NAME!,
        accessToken,
      });

      if (!token.accessToken) {
        throw new Error("Access token is not available in Auth0 Token Vault");
      }
      // console.log(
      //   "access token from demo trade pro granted!!:",
      //   token.accessToken
      // );
      return token.accessToken;
    } catch (err) {
      console.error("Failed to get stored access token:", err);
      throw err;
    }
  });
};

/**
 * MCP tools with scope-based authorization.
 */
export function registerTools(server: McpServer) {
  const noop = async () => null as any;

  // Create tool metadata (we'll use the actual handlers in the auth wrapper)
  const mcpTools = [
    {
      meta: GetStockPrice.createMCPTool(noop),
      handler: GetStockPrice.getStockPriceHandler,
    },
    {
      meta: SearchStocks.createMCPTool(noop),
      handler: SearchStocks.searchStocksHandler,
    },
    {
      meta: GetStockInfo.createMCPTool(noop),
      handler: GetStockInfo.getStockInfoHandler,
    },
    {
      meta: GetPortfolio.createMCPTool(createDemoTradeProApiClient("")),
      handler: GetPortfolio.getPortfolioHandler,
    },
  ];

  // Register all stock market tools
  mcpTools.forEach((tool) => {
    server.registerTool(
      tool.meta.name,
      {
        title: tool.meta.name,
        description: tool.meta.description,
        inputSchema: tool.meta.inputSchema,
        annotations: { readOnlyHint: true },
      },
      auth0Mcp.requireScopes([], async (params, { authInfo }) => {
        try {
          const apiClient = createDemoTradeProApiClient(authInfo.token);

          const result = await tool.handler(params as any, apiClient);

          return {
            content: [
              { type: "text" as const, text: JSON.stringify(result, null, 2) },
            ],
          };
        } catch (err) {
          console.log(err);
          throw err;
        }
      })
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
      [],
      // ["tool:greet"]
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
