/**
 * Provides configuration for DemoTradePro MCP Server.
 * Handles environment variables for both Node.js and edge runtime environments.
 */

import type { Config } from '@auth0/auth0-mcp-js';
import type { Env } from './types.js';

function normalizeUrl(url: string): string {
  // Force https:// so that tokens issued for your domain validate correctly—
  // mismatched protocols will break JWT audience checks
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

function makeConfig(
  domain: string,
  tenant: string,
  serverUrl: string,
  audience: string,
  debugAuth: boolean
): Config {
  return {
    resourceServerUrl: new URL(normalizeUrl(serverUrl)),
    domain,
    tenant,
    resourceName: 'DemoTradePro MCP Server',
    scopesSupported: ['tool:portfolio', 'tool:stocks', 'tool:orders'],
    audience: normalizeUrl(audience),
    debugAuth,
  };
}

/**
 * Config getter for Auth0 MCP configuration.
 *
 * @param env The environment variables object
 */
export function createConfig(env: Env): Config {
  const { AUTH0_DOMAIN, AUTH0_TENANT, MCP_SERVER_URL, MCP_AUDIENCE, NODE_ENV } = env;

  if (!AUTH0_DOMAIN || !AUTH0_TENANT) {
    throw new Error('AUTH0_DOMAIN and AUTH0_TENANT are required');
  }

  if (!MCP_SERVER_URL) {
    throw new Error('MCP_SERVER_URL is required (use http://localhost:3004 for dev)');
  }

  if (!MCP_AUDIENCE) {
    throw new Error('MCP_AUDIENCE is required');
  }

  const debugAuth = NODE_ENV === 'development';

  return makeConfig(AUTH0_DOMAIN, AUTH0_TENANT, MCP_SERVER_URL, MCP_AUDIENCE, debugAuth);
}
