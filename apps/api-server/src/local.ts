/**
 * Entry point for DemoTradePro MCP Server in Node.js environment.
 * This file is used when running `pnpm dev` with tsx.
 */

import { serve } from '@hono/node-server'
import app from './server.js'

const port = 3001;
console.log(`🚀 DemoTradePro API Server running on port ${port}`)

serve({
  fetch: app.fetch,
  port
});