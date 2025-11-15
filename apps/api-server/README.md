# Fake Stock API Server

A demo stock trading API built with Node.js, TypeScript, Hono, and PostgreSQL using Drizzle ORM.

## Features

- 📈 Stock price tracking with fictional companies (WAYNE, STARK, LEX, OSC)
- 💹 Real-time price generation for demo purposes
- 📊 Order management system (BUY/SELL)
- 🗄️ PostgreSQL database with Drizzle ORM
- 🚀 Deployed on Vercel with Hono framework

## Quick Start

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up database:**

   ```bash
   # Copy environment file
   cp .env.example .env

   # Start PostgreSQL (from project root)
   docker-compose up -d

   # Push database migrations
   pnpm run db:push

   # Seed the database
   pnpm run db:seed
   ```

3. **Start development server:**
   ```bash
   pnpm run dev
   ```

## API Endpoints

- `GET /api/ping` - Health check
- `GET /api/stocks` - List all stocks with latest prices
- `GET /api/stocks/:symbol` - Get specific stock price
- `GET /api/stocks/:symbol/history` - Get price history
- `POST /api/orders` - Create a new order
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get specific order

## Testing

Run the test script to verify all endpoints:

```bash
./test_api.sh
```
