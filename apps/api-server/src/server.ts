/**
 * DemoTradePro API Server configuration.
 * This module exports the main Hono application with all routes and middleware.
 */
import 'dotenv/config';
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import stockRoutes from './routes/stocks.js'
import orderRoutes from './routes/orders.js'
import portfolioRoutes from './routes/portfolio.js'

const app = new Hono().basePath('/api')

// CORS middleware to allow v0.dev and localhost
app.use('*', cors({
  origin: [
    'https://v0.dev',
    'https://preview.v0.dev', 
    'https://*.v0.dev',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3003', // Agent app
    'http://localhost:5173', // Vite dev server
    'http://localhost:4173', // Vite preview
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3003',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-auth0-token']
}))

// Health check endpoint
app.get('/ping', async (c) => {
  try {
    return c.json({ message: 'pong', timestamp: new Date().toISOString() })
  } catch (error) {
    return c.json({ error: 'Database not available' }, 500)
  }
})

// Stock routes
app.route('/stocks', stockRoutes)

// Order routes  
app.route('/orders', orderRoutes)

// Portfolio routes
app.route('/portfolio', portfolioRoutes)

export default app
