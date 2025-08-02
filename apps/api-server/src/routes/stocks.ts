import { Hono } from 'hono';
import { db } from '../db/client.js';
import { companies, quotes } from '../db/schema.js';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { updateStaleprices } from '../services/priceUpdater.js';
import { requireAuth, requireScopes, optionalAuth } from '../middleware/auth.js';

const app = new Hono();

// Get all stocks with latest quotes
app.get('/', async (c) => {
  try {
    // Update stale prices on-demand (much better than background process!)
    await updateStaleprices();
    const result = await db
      .select({
        symbol: companies.symbol,
        name: companies.name,
        price: quotes.price,
        updatedAt: quotes.createdAt
      })
      .from(companies)
      .leftJoin(quotes, eq(companies.id, quotes.companyId))
      .groupBy(companies.id, companies.symbol, companies.name, quotes.price, quotes.createdAt)
      .orderBy(companies.symbol);

    // For demo simplicity, just return the latest for each company
    const latestBySymbol = new Map();
    for (const row of result) {
      if (!latestBySymbol.has(row.symbol) || 
          (row.updatedAt && row.updatedAt > latestBySymbol.get(row.symbol).updatedAt)) {
        latestBySymbol.set(row.symbol, row);
      }
    }

    return c.json(Array.from(latestBySymbol.values()));
  } catch (error) {
    console.error('Error getting stocks:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get specific stock
app.get('/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol');
    const company = await db.query.companies.findFirst({ 
      where: (row, { eq }) => eq(row.symbol, symbol) 
    });
    
    if (!company) {
      return c.json({ error: 'Symbol not found' }, 404);
    }

    const quote = await db.query.quotes.findFirst({
      where: (row, { eq }) => eq(row.companyId, company.id),
      orderBy: (row) => [desc(row.createdAt)]
    });

    return c.json({ 
      symbol, 
      name: company.name,
      price: quote?.price, 
      updatedAt: quote?.createdAt 
    });
  } catch (error) {
    console.error('Error getting stock:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get stock price history
app.get('/:symbol/history', async (c) => {
  try {
    const symbol = c.req.param('symbol');
    const from = c.req.query('from');
    const to = c.req.query('to');
    
    const company = await db.query.companies.findFirst({ 
      where: (row, { eq }) => eq(row.symbol, symbol) 
    });
    
    if (!company) {
      return c.json({ error: 'Symbol not found' }, 404);
    }

    let whereConditions = [eq(quotes.companyId, company.id)];
    if (from) whereConditions.push(gte(quotes.createdAt, new Date(from)));
    if (to) whereConditions.push(lte(quotes.createdAt, new Date(to)));

    const history = await db
      .select({ price: quotes.price, at: quotes.createdAt })
      .from(quotes)
      .where(and(...whereConditions))
      .orderBy(desc(quotes.createdAt));

    return c.json(history);
  } catch (error) {
    console.error('Error getting stock history:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
