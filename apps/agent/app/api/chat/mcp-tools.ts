import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * DemoTradePro Agent Tools Configuration
 * Centralized tool definitions for the chat agent
 */
import * as GetStockInfo from "@workspace/agent-utils/tools/get-stock-info";
import * as GetPortfolio from "@workspace/agent-utils/tools/get-portfolio";

// API client instance for accessing the trading platform API
import { createAPIClient } from "@workspace/agent-utils";

// Custom API client
import { auth0CustomApiClient } from "../../../lib/auth0";

// Auth0 MCP server instance
import auth0Mcp from "../../../lib/auth0-mcp";

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
      console.log(
        "Obtained delegated access token for API client:",
        token.accessToken
      );
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
  // Create tool metadata (we'll use the actual handlers in the auth wrapper)
  const mcpTools = [
    {
      meta: GetStockInfo.getMCPToolMeta(),
      handler: GetStockInfo.getStockInfoHandler,
    },
    {
      meta: GetPortfolio.getMCPToolMeta(),
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
      auth0Mcp.requireScopes(
        tool.meta.requiredScopes,
        async (params, { authInfo }) => {
          try {
            const apiClient = createDemoTradeProApiClient(authInfo.token);

            const result = await tool.handler(params as any, apiClient);

            return {
              content: [
                {
                  type: "text" as const,
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          } catch (err) {
            console.log(err);
            throw err;
          }
        }
      )
    );
  });

  // additional mcp tools for testing auth0 user authentication
  server.registerTool(
    "greet",
    {
      title: "Greet Tool",
      description: "A tool that greets a user by name",
      inputSchema: greetToolInputSchema,
      annotations: { readOnlyHint: false },
    },
    /**
     * note: we are not requiring scopes for the whoami tool in this workshop
     * see the Next.js quickstart and Auth0 Tenant Setup Guide for further details on
     * configuring RBAC Roles and assigning scopes (permissions) to users.
     * https://github.com/auth0-samples/auth0-ai-samples/blob/main/auth-for-mcp/nextjs-mcp-js/README.md
     * https://github.com/auth0-samples/auth0-ai-samples/tree/main/auth-for-mcp/nextjs-mcp-js#auth0-tenant-setup
     */
    auth0Mcp.requireScopes<typeof greetToolInputSchema>(
      [],
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

  // additional mcp tools for testing auth0 user authentication
  server.registerTool(
    "whoami",
    {
      title: "Who Am I Tool",
      description:
        "A tool that returns information about the authenticated user",
      annotations: { readOnlyHint: false },
    },
    /**
     * note: we are not requiring scopes for the whoami tool in this workshop
     * see the Next.js quickstart and Auth0 Tenant Setup Guide for further details on
     * configuring RBAC Roles and assigning scopes (permissions) to users.
     * https://github.com/auth0-samples/auth0-ai-samples/blob/main/auth-for-mcp/nextjs-mcp-js/README.md
     * https://github.com/auth0-samples/auth0-ai-samples/tree/main/auth-for-mcp/nextjs-mcp-js#auth0-tenant-setup
     */
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

  // This is a public tool that does not require any scopes
  server.registerTool(
    "getDateTime",
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
