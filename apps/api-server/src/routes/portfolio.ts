import { Hono } from 'hono';
import { db } from '../db/client.js';
import { users, orders, companies } from '../db/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { requireAuth, requireScopes } from '../middleware/auth.js';

const app = new Hono();

// Get user's portfolio (cash + stock holdings)
app.get('/', requireAuth(), requireScopes('portfolio:read'), async (c) => {
  try {
    const user = c.get('user');
    
    // Ensure user exists in database
    let dbUser = await db.query.users.findFirst({
      where: (row, { eq }) => eq(row.id, user.sub)
    });
    
    if (!dbUser) {
      // Create user with initial balance
      [dbUser] = await db
        .insert(users)
        .values({
          id: user.sub,
          email: user.email,
          cashBalance: '10000.00'
        })
        .returning();
    }

    // Get stock holdings (aggregate buy/sell orders)
    const holdings = await db
      .select({
        symbol: companies.symbol,
        name: companies.name,
        totalShares: sql<number>`
          COALESCE(
            SUM(CASE WHEN ${orders.side} = 'BUY' THEN ${orders.quantity} ELSE -${orders.quantity} END), 
            0
          )
        `.as('total_shares')
      })
      .from(orders)
      .leftJoin(companies, eq(orders.companyId, companies.id))
      .where(eq(orders.userId, user.sub))
      .groupBy(companies.symbol, companies.name)
      .having(sql`SUM(CASE WHEN ${orders.side} = 'BUY' THEN ${orders.quantity} ELSE -${orders.quantity} END) > 0`);

    return c.json({
      cashBalance: dbUser.cashBalance,
      holdings: holdings.map(h => ({
        symbol: h.symbol,
        name: h.name,
        shares: h.totalShares
      }))
    });
  } catch (error) {
    console.error('Error getting portfolio:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
