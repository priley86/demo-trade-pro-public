import { Hono } from 'hono'
import { cors } from 'hono/cors'
import stockRoutes from '../src/routes/stocks.js'
import orderRoutes from '../src/routes/orders.js'
import portfolioRoutes from '../src/routes/portfolio.js'

const app = new Hono().basePath('/api')

// CORS middleware to allow v0.dev and localhost
app.use('*', cors({
    origin: '*', // demo
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

export default app;