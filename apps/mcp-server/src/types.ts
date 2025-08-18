/**
 * Contains TypeScript type definitions specific to this
 * Hono implementation, including environment configuration for DemoTradePro MCP Server.
 */

import type { Context } from 'hono';
import type { createAuth0Mcp } from '@auth0/auth0-mcp-hono';

// Define Auth type locally since it's not exported from the package
export interface Auth {
  extra: {
    sub: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Define Config and Logger types locally
export interface Config {
  [key: string]: unknown;
}

export interface Logger {
  info: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
}

/**
 * Environment interface for DemoTradePro MCP Server
 */
export interface Env {
  readonly AUTH0_DOMAIN: string;
  readonly AUTH0_TENANT: string;
  readonly MCP_AUDIENCE?: string;
  readonly MCP_SERVER_URL?: string;
  readonly NODE_ENV?: string;
  readonly MCP_CLIENT_ID?: string;
  readonly MCP_CLIENT_SECRET?: string;
}

/**
 * Variables for Hono context - includes auth info set by middleware
 */
export interface Variables {
  config: Config;
  logger: Logger;
  auth0: ReturnType<typeof createAuth0Mcp>;
  auth: Auth; // Set by auth middleware
  accessTokenForConnection: () => Promise<string | undefined>; // getAccessTokenForConnection function
}

/**
 * App context that combines Hono's typed context with Auth0 authentication.
 * By providing Variables to Hono<{ Bindings; Variables }>, we get fully-typed c.get() calls.
 */
export type AppContext = Context<{ Bindings: Env; Variables: Variables }>;
