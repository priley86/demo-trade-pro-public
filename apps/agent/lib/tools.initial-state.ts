import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const emptyToolInputSchema = {
  // Empty object schema for tools that take no parameters
} as const;

/**
 * MCP tools with scope-based authorization.
 */
export function registerTools(server: McpServer) {
  // This tool does not require any scopes
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
