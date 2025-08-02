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
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { toFetchResponse, toReqRes } from 'fetch-to-node';
import { createAuth0Mcp } from '@auth0/auth0-mcp-hono';
import { getLogger } from '@auth0/auth0-mcp-js';
import type { Auth } from '@auth0/auth0-mcp-js';
import type { AppContext, Env, Variables } from './types.js';
import { createConfig } from './config.js';
import { tools } from './tools.js';

// Create main Hono app
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Global middleware: logging, config, CORS, error handling
app.use(logger());

// Global configuration middleware
app.use('*', async (c: AppContext, next: () => Promise<void>) => {
  // For Node.js environment, get config from process.env
  const env: Env = {
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN || '',
    AUTH0_TENANT: process.env.AUTH0_TENANT || '',
    MCP_AUDIENCE: process.env.MCP_AUDIENCE || 'https://mcp-server.demotradepro.example',
    MCP_SERVER_URL: process.env.MCP_SERVER_URL || 'http://localhost:3004',
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
  
  const config = createConfig(env);
  c.set('config', config);
  c.set('logger', getLogger(config));
  c.set('auth0', createAuth0Mcp(config));

  await next();
});

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

// Health check endpoint
app.get('/ping', (c: AppContext) => {
  return c.json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (c: AppContext) => {
  return c.text('DemoTradePro MCP Server\\nModel Context Protocol server for DemoTradePro AI Agent');
});

/**
 * Creates and configures the MCP server instance.
 * 
 * The MCP server handles the Model Context Protocol, which defines
 * how clients can discover and invoke tools. This is separate from
 * the HTTP transport layer.
 * 
 * Tools are registered using a metadata-driven approach where each tool
 * specifies its required scopes, and the Auth0 middleware automatically
 * applies scope validation.
 * 
 * @returns Configured McpServer instance with registered tools
 */
function createMcpServer(c: AppContext): McpServer {
  const logger = c.get('logger');
  const auth0 = c.get('auth0');

  const server = new McpServer(
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
  for (const tool of tools) {
    server.setRequestHandler('tools/call', async (request) => {
      if (request.params.name !== tool.name) {
        return;
      }

      logger.info(`🔧 Tool called: ${tool.name}`, request.params);

      try {
        // Get auth info from context (set by auth middleware)
        const authInfo = c.get('auth');
        
        // Call the tool handler with auth info
        const result = tool.handler(c, {
          authInfo,
          arguments: request.params.arguments || {},
        });

        return result;
      } catch (error) {
        logger.error(`Tool ${tool.name} failed:`, error);
        throw error;
      }
    });
  }

  // List available tools
  server.setRequestHandler('tools/list', async () => {
    return {
      tools: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: {
          type: 'object',
          properties: Object.fromEntries(
            Object.entries(tool.inputSchema).map(([key, schema]) => [
              key,
              { type: 'string', description: schema.description || '' }
            ])
          ),
        },
      })),
    };
  });

  return server;
}

/**
 * MCP Protocol Endpoints
 */
(['/', '/mcp'] as const).forEach(path =>
  app.post(path, async (c: AppContext) => {
    const logger = c.get('logger');
    const auth0 = c.get('auth0');

    try {
      // Apply Auth0 authentication middleware
      const authResult = await auth0.middleware(c);
      if (authResult) {
        return authResult; // Authentication failed, return error response
      }

      // Create MCP server instance
      const server = createMcpServer(c);

      // Create HTTP transport
      const transport = new StreamableHTTPServerTransport();

      // Connect server to transport
      await server.connect(transport);

      // Convert Hono request to Node.js format for MCP SDK
      const { req, res } = toReqRes(c.req.raw);

      // Handle the MCP request
      await transport.handleRequest(req, res);

      // Convert Node.js response back to Fetch API Response
      return toFetchResponse(res);
    } catch (error) {
      logger.error('MCP request failed:', error);
      return c.json({ error: 'MCP request failed' }, 500);
    }
  })
);

export default app;
