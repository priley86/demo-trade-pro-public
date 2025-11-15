import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const emptyToolInputSchema = {
  // Empty object schema for tools that take no parameters
} as const;

/**
 * Register MCP tools
 */
export function registerTools(server: McpServer) {
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
