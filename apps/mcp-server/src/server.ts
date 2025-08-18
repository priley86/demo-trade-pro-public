/**
 * Creates and configures both the MCP server and Hono application for DemoTradePro.
 * It demonstrates the integration between MCP protocol handling and HTTP transport,
 * with Auth0 authentication protecting endpoints using StreamableHTTP transport.
 */
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPTransport } from '@hono/mcp';
import { Auth, createAuth0Mcp } from '@auth0/auth0-mcp-hono';
import type { AppContext, Env, Variables } from './types.js';
import { createConfig } from './config.js';
import { mcpTools, authContext } from './tools.js';

// Create main Hono app
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

const env: Env = {
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN || '',
  AUTH0_TENANT: process.env.AUTH0_TENANT || '',
  MCP_AUDIENCE: process.env.MCP_AUDIENCE || 'https://mcp-server.demotradepro.example',
  MCP_SERVER_URL: process.env.MCP_SERVER_URL || 'http://localhost:3004',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MCP_CLIENT_ID: process.env.MCP_CLIENT_ID || '',
  MCP_CLIENT_SECRET: process.env.MCP_CLIENT_SECRET || '',
};

const config = createConfig(env);

const auth0Mcp = await createAuth0Mcp(config);
const auth0McpRouter = await auth0Mcp.router();

// Global middleware: logging, config, CORS, error handling
app.use(logger());

// Enable CORS for MCP Inspector
app.use(
  '/*',
  cors({
    origin: 'http://localhost:6274', // MCP Inspector
  })
);

// Global error handler
app.onError((err: Error, c: AppContext) => {
  const logger = c.get('logger');

  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  logger.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Mount the Auth0 MCP router (contains MCP endpoints with auth)
app.route("/", auth0McpRouter as unknown as Hono);

/**
 * MCP server instance with AsyncLocalStorage-enabled tools
 */
const mcpServer = new McpServer(
  {
    name: 'demotradepro-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register each tool with the MCP server
for (const mcpTool of mcpTools) {
  mcpServer.registerTool(
    mcpTool.name,
    {
      title: mcpTool.name,
      description: mcpTool.description,
      inputSchema: mcpTool.inputSchema as any,
    },
    async (args: Record<string, unknown>) => {
      console.info(`🔧 MCP Tool called: ${mcpTool.name}`, args);

      try {
        const result = await mcpTool.handler(args as any);
        
        return {
          content: [{
            type: 'text' as const,
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        console.error(`MCP Tool ${mcpTool.name} failed:`, error);
        throw error;
      }
    }
  );
}

// MCP protocol endpoint with auth gating
app.all(
  '/mcp',
  auth0Mcp.middleware(),
  async (c: AppContext) => {
    try {
      // Try to get the function - we might need to examine the auth context structure
      // For now, let's create a wrapper that calls the method you mentioned
      console.log(c.get("accessTokenForConnection"))
      // Run the MCP request handling within AsyncLocalStorage context
      return await authContext.run({
        auth0: auth0Mcp.instance,
        context: c.get("auth") as unknown as Auth,
      }, async () => {
        // Create Hono MCP transport
        const transport = new StreamableHTTPTransport();

        // Connect the MCP server to transport (tools will access auth via AsyncLocalStorage)
        await mcpServer.connect(transport);

        // Handle the MCP request using Hono MCP transport
        return transport.handleRequest(c);
      });
    } catch (error) {
      console.error('MCP request failed:', error);
      return c.json({ error: 'MCP request failed' }, 500);
    }
  });

export default app;
