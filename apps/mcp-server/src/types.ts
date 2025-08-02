/**
 * Contains TypeScript type definitions specific to this
 * Hono implementation, including environment configuration for DemoTradePro MCP Server.
 */

import type { Context } from 'hono';
import type { createAuth0Mcp } from '@auth0/auth0-mcp-hono';
import type { Config, Logger, Auth } from '@auth0/auth0-mcp-js';

/**
 * Environment interface for DemoTradePro MCP Server
 */
export interface Env {
  readonly AUTH0_DOMAIN: string;
  readonly AUTH0_TENANT: string;
  readonly MCP_AUDIENCE?: string;
  readonly MCP_SERVER_URL?: string;
  readonly NODE_ENV?: string;
}

/**
 * Variables for Hono context - includes auth info set by middleware
 */
export interface Variables {
  config: Config;
  logger: Logger;
  auth0: ReturnType<typeof createAuth0Mcp>;
  auth: Auth; // Set by auth middleware
}

/**
 * App context that combines Hono's typed context with Auth0 authentication.
 * By providing Variables to Hono<{ Bindings; Variables }>, we get fully-typed c.get() calls.
 */
export type AppContext = Context<{ Bindings: Env; Variables: Variables }>;
