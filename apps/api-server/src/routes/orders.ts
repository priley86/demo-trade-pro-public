import { Hono } from 'hono';
import { db } from '../db/client.js';
import { companies, orders, users } from '../db/schema.js';
import { eq, sql, and } from 'drizzle-orm';
import { z } from 'zod';
import { requireAuth, requireScopes } from '../middleware/auth.js';

const app = new Hono();

const CreateOrderSchema = z.object({
  symbol: z.string(),
  side: z.enum(['BUY', 'SELL']),
  quantity: z.number().int().positive(),
  price: z.number().positive()
});

type CreateOrder = z.infer<typeof CreateOrderSchema>;

// Create a new order - requires authentication and trading permission
app.post('/', requireAuth(), requireScopes('trade:write'), async (c) => {
  try {
    const body = await c.req.json();
    const parse = CreateOrderSchema.safeParse(body);
    
    if (!parse.success) {
      return c.json({ error: 'Invalid request body', details: parse.error.message }, 400);
    }

    const { symbol, side, quantity, price } = parse.data as CreateOrder;
    const company = await db.query.companies.findFirst({ 
      where: (row, { eq }) => eq(row.symbol, symbol) 
    });
    
    if (!company) {
      return c.json({ error: 'Symbol not found' }, 404);
    }

    const user = c.get('user');
    
    // Ensure user exists and get balance
    let dbUser = await db.query.users.findFirst({
      where: (row, { eq }) => eq(row.id, user.sub)
    });
    
    if (!dbUser) {
      [dbUser] = await db
        .insert(users)
        .values({ id: user.sub, email: user.email })
        .returning();
    }

    const orderValue = quantity * price;
    
    // Check if user has enough cash for BUY orders
    if (side === 'BUY' && parseFloat(dbUser.cashBalance) < orderValue) {
      return c.json({ error: 'Insufficient funds' }, 400);
    }
    
    // For SELL orders, check if user has enough shares (simplified check)
    if (side === 'SELL') {
      const currentHoldings = await db
        .select({
          totalShares: sql<number>`
            COALESCE(
              SUM(CASE WHEN ${orders.side} = 'BUY' THEN ${orders.quantity} ELSE -${orders.quantity} END), 
              0
            )
          `.as('total_shares')
        })
        .from(orders)
        .where(and(
          eq(orders.userId, user.sub),
          eq(orders.companyId, company.id)
        ));
        
      const currentShares = currentHoldings[0]?.totalShares || 0;
      if (currentShares < quantity) {
        return c.json({ error: 'Insufficient shares' }, 400);
      }
    }

    const [order] = await db
      .insert(orders)
      .values({ 
        companyId: company.id,
        userId: user.sub,
        side, 
        quantity, 
        price: price.toString(), 
        status: 'FILLED'
      })
      .returning();
      
    // Update user's cash balance
    const balanceChange = side === 'BUY' ? -orderValue : orderValue;
    await db
      .update(users)
      .set({ 
        cashBalance: sql`${users.cashBalance} + ${balanceChange}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.sub));

    return c.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get order by ID - users can only see their own orders
app.get('/:id', requireAuth(), requireScopes('trade:read'), async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user');
    const order = await db.query.orders.findFirst({ 
      where: (row, { eq, and }) => and(
        eq(row.id, id),
        eq(row.userId, user.sub)
      )
    });
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    return c.json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get all orders for the authenticated user
app.get('/', requireAuth(), requireScopes('trade:read'), async (c) => {
  try {
    const user = c.get('user');
    const userOrders = await db
      .select({
        id: orders.id,
        symbol: companies.symbol,
        side: orders.side,
        quantity: orders.quantity,
        price: orders.price,
        status: orders.status,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt
      })
      .from(orders)
      .leftJoin(companies, eq(orders.companyId, companies.id))
      .where(eq(orders.userId, user.sub))
      .orderBy(orders.createdAt);

    return c.json(userOrders);
  } catch (error) {
    console.error('Error getting orders:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});



export default app;
