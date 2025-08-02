/**
 * Vercel API handler for DemoTradePro MCP Server.
 * This file is used when deploying to Vercel or running `pnpm start`.
 */

import { handle } from 'hono/vercel'
import app from '../src/server.js'

// Create Vercel handler with /api base path
const handler = handle(app.basePath('/api'));

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;
