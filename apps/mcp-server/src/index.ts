/**
 * Entry point for DemoTradePro MCP Server in Node.js environment.
 * This file is used when running `pnpm dev` with tsx.
 */

import { serve } from '@hono/node-server'
import app from './server.js'

const port = 3004
console.log(`🚀 DemoTradePro MCP Server running on port ${port}`)
console.log(`🔗 MCP endpoint: http://localhost:${port}/mcp`)
console.log(`🔍 Health check: http://localhost:${port}/ping`)

serve({
  fetch: app.fetch,
  port
})
